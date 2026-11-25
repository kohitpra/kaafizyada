"use client";

// The entrance gate: a 3D haveli doorway you knock on to enter the site.
// Interaction model ported from ITom's entrance (github.com/ITomPoland/portfolio-itom, MIT, © 2026 Tomasz Szmajda):
//   hover the doors  -> the drawing paints itself in (brush wipe) and the leaves swing ajar (±0.08 rad)
//   click / tap      -> the leaves swing open (∓π·0.55, 0.9 s) and the camera flies through the doorway
//   the signboard    -> sways on its ropes, rotation.x = sin(t·2)·0.05
// Art: generated for KAAFIZYADA (art/generated, processed by scripts/prep-gate.mjs).

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { makeGateMaterial } from "./gateMaterial";

// Facade is 6 x 4 world units. The transparent arch opening (measured by prep-gate.mjs) in facade uv:
const FW = 6, FH = 4;
const OPEN = { x0: 0.327, x1: 0.661, y0: 0.177, y1: 0.999 };
const ox0 = -FW / 2 + OPEN.x0 * FW, ox1 = -FW / 2 + OPEN.x1 * FW;
const oyTop = FH / 2 - OPEN.y0 * FH, oyBot = FH / 2 - OPEN.y1 * FH;
const DOOR_CX = (ox0 + ox1) / 2;
const LEAF_W = (ox1 - ox0) / 2 + 0.05; // a little overlap hides behind the carved frame
const DOOR_H = oyTop - oyBot + 0.08;
const DOOR_CY = (oyTop + oyBot) / 2 + 0.02;
const DOOR_Z = -0.07;
const STREET_Z = -7;
const START_Z = 7.2;
const END_Z = -2.3;
const CAM_Y = -0.45; // camera sits low so the gate rides in the upper part of the frame

export type GateApi = { enter: () => void };

type Props = {
  onReady: () => void;
  onHover: (on: boolean) => void;
  onEntered: () => void;
  /** Called when the doors are clicked; the parent decides (it also fades its own copy). */
  onKnock: () => void;
  apiRef: React.MutableRefObject<GateApi | null>;
};

function fitDistance(aspect: number, fov: number) {
  // frame the facade + sign on landscape, the doors on portrait
  const t = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  // the lower band of the screen is left for the "Knock knock" copy
  const needW = aspect < 0.8 ? 3.5 : 6.8;
  const needH = 7.0;
  return Math.max(needH / (2 * t), needW / (2 * t * aspect));
}

function useSignTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const tex = new THREE.CanvasTexture(c);
    const draw = () => {
      const g = c.getContext("2d")!;
      const css = getComputedStyle(document.documentElement);
      const poster = css.getPropertyValue("--ff-anton").trim() || "Impact";
      const hand = css.getPropertyValue("--ff-kalam").trim() || "cursive";
      g.fillStyle = "#750505";
      g.fillRect(0, 0, 1024, 256);
      g.strokeStyle = "#FBFCEB";
      g.lineWidth = 8;
      g.strokeRect(18, 18, 988, 220);
      g.strokeStyle = "#FFC50C";
      g.lineWidth = 3;
      g.strokeRect(32, 32, 960, 192);
      g.fillStyle = "#FBFCEB";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `400 132px ${poster}`;
      g.fillText("KAAFIZYADA", 512, 116);
      g.fillStyle = "#FFC50C";
      g.font = `700 34px ${hand}`;
      g.fillText("desi with a little extra", 512, 196);
      // little brass nails in the corners
      g.fillStyle = "#B59A6D";
      for (const [x, y] of [[48, 48], [976, 48], [48, 208], [976, 208]]) {
        g.beginPath();
        g.arc(x, y, 9, 0, Math.PI * 2);
        g.fill();
      }
      tex.needsUpdate = true;
    };
    draw();
    document.fonts?.ready.then(draw);
    return tex;
  }, []);
}

