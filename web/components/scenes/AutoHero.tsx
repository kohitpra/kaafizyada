"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { hero } from "@/content/copy";
import { Monogram } from "@/components/ui/Logo";
import { HandArrow } from "@/components/ui/HandArrow";
import { FRAG, MAX_REGIONS, TRAIL, VERT } from "./revealShader";
import { HERO_SCENES, type Rect } from "./heroScenes";
import s from "./AutoHero.module.css";

gsap.registerPlugin(ScrollTrigger);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Scroll progress (0..1) -> every value the scene needs. One place to tune the choreography. */
function choreograph(p: number) {
  // The doors open onto the gully in ink: a slow walk in, then the colour paints the street.
  // Scene A and B share one illustration, so both zooms follow the same curve (no ghosting in the dissolve).
  const zoom = p < 0.42 ? 1 + 0.14 * ease(range(p, 0, 0.42)) : 1.14 - 0.14 * ease(range(p, 0.42, 0.7));
  return {
    zoomA: zoom,
    scene: ease(range(p, 0.38, 0.5)),
    zoomB: zoom,
    colour: range(p, 0.5, 0.9),
    colourA: 0.18 * range(p, 0.28, 0.42),
    speed: 0.35 * (1 - range(p, 0.3, 0.42)), // a gentle walking bob
    line1: 1 - range(p, 0.16, 0.26),
    hint: 1 - range(p, 0.02, 0.08),
    line2: range(p, 0.5, 0.55) * (1 - range(p, 0.72, 0.77)),
    line3: range(p, 0.78, 0.84),
    sign: range(p, 0.505, 0.56),
    word: range(p, 0.82, 0.92),
    cta: range(p, 0.9, 0.95),
  };
}

type GLState = {
  gl: WebGL2RenderingContext;
  prog: WebGLProgram;
  u: Record<string, WebGLUniformLocation | null>;
  sizes: { a: [number, number]; b: [number, number] };
};

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? "shader error");
  return sh;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.decoding = "async";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

/** Image uv -> CSS px inside the canvas, mirroring coverUv() in the shader. */
function uvToScreen(uv: [number, number], W: number, H: number, img: [number, number], focus: [number, number], zoom: number) {
  const rs = W / H, ri = img[0] / img[1];
  const scale = rs > ri ? [1, ri / rs] : [rs / ri, 1];
  const k = clamp((zoom - 1) * 1.2);
  let cx = 0.5 + (focus[0] - 0.5) * k, cy = 0.5 + (focus[1] - 0.5) * k;
  const hx = (scale[0] / zoom) * 0.5, hy = (scale[1] / zoom) * 0.5;
  cx = clamp(cx, hx, 1 - hx);
  cy = clamp(cy, hy, 1 - hy);
  const sx = ((uv[0] - cx) * zoom) / scale[0] + 0.5;
  const sy = ((uv[1] - cy) * zoom) / scale[1] + 0.5;
  return [sx * W, sy * H];
}

