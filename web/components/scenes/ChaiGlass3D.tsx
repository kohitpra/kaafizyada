"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The one 3D moment: a fluted cutting-chai glass with rising steam and three bangles orbiting it.
 * Everything is procedural (no model download). three.js is loaded only when the section
 * approaches the viewport, and the loop pauses off-screen. Decorative: aria-hidden.
 */
export function ChaiGlass3D({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let dispose: (() => void) | undefined;
    let started = false;

    const io = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting || started) return;
        started = true;
        io.disconnect();
        try {
          dispose = await mount(el);
        } catch (err) {
          console.warn("[chai] 3D unavailable", err);
          setFailed(true);
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      dispose?.();
    };
  }, []);

  return <div ref={host} className={className} aria-hidden data-failed={failed ? "" : undefined} />;
}

async function mount(el: HTMLElement) {
  const THREE = await import("three");
  const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 1.4, 9);
  camera.lookAt(0, 0.2, 0);

  const key = new THREE.DirectionalLight(0xfff1d6, 2.2);
  key.position.set(3, 5, 4);
  scene.add(key, new THREE.AmbientLight(0xffe7cf, 0.5));

  const rig = new THREE.Group();
  scene.add(rig);

  // --- the glass: fluted, slightly tapered, thick base
  const H = 2.4, rTop = 1.0, rBot = 0.74, flutes = 14;
  const glassGeo = new THREE.CylinderGeometry(rTop, rBot, H, flutes, 1, true);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0.04, transmission: 1, thickness: 0.25, ior: 1.5,
    transparent: true, opacity: 1, side: THREE.DoubleSide, flatShading: true, envMapIntensity: 1.4,
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  rig.add(glass);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(rBot, rBot * 0.98, 0.28, flutes), glassMat);
  base.position.y = -H / 2 + 0.14;
  rig.add(base);

  // --- chai: milky amber with a lighter, frothy top
  const fill = 0.68;
  const chaiH = H * fill - 0.3;
  const rChaiTop = rBot + (rTop - rBot) * fill - 0.06;
  const chai = new THREE.Mesh(
    new THREE.CylinderGeometry(rChaiTop, rBot - 0.06, chaiH, 40),
    new THREE.MeshStandardMaterial({ color: 0xb8743f, roughness: 0.35, metalness: 0 }),
  );
  chai.position.y = -H / 2 + 0.28 + chaiH / 2;
  rig.add(chai);
  const froth = new THREE.Mesh(new THREE.CircleGeometry(rChaiTop, 40), new THREE.MeshStandardMaterial({ color: 0xd9a46b, roughness: 0.6 }));
  froth.rotation.x = -Math.PI / 2;
  froth.position.y = chai.position.y + chaiH / 2 + 0.001;
  rig.add(froth);

  // --- steam: soft sprites drifting up
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const puffTex = new THREE.CanvasTexture(c);
  const puffs: { s: InstanceType<typeof THREE.Sprite>; t: number; x: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0 }));
    s.scale.setScalar(0.6);
    scene.add(s);
    puffs.push({ s, t: Math.random(), x: (Math.random() - 0.5) * 0.8 });
  }

  // --- bangles orbiting: brass, marigold glass, cherry glass
  const bangles = [0xb59a6d, 0xf38c02, 0x750505].map((col, i) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.07, 18, 64),
      i === 0
        ? new THREE.MeshStandardMaterial({ color: col, metalness: 1, roughness: 0.25 })
        : new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.12, clearcoat: 1, metalness: 0.1 }),
    );
    scene.add(m);
    return m;
  });

  // --- interaction
  let tx = 0, ty = 0, rx = 0, ry = 0;
  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const resize = () => {
    const w = el.clientWidth, h = el.clientHeight;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(el);

  let visible = true, raf = 0;
  const vis = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !reduce) raf = requestAnimationFrame(loop);
  });
  vis.observe(el);

  const clock = new THREE.Clock();
  function render(t: number) {
    rx += (ty * 0.25 - rx) * 0.06;
    ry += (tx * 0.6 - ry) * 0.06;
    rig.rotation.set(0.12 + rx, t * 0.35 + ry, 0);
    rig.position.y = Math.sin(t * 1.2) * 0.08;
    bangles.forEach((b, i) => {
      const a = t * 0.6 + (i * Math.PI * 2) / 3;
      b.position.set(Math.cos(a) * 2.05, Math.sin(a * 1.3 + i) * 0.5 - 0.1, Math.sin(a) * 1.3);
      b.rotation.set(t * 0.8 + i, t * 0.5 + i * 2, 0);
    });
    puffs.forEach((p) => {
      p.t = (p.t + 0.004) % 1;
      p.s.position.set(p.x + Math.sin(t * 1.5 + p.x * 9) * 0.25 * p.t, rig.position.y + H / 2 + p.t * 2.2, Math.cos(p.x * 7) * 0.2);
      p.s.scale.setScalar(0.4 + p.t * 1.2);
      (p.s.material as InstanceType<typeof THREE.SpriteMaterial>).opacity = Math.sin(p.t * Math.PI) * 0.32;
    });
    renderer.render(scene, camera);
  }
  function loop() {
    if (!visible) return;
    render(clock.getElapsedTime());
    raf = requestAnimationFrame(loop);
  }
  if (reduce) render(1.2);
  else raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    vis.disconnect();
    ro.disconnect();
    window.removeEventListener("pointermove", onMove);
    scene.traverse((o) => {
      const m = o as InstanceType<typeof THREE.Mesh>;
      m.geometry?.dispose?.();
      const mat = m.material as { dispose?: () => void } | undefined;
      mat?.dispose?.();
    });
    puffTex.dispose();
    envTex.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
