// Scene configuration for the gully hero (shown after the entrance gate).
// All coordinates are in image uv (0–1, origin top-left). Swap artwork here; the shader and
// choreography read everything from this file.

export type Rect = { x0: number; y0: number; x1: number; y1: number; at: number };

export type SceneImage = {
  src: string;
  /** Point the camera pushes towards. */
  focus: [number, number];
  /** Where the colour wave starts (scene B). */
  waveOrigin?: [number, number];
  /** Areas that paint in at a given colour progress (scene B). */
  regions?: Rect[];
  /** Optional blank signboard that gets painted cherry and receives the wordmark (scene B). */
  sign?: { x0: number; y0: number; x1: number; y1: number };
};

const STREET = "/assets/gate/street.webp";

// Scene A and B are the same gully: the doors open onto it in ink (A), then scroll paints it (B).
export const HERO_SCENES: { a: SceneImage & { portrait?: SceneImage }; b: SceneImage & { portrait?: SceneImage } } = {
  a: { src: STREET, focus: [0.5, 0.55] },
  b: {
    src: STREET,
    focus: [0.5, 0.55],
    waveOrigin: [0.5, 0.5],
    regions: [
      { x0: 0.225, y0: 0.26, x1: 0.38, y1: 0.98, at: 0.08 }, // halter + olive palazzo
      { x0: 0.37, y0: 0.26, x1: 0.515, y1: 0.98, at: 0.18 }, // saree + denim jacket
      { x0: 0.5, y0: 0.26, x1: 0.655, y1: 0.98, at: 0.28 }, // jamun kurta
      { x0: 0.635, y0: 0.26, x1: 0.775, y1: 0.98, at: 0.38 }, // corset + wrap skirt
      { x0: 0.0, y0: 0.0, x1: 0.24, y1: 1.0, at: 0.5 }, // chai tapri + fabric shop
      { x0: 0.77, y0: 0.0, x1: 1.0, y1: 1.0, at: 0.6 }, // fruit + marigold cart
      { x0: 0.22, y0: 0.0, x1: 0.78, y1: 0.27, at: 0.7 }, // bunting + buildings
    ],
  },
};
