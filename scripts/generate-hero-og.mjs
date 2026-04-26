/**
 * public/hero.jpg から public/hero.webp（1600x900 程度）を生成
 * ロゴ＋コーポレ背景で public/og-default.png (1200x630) を生成
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");

let heroIn = path.join(publicDir, "hero.jpg");
try {
  await fs.access(heroIn);
} catch {
  heroIn = path.join(publicDir, "hero.webp");
}
const heroOut = path.join(publicDir, "hero.webp");
const ogOut = path.join(publicDir, "og-default.png");
const logoPath = path.join(publicDir, "logo.png");

const heroBuf = await fs.readFile(heroIn);
if (path.resolve(heroIn) === path.resolve(heroOut)) {
  const out = await sharp(heroBuf)
    .resize(1600, 900, { fit: "cover", position: "center" })
    .webp({ quality: 78, effort: 4 })
    .toBuffer();
  await fs.writeFile(heroOut, out);
} else {
  await sharp(heroBuf)
    .resize(1600, 900, { fit: "cover", position: "center" })
    .webp({ quality: 78, effort: 4 })
    .toFile(heroOut);
}
console.log(`Wrote ${heroOut}`);

const logo = await sharp(logoPath)
  .resize(180, 180, { fit: "inside" })
  .toBuffer();

const width = 1200;
const height = 630;
const ogSvg = Buffer.from(
  `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" style="stop-color:#0f2350;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#21aacc;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="400" y="300" font-family="system-ui,-apple-system,sans-serif" font-size="42" font-weight="700" fill="#ffffff">Smile Comfort LLC</text>
  <text x="400" y="360" font-family="system-ui,-apple-system,sans-serif" font-size="22" font-weight="400" fill="rgba(255,255,255,0.92)">Web · EC · AI development partner</text>
</svg>`,
  "utf8",
);

const og = await sharp(ogSvg).png().toBuffer();
await sharp(og)
  .composite([{ input: logo, top: 190, left: 140 }])
  .toFile(ogOut);
console.log(`Wrote ${ogOut}`);
