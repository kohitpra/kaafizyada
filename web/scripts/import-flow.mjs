// Maps Flow downloads (scene-01.*, scene-02.* … in prompt order) onto site asset paths and converts to WebP.
// Usage: node scripts/import-flow.mjs <flow-output-dir> <order.json>
import sharp from "sharp";
import { readdirSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const [dir, orderFile] = process.argv.slice(2);
const order = JSON.parse(readFileSync(orderFile, "utf8"));
const files = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
for (const [i, dest] of order.entries()) {
  const n = String(i + 1).padStart(2, "0");
  const src = files.find((f) => new RegExp(`(^|[^0-9])${n}([^0-9]|$)`).test(f) && /scene/i.test(f)) ?? files.find((f) => f.startsWith(n));
  if (!src) { console.log(`MISSING scene ${n} -> ${dest}`); continue; }
  const out = join("public/assets", dest);
  mkdirSync(dirname(out), { recursive: true });
  const info = await sharp(join(dir, src)).resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 84, effort: 5 }).toFile(out);
  console.log(`${src} -> ${out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}
