// Traces the raster monogram (cream mark on cherry square) into a clean single-colour SVG.
import sharp from "sharp";
import potrace from "potrace";
import { writeFileSync } from "node:fs";

const src = process.argv[2];
const out = process.argv[3];
const buf = await sharp(src)
  .extract({ left: 34, top: 42, width: 340, height: 360 })
  .resize({ width: 1360, kernel: "lanczos3" })
  .greyscale()
  .negate() // cream mark -> dark, cherry ground -> light
  .blur(1.2)
  .png()
  .toBuffer();

potrace.trace(buf, { threshold: 128, turdSize: 40, optTolerance: 0.4, color: "currentColor", background: "transparent" }, (err, svg) => {
  if (err) throw err;
  const path = svg.match(/ d="([^"]+)"/)[1];
  const w = 1360, h = 1440;
  const clean = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><path fill="currentColor" fill-rule="evenodd" d="${path}"/></svg>\n`;
  writeFileSync(out, clean);
  console.log("wrote", out, clean.length, "bytes");
});