export function AutoHero() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sign = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"webgl" | "static" | "pending">("pending");
  const [ready, setReady] = useState(false);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTouch(window.matchMedia("(hover: none)").matches);
    const gl = !reduce ? canvas.current?.getContext("webgl2", { antialias: false, premultipliedAlpha: false }) : null;
    setMode(gl ? "webgl" : "static");
  }, []);

  useEffect(() => {
    if (mode !== "webgl" || !canvas.current || !root.current) return;
    const cv = canvas.current;
    const sec = root.current;
    const gl = cv.getContext("webgl2")!;
    let state: GLState | null = null;
    let raf = 0;
    let visible = true;
    let target = 0;
    let p = 0;
    let last = performance.now();
    const trail: [number, number, number][] = Array.from({ length: TRAIL }, () => [0, 0, 0]);
    let trailIdx = 0;
    let lastPush = 0;
    const portrait = () => cv.clientWidth / cv.clientHeight < 0.85;
    const scenes = HERO_SCENES;

    // ---------- GL setup ----------
    try {
      const prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "link error");
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const names = ["uTexA", "uTexB", "uRes", "uSizeA", "uSizeB", "uFocusA", "uFocusB", "uZoomA", "uZoomB", "uShift", "uScene", "uColour", "uColourA", "uWaveOrigin", "uRegions", "uRegionAt", "uRegionCount", "uTrail", "uLantern", "uTime"];
      const u = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(prog, n)]));
      state = { gl, prog, u, sizes: { a: [1, 1], b: [1, 1] } };
    } catch (e) {
      console.warn("[hero] WebGL unavailable, using static fallback", e);
      setMode("static");
      return;
    }

    const upload = (unit: number, img: HTMLImageElement) => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
    };

    const isPortrait = portrait();
    const A = isPortrait && scenes.a.portrait ? scenes.a.portrait : scenes.a;
    const B = isPortrait && scenes.b.portrait ? scenes.b.portrait : scenes.b;

    Promise.all([loadImage(A.src), loadImage(B.src)])
      .then(([ia, ib]) => {
        if (!state) return;
        upload(0, ia);
        upload(1, ib);
        state.sizes = { a: [ia.naturalWidth, ia.naturalHeight], b: [ib.naturalWidth, ib.naturalHeight] };
        const { u } = state;
        gl.uniform1i(u.uTexA, 0);
        gl.uniform1i(u.uTexB, 1);
        gl.uniform2f(u.uSizeA, ...state.sizes.a);
        gl.uniform2f(u.uSizeB, ...state.sizes.b);
        gl.uniform2f(u.uFocusA, ...A.focus);
        gl.uniform2f(u.uFocusB, ...B.focus);
        gl.uniform2f(u.uWaveOrigin, ...(B.waveOrigin ?? [0.5, 0.3]));
        const regs = (B.regions ?? []).slice(0, MAX_REGIONS);
        const flat = new Float32Array(MAX_REGIONS * 4);
        const at = new Float32Array(MAX_REGIONS);
        regs.forEach((r: Rect, i: number) => {
          flat.set([r.x0, r.y0, r.x1, r.y1], i * 4);
          at[i] = r.at;
        });
        gl.uniform4fv(u.uRegions, flat);
        gl.uniform1fv(u.uRegionAt, at);
        gl.uniform1i(u.uRegionCount, regs.length);
        setReady(true);
      })
      .catch(() => setMode("static"));

    // ---------- size ----------
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 1.75);
      cv.width = Math.round(cv.clientWidth * dpr);
      cv.height = Math.round(cv.clientHeight * dpr);
      gl.viewport(0, 0, cv.width, cv.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    // ---------- scroll ----------
    const st = ScrollTrigger.create({
      trigger: sec,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => (target = self.progress),
    });

    // ---------- lantern ----------
    const push = (clientX: number, clientY: number) => {
      const now = performance.now();
      if (now - lastPush < 24) return;
      lastPush = now;
      const r = cv.getBoundingClientRect();
      const x = (clientX - r.left) / r.width, y = (clientY - r.top) / r.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      trail[trailIdx] = [x, y, 1];
      trailIdx = (trailIdx + 1) % TRAIL;
    };
    const onPointer = (e: PointerEvent) => e.pointerType === "mouse" && push(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => push(e.touches[0].clientX, e.touches[0].clientY);
    sec.addEventListener("pointermove", onPointer);
    sec.addEventListener("touchmove", onTouch, { passive: true });
    sec.addEventListener("touchstart", onTouch, { passive: true });

    // ---------- render loop ----------
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        cancelAnimationFrame(raf);
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(sec);

    const trailFlat = new Float32Array(TRAIL * 3);
    const t0 = performance.now();

    function frame(now: number) {
      if (!visible || !state) return;
      const dt = Math.min(0.12, (now - last) / 1000);
      last = now;
      p += (target - p) * (1 - Math.exp(-dt * 7)); // critically damped follow
      const c = choreograph(p);
      const time = (now - t0) / 1000;
      const { u } = state;

      trail.forEach((t, i) => {
        t[2] = Math.max(0, t[2] - dt * 0.9);
        trailFlat.set(t, i * 3);
      });

      const bump = c.speed * (1 - c.scene);
      gl.uniform2f(u.uRes, cv.width, cv.height);
      gl.uniform1f(u.uZoomA, c.zoomA);
      gl.uniform1f(u.uZoomB, c.zoomB);
      gl.uniform2f(u.uShift, Math.sin(time * 1.7) * 0.002 * bump, (Math.sin(time * 9.3) * 0.0016 + Math.sin(time * 3.1) * 0.0012) * bump);
      gl.uniform1f(u.uScene, c.scene);
      gl.uniform1f(u.uColour, c.colour);
      gl.uniform1f(u.uColourA, c.colourA);
      gl.uniform3fv(u.uTrail, trailFlat);
      gl.uniform1f(u.uLantern, window.innerWidth < 768 ? 0.2 : 0.13);
      gl.uniform1f(u.uTime, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // DOM layers follow the same numbers
      sec.style.setProperty("--line1", String(c.line1));
      sec.style.setProperty("--hint", String(c.hint));
      sec.style.setProperty("--line2", String(c.line2));
      sec.style.setProperty("--line3", String(c.line3));
      sec.style.setProperty("--sign", String(c.sign));
      sec.style.setProperty("--word", String(c.word));
      sec.style.setProperty("--cta", String(c.cta));
      sec.style.setProperty("--scene", String(c.scene));
      sec.toggleAttribute("data-cta", c.cta > 0.02);

      // Pin the painted signboard to the illustration's blank board
      if (sign.current && B.sign) {
        const W = cv.clientWidth, H = cv.clientHeight;
        const [x0, y0] = uvToScreen([B.sign.x0, B.sign.y0], W, H, state.sizes.b, B.focus, c.zoomB);
        const [x1, y1] = uvToScreen([B.sign.x1, B.sign.y1], W, H, state.sizes.b, B.focus, c.zoomB);
        // On narrow screens the board is wider than the viewport: keep the painted part on screen.
        const cx0 = Math.max(x0, 10), cx1 = Math.min(x1, W - 10);
        sign.current.style.transform = `translate(${cx0}px, ${y0}px)`;
        sign.current.style.width = `${cx1 - cx0}px`;
        sign.current.style.height = `${y1 - y0}px`;
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      st.kill();
      sec.removeEventListener("pointermove", onPointer);
      sec.removeEventListener("touchmove", onTouch);
      sec.removeEventListener("touchstart", onTouch);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [mode]);

  const isStatic = mode === "static";

  return (
    <section ref={root} className={s.hero} data-mode={mode} data-ready={ready ? "" : undefined} aria-labelledby="hero-title">
      <div className={s.stage}>
        {isStatic ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={s.fallback} src={HERO_SCENES.b.src} alt="Four stylish women in desi street fashion walking down a colourful old Mumbai gully" />
        ) : (
          <canvas ref={canvas} className={s.canvas} role="img" aria-label="An illustrated black-and-white Mumbai gully that bursts into colour as you scroll, four women in KAAFIZYADA looks walking towards you" />
        )}

        {/* the shop's blank signboard gets painted cherry, then the wordmark draws on */}
        {!isStatic && HERO_SCENES.b.sign && (
          <div ref={sign} className={s.sign} aria-hidden>
            <div className={s.signPaint} />
            <div className={s.signWord}>
              <Monogram className={s.signMark} />
              <span className="poster">Kaafizyada</span>
            </div>
          </div>
        )}

        <div className={s.copy}>
          <h1 id="hero-title" className={s.srTitle}>
            KAAFIZYADA. {hero.sceneOne} {hero.sceneTwoA} {hero.sceneTwoB}
          </h1>

          <p className={`${s.line1} poster`} aria-hidden>
            {hero.sceneOne.split(" ").map((w, i) => (
              <span key={i} style={{ ["--i" as string]: i }}>
                {w}{" "}
              </span>
            ))}
          </p>

          <p className={`${s.hint} hand`} aria-hidden>
            {touch ? hero.sceneOneHint.touch : hero.sceneOneHint.pointer}
          </p>

          <p className={`${s.line2} poster`} aria-hidden>
            <span>And then came</span>
            <span className={s.big}>Kaafizyada.</span>
          </p>

          <p className={`${s.line3} poster`} aria-hidden>
            <span>A little more colour.</span>
            <span>A lot more character.</span>
          </p>

          <div className={s.cta}>
            <a href="#corners" className="btn btn--cream">
              {hero.cta} <HandArrow className={s.ctaArrow} direction="down" />
            </a>
            <p className="hand">Desi with a little extra.</p>
          </div>
        </div>

        <a href="#shop" className={s.skip}>
          {hero.skip} →
        </a>
        <div className={s.meter} aria-hidden>
          <span />
        </div>
      </div>
    </section>
  );
}
