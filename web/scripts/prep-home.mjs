// Converts the generated home-page art (../art/generated) into web images in public/assets/home.
import sharp from "sharp";
import { existsSync } from "node:fs";
const SRC = "../art/generated";
const OUT = "public/assets/home";
const files = ["corner-chai", "corner-auto", "corner-masterji", "corner-platform", "corner-bangles", "story-1", "story-2", "story-3"];
for (const f of files) {
  const src = `${SRC}/kz-${f}.png`;
  if (!existsSync(src)) { console.log("missing", f); continue; }
  await sharp(src).resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toFile(`${OUT}/${f}.webp`);
  console.log("ok", f);
}
