// Cuts interim art from the client illustrations (see scripts/crops.json) and upscales it for the web.
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const spec = JSON.parse(readFileSync("scripts/crops.json", "utf8"));
for (const [src, [left, top, width, height], dest] of spec.crops) {
  const out = join("public/assets", dest);
  mkdirSync(dirname(out), { recursive: true });
  const targetW = Math.min(1000, Math.max(width, 900));
  const info = await sharp(spec.sources[src])
    .extract({ left, top, width, height })
    .resize({ width: targetW, kernel: "lanczos3" })
    .sharpen({ sigma: width < 400 ? 1.1 : 0.6 })
    .webp({ quality: 86, effort: 5 })
    .toFile(out);
  console.log(`${dest.padEnd(46)} ${width}x${height} -> ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}
