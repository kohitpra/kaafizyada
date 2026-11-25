// The colour-reveal engine for the hero.
// One full-screen quad, two illustrations (scene A: the auto ride, scene B: the shop).
// Each pixel is drawn in ink-monochrome or full colour depending on a mask built from:
//   1. a colour "wave" that spreads out from a point (the signboard),
//   2. up to 8 rectangular regions that paint in at their own moment in the scroll,
//   3. a cursor/finger "lantern" trail.
// All mask edges are roughened with value noise so they read as brush strokes, not circles.

export const VERT = /* glsl */ `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

export const MAX_REGIONS = 8;
export const TRAIL = 10;

export const FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform vec2 uRes;          // canvas size in px
uniform vec2 uSizeA;        // image A size in px
uniform vec2 uSizeB;
uniform vec2 uFocusA;       // zoom focus in image-A uv
uniform vec2 uFocusB;
uniform float uZoomA;
uniform float uZoomB;
uniform vec2 uShift;        // small camera bump in screen uv
uniform float uScene;       // 0 = A, 1 = B (noisy dissolve between)
uniform float uColour;      // colour progress in scene B (0..1)
uniform float uColourA;     // ambient colour leak in scene A (0..1)
uniform vec2 uWaveOrigin;   // in image-B uv
uniform vec4 uRegions[${MAX_REGIONS}];   // xy0, xy1 in image-B uv
uniform float uRegionAt[${MAX_REGIONS}]; // colour progress at which region starts painting
uniform int uRegionCount;
uniform vec3 uTrail[${TRAIL}];           // xy = screen uv, z = strength 0..1
uniform float uLantern;     // lantern radius (fraction of min side)
uniform float uTime;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

// cover-fit screen uv -> image uv, zoomed around a focus point
vec2 coverUv(vec2 uv, vec2 img, vec2 focus, float zoom) {
  float rs = uRes.x / uRes.y, ri = img.x / img.y;
  vec2 scale = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  vec2 p = (uv - 0.5) * scale / zoom;
  // keep the focus point in view while zooming, without leaving the image
  vec2 c = mix(vec2(0.5), focus, clamp((zoom - 1.0) * 1.2, 0.0, 1.0));
  vec2 hs = scale / zoom * 0.5;
  c = clamp(c, hs, 1.0 - hs);
  return c + p;
}

vec3 ink(vec3 c) {
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  l = smoothstep(0.04, 0.96, l);               // lift contrast like a photocopy
  l = pow(l, 0.92);
  vec3 paper = vec3(0.985, 0.975, 0.93);
  vec3 inkc = vec3(0.11, 0.08, 0.07);
  return mix(inkc, paper, l);
}

float lantern(vec2 suv) {
  float m = 0.0;
  float aspect = uRes.x / uRes.y;
  for (int i = 0; i < ${TRAIL}; i++) {
    vec3 t = uTrail[i];
    if (t.z <= 0.001) continue;
    vec2 d = (suv - t.xy) * vec2(aspect, 1.0);
    float r = uLantern * (0.55 + 0.45 * t.z) * (aspect > 1.0 ? 1.0 : aspect * 1.6);
    float n = fbm(suv * 9.0 + float(i) * 3.1 + uTime * 0.15) * 0.55;
    float e = length(d) / r + n * 0.5;
    m = max(m, (1.0 - smoothstep(0.55, 0.95, e)) * t.z);
  }
  return m;
}

void main() {
  vec2 suv = vUv;
  suv.y = 1.0 - suv.y;                // image space: y down
  vec2 suvS = suv + uShift;

  vec2 uvA = coverUv(suvS, uSizeA, uFocusA, uZoomA);
  vec2 uvB = coverUv(suvS, uSizeB, uFocusB, uZoomB);
  vec3 colA = texture(uTexA, uvA).rgb;
  vec3 colB = texture(uTexB, uvB).rgb;

  float lan = lantern(suv);

  // ---- scene A: mostly ink, a whisper of colour + lantern
  float mA = max(lan, uColourA * smoothstep(0.35, 0.75, fbm(uvA * 5.0)));
  vec3 outA = mix(ink(colA), colA, mA);

  // ---- scene B: wave + regions + lantern
  float aspectB = uSizeB.x / uSizeB.y;
  float nB = fbm(uvB * 7.0);
  vec2 dv = (uvB - uWaveOrigin) * vec2(aspectB, 1.0);
  float wave = pow(clamp((uColour - 0.1) / 0.9, 0.0, 1.0), 1.3) * 2.1;      // radius grows with colour progress
  float mWave = 1.0 - smoothstep(wave - 0.10, wave + 0.02, length(dv) + nB * 0.22);

  float mReg = 0.0;
  float lock = 0.0;   // regions whose moment hasn't come yet stay in ink, even if the wave passed
  for (int i = 0; i < ${MAX_REGIONS}; i++) {
    if (i >= uRegionCount) break;
    vec4 r = uRegions[i];
    vec2 e = smoothstep(r.xy - 0.012, r.xy + 0.012, uvB) * (1.0 - smoothstep(r.zw - 0.012, r.zw + 0.012, uvB));
    float inside = e.x * e.y;
    float p = clamp((uColour - uRegionAt[i]) / 0.11, 0.0, 1.0);
    // brush fill: paint from bottom of the region upwards with a noisy edge
    float rh = (uvB.y - r.y) / max(r.w - r.y, 0.001);
    float fill = smoothstep(p * 1.35 - 0.12, p * 1.35, (1.0 - rh) + fbm(uvB * 18.0 + float(i)) * 0.3);
    mReg = max(mReg, inside * (1.0 - fill) * step(0.001, p));
    lock = max(lock, inside * (1.0 - step(0.001, p)));
  }
  mWave *= 1.0 - lock;
  float mB = clamp(max(max(mWave, mReg), lan), 0.0, 1.0);
  vec3 outB = mix(ink(colB), colB, mB);

  // final burst: slight saturation lift once everything has colour
  float burst = smoothstep(0.86, 1.0, uColour);
  float lb = dot(outB, vec3(0.299, 0.587, 0.114));
  outB = mix(outB, mix(vec3(lb), outB, 1.18), burst * mB);

  // ---- scene dissolve A -> B (noisy, like ink soaking through paper)
  float dn = fbm(suv * 4.0 + 7.0);
  float t = smoothstep(uScene * 1.3 - 0.3, uScene * 1.3, dn);
  vec3 col = mix(outB, outA, t);

  // paper grain + soft vignette
  float g = hash(suv * uRes + fract(uTime) * 13.0) - 0.5;
  col += g * 0.035;
  vec2 v = suv - 0.5;
  col *= 1.0 - dot(v, v) * 0.35;

  outColor = vec4(col, 1.0);
}`;
