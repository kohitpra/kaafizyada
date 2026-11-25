// Copies source artwork into public/assets as web-ready WebP (max 2400px, q86) and reports sizes.
// Usage: node scripts/process-assets.mjs <src> <dest-relative-to-public/assets> [maxWidth]
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const [src, dest, max = "2400"] = process.argv.slice(2);
const out = join("public/assets", dest);
mkdirSync(dirname(out), { recursive: true });
const info = await sharp(src).resize({ width: Number(max), withoutEnlargement: true }).webp({ quality: 86, effort: 5 }).toFile(out);
console.log(`${out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
