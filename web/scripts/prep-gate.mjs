// Prepares the entrance-gate textures from the generated art in ../art/generated.
//  - facade: the flat black arch is flood-filled to transparent (alpha) so the doors show through
//  - doors: split down the centre seam into a left and a right leaf
//  - street: the scene behind the doors (also used by the colour-reveal hero)
import sharp from "sharp";
const SRC = "../art/generated";
const OUT = "public/assets/gate";

async function facade() {
  const img = sharp(`${SRC}/kz-gate-facade.png`).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const dark = (i) => data[i] < 40 && data[i + 1] < 40 && data[i + 2] < 40;
  const seen = new Uint8Array(W * H);
  const stack = [[Math.round(W / 2), Math.round(H * 0.6)]];
  let n = 0;
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const k = y * W + x;
    if (seen[k]) continue;
    seen[k] = 1;
    if (!dark(k * 4)) continue;
    data[k * 4 + 3] = 0;
    n++;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  // soften the cut edge by one pixel
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const k = (y * W + x) * 4;
    if (data[k + 3] === 0) continue;
    const t = [k - 4, k + 4, k - W * 4, k + W * 4].filter((j) => data[j + 3] === 0).length;
    if (t) data[k + 3] = 255 - t * 50;
  }
  // bounds of the opening, for placing the doors
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] === 0) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  await sharp(data, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 88, alphaQuality: 90 }).toFile(`${OUT}/facade.webp`);
  console.log("facade cleared", n, "px; opening uv", { x0: x0 / W, x1: x1 / W, y0: y0 / H, y1: y1 / H }, W, H);
}

async function doors() {
  const m = await sharp(`${SRC}/kz-gate-doors.png`).metadata();
  const half = Math.floor(m.width / 2);
  await sharp(`${SRC}/kz-gate-doors.png`).extract({ left: 0, top: 0, width: half, height: m.height }).webp({ quality: 88 }).toFile(`${OUT}/door-left.webp`);
  await sharp(`${SRC}/kz-gate-doors.png`).extract({ left: half, top: 0, width: m.width - half, height: m.height }).webp({ quality: 88 }).toFile(`${OUT}/door-right.webp`);
  console.log("doors", m.width, m.height);
}

async function street() {
  await sharp(`${SRC}/kz-street.png`).webp({ quality: 86 }).toFile(`${OUT}/street.webp`);
  await sharp(`${SRC}/kz-street.png`).resize({ width: 900 }).webp({ quality: 80 }).toFile(`${OUT}/street-900.webp`);
}

await facade();
await doors();
await street();