function Gate({ onReady, onHover, onEntered, onKnock, apiRef }: Props) {
  const [facadeTex, leftTex, rightTex, streetTex] = useLoader(THREE.TextureLoader, [
    "/assets/gate/facade.webp",
    "/assets/gate/door-left.webp",
    "/assets/gate/door-right.webp",
    "/assets/gate/street.webp",
  ]);
  const signTex = useSignTexture();
  const { camera, size, gl } = useThree();

  const mats = useMemo(() => {
    [facadeTex, leftTex, rightTex, streetTex].forEach((t) => {
      t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      t.generateMipmaps = true;
    });
    return {
      facade: makeGateMaterial(facadeTex, { seed: 1.3, edge: 0.07 }),
      left: makeGateMaterial(leftTex, { seed: 4.1 }),
      right: makeGateMaterial(rightTex, { seed: 7.7 }),
      sign: makeGateMaterial(signTex, { seed: 2.2 }),
      street: makeGateMaterial(streetTex, { seed: 9.9 }),
      side: new THREE.MeshBasicMaterial({ color: "#4e0303" }),
      back: new THREE.MeshBasicMaterial({ color: "#3a0202" }),
      rope: new THREE.MeshBasicMaterial({ color: "#1c120f" }),
    };
  }, [facadeTex, leftTex, rightTex, streetTex, signTex, gl]);

  const leftHinge = useRef<THREE.Group>(null);
  const rightHinge = useRef<THREE.Group>(null);
  const sign = useRef<THREE.Group>(null);
  const state = useRef({ hover: 0, hoverTarget: 0, paint: 0, paintTarget: 0, open: 0, entering: false, baseZ: START_Z, fly: 0 });

  // camera framing follows the viewport
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const d = fitDistance(size.width / size.height, cam.fov);
    state.current.baseZ = d;
    if (!state.current.entering) cam.position.set(DOOR_CX, CAM_Y, d);
  }, [camera, size]);

  useEffect(() => {
    onReady();
    // the drawing starts to colour itself a moment after load, then waits for a knock
    const id = window.setTimeout(() => (state.current.paintTarget = Math.max(state.current.paintTarget, 0.18)), 500);
    return () => window.clearTimeout(id);
  }, [onReady]);

  useEffect(() => {
    apiRef.current = {
      enter: () => {
        const s = state.current;
        if (s.entering) return;
        s.entering = true;
        s.paintTarget = 1;
        const cam = camera as THREE.PerspectiveCamera;
        const tl = gsap.timeline({ onComplete: onEntered });
        tl.to(s, { open: 1, duration: 1.15, ease: "power2.inOut" }, 0.15)
          .to(cam.position, { z: END_Z, y: DOOR_CY + 0.05, x: DOOR_CX, duration: 2.1, ease: "power2.inOut" }, 0.45)
          .to(s, { fly: 1, duration: 2.1, ease: "power2.inOut" }, 0.45);
      },
    };
  }, [apiRef, camera, onEntered]);

  useFrame((st, dt) => {
    const s = state.current;
    const k = 1 - Math.exp(-dt * 6);
    s.hover += (s.hoverTarget - s.hover) * k;
    s.paint += (s.paintTarget - s.paint) * (1 - Math.exp(-dt * 2.6));
    const t = st.clock.elapsedTime;

    // leaves: ajar on hover, wide open on enter (inward, away from the camera)
    const ang = s.hover * 0.08 * (1 - s.open) + s.open * Math.PI * 0.55;
    if (leftHinge.current) leftHinge.current.rotation.y = ang;
    if (rightHinge.current) rightHinge.current.rotation.y = -ang;

    // staggered paint: doors lead, the wall and sign follow
    mats.left.uniforms.uProgress.value = THREE.MathUtils.clamp(s.paint * 1.25, 0, 1);
    mats.right.uniforms.uProgress.value = THREE.MathUtils.clamp(s.paint * 1.25 - 0.05, 0, 1);
    mats.facade.uniforms.uProgress.value = THREE.MathUtils.clamp(s.paint * 1.2 - 0.18, 0, 1);
    mats.sign.uniforms.uProgress.value = THREE.MathUtils.clamp(s.paint * 1.3 - 0.1, 0, 1);
    // the street behind stays in ink: the colour arrives as you scroll the gully
    mats.street.uniforms.uProgress.value = 0;
    // hidden until the doors part, so it never peeks out around the wall
    mats.street.uniforms.uOpacity.value = THREE.MathUtils.smoothstep(s.open, 0.02, 0.35);

    if (sign.current) {
      sign.current.rotation.x = Math.sin(t * 2) * 0.05 * (1 + s.hover * 0.6 + s.open * 1.5);
      sign.current.rotation.z = Math.sin(t * 1.3) * 0.01;
    }

    // gentle idle drift + pointer parallax before entering
    if (!s.entering) {
      const cam = st.camera as THREE.PerspectiveCamera;
      const px = st.pointer.x * 0.18, py = st.pointer.y * 0.1;
      cam.position.x += (DOOR_CX + px - cam.position.x) * k * 0.5;
      cam.position.y += (CAM_Y + py - cam.position.y) * k * 0.5;
      cam.position.z = s.baseZ + Math.sin(t * 0.6) * 0.05;
    }
    st.camera.lookAt(st.camera.position.x * (1 - s.fly) + DOOR_CX * s.fly, CAM_Y * (1 - s.fly) + DOOR_CY * s.fly, STREET_Z);
  });

  const hoverOn = () => {
    const s = state.current;
    s.hoverTarget = 1;
    s.paintTarget = 1;
    onHover(true);
  };
  const hoverOff = () => {
    state.current.hoverTarget = 0;
    onHover(false);
  };
  const knock = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onKnock();
  };

  const signY = FH / 2 + 0.42;
  const leafGeo = useMemo(() => new THREE.BoxGeometry(LEAF_W, DOOR_H, 0.08), []);
  const leafMatsL = useMemo(() => [mats.side, mats.side, mats.side, mats.side, mats.left, mats.back], [mats]);
  const leafMatsR = useMemo(() => [mats.side, mats.side, mats.side, mats.side, mats.right, mats.back], [mats]);

  return (
    <>
      <color attach="background" args={["#f3eedb"]} />
      <fog attach="fog" args={["#f3eedb", 16, 34]} />

      {/* the gully behind the doors, waiting in ink */}
      <mesh position={[DOOR_CX, DOOR_CY, STREET_Z]} material={mats.street} renderOrder={0}>
        <planeGeometry args={[12, 8]} />
      </mesh>

      {/* door leaves, hinged at the outer edges of the arch */}
      <group ref={leftHinge} position={[DOOR_CX - LEAF_W, DOOR_CY, DOOR_Z]}>
        <mesh position={[LEAF_W / 2, 0, 0]} geometry={leafGeo} material={leafMatsL} onPointerOver={hoverOn} onPointerOut={hoverOff} onClick={knock} />
      </group>
      <group ref={rightHinge} position={[DOOR_CX + LEAF_W, DOOR_CY, DOOR_Z]}>
        <mesh position={[-LEAF_W / 2, 0, 0]} geometry={leafGeo} material={leafMatsR} onPointerOver={hoverOn} onPointerOut={hoverOff} onClick={knock} />
      </group>

      {/* the wall with its transparent arch */}
      <mesh position={[0, 0, 0]} material={mats.facade} renderOrder={2}>
        <planeGeometry args={[FW, FH]} />
      </mesh>

      {/* signboard swinging on two ropes */}
      <group ref={sign} position={[DOOR_CX, signY + 0.9, 0.35]}>
        <mesh position={[0, -0.9, 0]} material={mats.sign} renderOrder={3}>
          <planeGeometry args={[2.6, 0.65]} />
        </mesh>
        <mesh position={[-1.0, -0.28, 0]} material={mats.rope}>
          <cylinderGeometry args={[0.012, 0.012, 0.6, 6]} />
        </mesh>
        <mesh position={[1.0, -0.28, 0]} material={mats.rope}>
          <cylinderGeometry args={[0.012, 0.012, 0.6, 6]} />
        </mesh>
      </group>
    </>
  );
}

export default function GateScene(props: Props) {
  return (
    <Canvas
      flat
      linear
      dpr={[1, 1.75]}
      camera={{ fov: 42, near: 0.1, far: 60, position: [DOOR_CX, CAM_Y, START_Z] }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor("#f3eedb")}
    >
      <Suspense fallback={null}>
        <Gate {...props} />
      </Suspense>
    </Canvas>
  );
}
