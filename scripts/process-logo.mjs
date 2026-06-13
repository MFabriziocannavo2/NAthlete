import sharp from "sharp";
import fs from "fs";

const src = "logo-mark.png/Nathlete logo.jpeg";

const { data, info } = await sharp(src).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const threshold = 28;
for (let i = 0; i < data.length; i += channels) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  if (r <= threshold && g <= threshold && b <= threshold) {
    data[i + 3] = 0;
  }
}

const trimmed = await sharp(data, { raw: { width, height, channels } })
  .png()
  .trim()
  .toBuffer();

const meta = await sharp(trimmed).metadata();

// Primary transparent logo mark used across the app (retina-ready source)
await sharp(trimmed).resize({ width: 1042 }).png({ compressionLevel: 9 }).toFile("public/brand/logo-mark.png");

// Square padded icon (dark bg) for favicon / apple touch icon
const square = Math.max(meta.width, meta.height);
const markWidth = Math.round(square * 0.82);
const padTop = Math.round((square - meta.height * (markWidth / meta.width)) / 2);
const padded = await sharp(trimmed)
  .resize({ width: markWidth })
  .extend({
    top: padTop,
    bottom: padTop,
    left: 0,
    right: 0,
    background: { r: 3, g: 7, b: 18, alpha: 1 },
  })
  .toBuffer();

const paddedMeta = await sharp(padded).metadata();
const side = Math.max(paddedMeta.width, paddedMeta.height);
const finalPadded = await sharp(padded)
  .resize({ width: side, height: side, fit: "contain", background: { r: 3, g: 7, b: 18, alpha: 1 } })
  .png({ compressionLevel: 9 })
  .toBuffer();

await sharp(finalPadded).resize(512, 512).png({ compressionLevel: 9 }).toFile("public/brand/logo-icon-512.png");

// Small base64 data URIs for embedding inside next/og ImageResponse (edge-safe, no fs access there)
const iconSmall = await sharp(finalPadded).resize(180, 180).png({ compressionLevel: 9, palette: true }).toBuffer();
const markSmall = await sharp(trimmed).resize({ width: 480 }).png({ compressionLevel: 9, palette: true }).toBuffer();

fs.writeFileSync(
  "components/brand/logo-data.ts",
  [
    "// Auto-generated from the source logo via scripts/process-logo.mjs. Do not edit by hand.",
    `export const LOGO_ICON_DATA_URI = "data:image/png;base64,${iconSmall.toString("base64")}";`,
    `export const LOGO_MARK_DATA_URI = "data:image/png;base64,${markSmall.toString("base64")}";`,
    `export const LOGO_ASPECT_RATIO = ${meta.width / meta.height};`,
    "",
  ].join("\n")
);

console.log("logo-mark.png:", meta.width, meta.height);
console.log("logo-icon-512.png: 512 512");
console.log("icon data uri bytes:", iconSmall.length, "mark data uri bytes:", markSmall.length);
