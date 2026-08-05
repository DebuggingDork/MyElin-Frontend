/**
 * The source logo ships on a white plate, which shows as a box on the dark
 * surface. This bakes a transparent version and a tight-cropped mark.
 */
import sharp from "sharp";

const SRC = "public/brand/myelin-logo.png";

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const out = Buffer.from(data);

// Treat near-white as background; feather the edge by alpha-scaling brightness.
for (let i = 0; i < out.length; i += channels) {
  const r = out[i];
  const g = out[i + 1];
  const b = out[i + 2];
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;

  if (saturation < 0.12 && min > 200) {
    out[i + 3] = 0;
  } else if (saturation < 0.2 && min > 150) {
    out[i + 3] = Math.round(255 * (1 - (min - 150) / 105));
  }
}

const transparent = sharp(out, { raw: { width, height, channels } }).png();
await transparent.clone().toFile("public/brand/myelin-logo-dark.png");

const trimmed = await sharp(out, { raw: { width, height, channels } })
  .png()
  .trim({ threshold: 1 })
  .toBuffer({ resolveWithObject: true });

await sharp(trimmed.data).toFile("public/brand/myelin-mark.png");

// The glyph alone, for compact placements like the app sidebar.
const glyph = await sharp(trimmed.data)
  .extract({
    left: 0,
    top: 0,
    width: trimmed.info.width,
    height: Math.round(trimmed.info.height * 0.7),
  })
  .trim({ threshold: 1 })
  .toBuffer({ resolveWithObject: true });

await sharp(glyph.data).toFile("public/brand/myelin-glyph.png");

// The wordmark alone, so a horizontal lockup can be composed in the nav.
const word = await sharp(trimmed.data)
  .extract({
    left: 0,
    top: Math.round(trimmed.info.height * 0.72),
    width: trimmed.info.width,
    height: trimmed.info.height - Math.round(trimmed.info.height * 0.72),
  })
  .trim({ threshold: 1 })
  .toBuffer({ resolveWithObject: true });

await sharp(word.data).toFile("public/brand/myelin-word.png");

console.log(
  `wrote myelin-logo-dark.png (${width}x${height}), myelin-mark.png (${trimmed.info.width}x${trimmed.info.height}), myelin-glyph.png (${glyph.info.width}x${glyph.info.height})`,
);
