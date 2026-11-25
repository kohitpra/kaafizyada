// Paint-reveal material for the entrance gate.
// Adapted from ITom's PaintRevealMaterial (github.com/ITomPoland/portfolio-itom, MIT, © 2026 Tomasz Szmajda):
// the same top-down brush wipe (mask = (1 - uv.y) + noise, compared against uProgress), but instead of
// blending two pre-drawn textures we derive the ink "sketch" from the colour art in the shader,
// so one illustration serves as both states.
import * as THREE from "three";

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragment = /* glsl */ `
uniform sampler2D uMap;
uniform float uProgress;   // 0 = ink sketch, 1 = full colour
uniform float uSeed;
uniform float uEdge;       // > 0 fades the outer border into the paper (soft, ragged)
uniform float uOpacity;
uniform vec2 uRepeat;      // uv window into the texture (for door leaves cut from one sheet)
uniform vec2 uOffset;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 4.1414))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
vec3 ink(vec3 c) {
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  l = smoothstep(0.04, 0.96, l);
  l = pow(l, 0.92);
  return mix(vec3(0.11, 0.08, 0.07), vec3(0.985, 0.975, 0.93), l);
}

void main() {
  vec2 uv = uOffset + vUv * uRepeat;
  vec4 tex = texture2D(uMap, uv);
  // ITom brush wipe: long horizontal strokes, painted from the top down
  float n = noise(vec2(vUv.x * 7.0 + uSeed, vUv.y * 42.0)) * 0.6 + noise(vUv * 18.0 + uSeed) * 0.4;
  float mask = (1.0 - vUv.y) + n * 0.18;
  float t = uProgress * 1.32;
  float paint = 1.0 - smoothstep(t - 0.06, t, mask);
  vec3 col = mix(ink(tex.rgb), tex.rgb, paint);

  float a = tex.a * uOpacity;
  if (uEdge > 0.0) {
    vec2 d = min(vUv, 1.0 - vUv);
    float rag = noise(vUv * 26.0 + uSeed) * 0.5 * uEdge;
    a *= smoothstep(0.0, uEdge, min(d.x, d.y) - rag * 0.5 + uEdge * 0.25);
  }
  if (a < 0.01) discard;
  gl_FragColor = vec4(col, a);
}`;

export function makeGateMaterial(map: THREE.Texture, opts: { seed?: number; edge?: number; repeat?: [number, number]; offset?: [number, number] } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    uniforms: {
      uMap: { value: map },
      uProgress: { value: 0 },
      uSeed: { value: opts.seed ?? 0 },
      uEdge: { value: opts.edge ?? 0 },
      uOpacity: { value: 1 },
      uRepeat: { value: new THREE.Vector2(...(opts.repeat ?? [1, 1])) },
      uOffset: { value: new THREE.Vector2(...(opts.offset ?? [0, 0])) },
    },
  });
}
