/**
 * トップページのデザイン (文字盤 + 見出し) に合わせた OGP 画像 public/og-default.png (1200x630) を生成する。
 * フォントは Google Fonts から取得するため、ネットワーク接続が必要。
 *
 *   node scripts/generate-og.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/dist/compiled/@vercel/og/index.node.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const INK = "#081410";
const PAPER = "#E8F0EC";
const SIGNAL = "#3EB991";
const ACCENT = "#5CD6A8";

const HEADLINE = ["ECの課題を、", "AIで解決する。"];
const KICKER = "EC × AI";
const SUB = "自社EC・国内モール・海外モールの課題を、AIと仕組みで解決します。";
const COMPANY = "合同会社スマイルコンフォート";

/** Google Fonts から、使う文字だけを含む TTF を取得する */
async function loadFont(family, weight, text) {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!src) throw new Error(`フォントを取得できませんでした: ${family} ${weight}`);
  return (await fetch(src[1])).arrayBuffer();
}

/** 文字盤 (トップページの DialFace と同じ比率) を SVG で描く */
function dialSvg(size) {
  const R = 360;
  const INNER = 230;
  const angle = 140;
  const rad = (d) => (d * Math.PI) / 180;
  const pt = (r, d) => [r * Math.sin(rad(d)), -r * Math.cos(rad(d))].map((n) => n.toFixed(2));

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const deg = i * 6;
    const major = i % 5 === 0;
    const [x1, y1] = pt(major ? R - 40 : R - 20, deg);
    const [x2, y2] = pt(R, deg);
    const lit = deg <= angle;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${lit ? SIGNAL : "rgba(232,240,236,0.25)"}" stroke-width="${major ? 4 : 2}" stroke-linecap="round"/>`;
  }).join("");

  const [ox, oy] = pt(R, angle);
  const [ix, iy] = pt(INNER, angle);
  const sweep = `<path d="M0 ${-INNER} L0 ${-R} A${R} ${R} 0 0 1 ${ox} ${oy} L${ix} ${iy} A${INNER} ${INNER} 0 0 0 0 ${-INNER} Z" fill="${SIGNAL}" fill-opacity="0.22"/>`;

  const quarter = [0, 90, 180, 270]
    .map((d) => {
      const [x1, y1] = pt(INNER, d);
      const [x2, y2] = pt(R - 52, d);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(232,240,236,0.18)" stroke-width="1.5"/>`;
    })
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-550 -550 1100 1100">
    ${sweep}
    <circle r="${R}" fill="none" stroke="rgba(232,240,236,0.16)" stroke-width="1.5"/>
    <circle r="${INNER}" fill="none" stroke="rgba(232,240,236,0.12)" stroke-width="1.5"/>
    <circle r="520" fill="none" stroke="rgba(232,240,236,0.18)" stroke-width="2" stroke-dasharray="1.5 14" stroke-linecap="round"/>
    ${quarter}
    ${ticks}
    <g transform="rotate(${300 + angle / 12})"><line y1="28" y2="-118" stroke="${PAPER}" stroke-width="13" stroke-linecap="round"/></g>
    <g transform="rotate(${angle})"><line y1="52" y2="-322" stroke="${PAPER}" stroke-width="5" stroke-linecap="round"/><circle cy="-322" r="10" fill="${SIGNAL}"/></g>
    <circle r="20" fill="${PAPER}"/><circle r="7" fill="${SIGNAL}"/>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const h = (type, props, ...children) => ({
  type,
  props: { ...props, children: children.length <= 1 ? children[0] : children },
});

const jpText = HEADLINE.join("") + SUB + COMPANY;
const [murecho, zenKaku, archivo] = await Promise.all([
  loadFont("Murecho", 800, HEADLINE.join("")),
  loadFont("Zen+Kaku+Gothic+New", 500, SUB + COMPANY),
  loadFont("Archivo", 600, `${KICKER}Smile Comfort`),
]);

const logo = await fs.readFile(path.join(publicDir, "logo.png"));
const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

const tree = h(
  "div",
  {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      position: "relative",
      backgroundColor: INK,
      color: PAPER,
      overflow: "hidden",
    },
  },
  h("img", {
    src: dialSvg(760),
    width: 760,
    height: 760,
    style: { position: "absolute", right: -150, top: -65 },
  }),
  h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        width: "100%",
        height: "100%",
      },
    },
    h(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            fontFamily: "Archivo",
            fontSize: 20,
            letterSpacing: 2,
            color: "rgba(232,240,236,0.6)",
          },
        },
        h("div", { style: { width: 36, height: 1.5, backgroundColor: "rgba(232,240,236,0.5)", marginRight: 16 } }),
        KICKER
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            marginTop: 36,
            fontFamily: "Murecho",
            fontSize: 92,
            lineHeight: 1.12,
            letterSpacing: -4,
          },
        },
        h("div", {}, HEADLINE[0]),
        h(
          "div",
          { style: { display: "flex" } },
          h("span", {}, "AIで"),
          h("span", { style: { color: ACCENT } }, "解決する"),
          h("span", {}, "。")
        )
      ),
      h(
        "div",
        { style: { marginTop: 32, fontFamily: "Zen Kaku Gothic New", fontSize: 24, color: "rgba(232,240,236,0.72)" } },
        SUB
      )
    ),
    h(
      "div",
      { style: { display: "flex", alignItems: "center" } },
      h("img", { src: logoSrc, width: 52, height: 52 }),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", marginLeft: 16 } },
        h("div", { style: { fontFamily: "Archivo", fontSize: 22 } }, "Smile Comfort"),
        h(
          "div",
          { style: { fontFamily: "Zen Kaku Gothic New", fontSize: 16, color: "rgba(232,240,236,0.6)", marginTop: 4 } },
          COMPANY
        )
      )
    )
  )
);

const res = new ImageResponse(tree, {
  width: 1200,
  height: 630,
  fonts: [
    { name: "Murecho", data: murecho, weight: 800, style: "normal" },
    { name: "Zen Kaku Gothic New", data: zenKaku, weight: 500, style: "normal" },
    { name: "Archivo", data: archivo, weight: 600, style: "normal" },
  ],
});

const out = path.join(publicDir, "og-default.png");
await fs.writeFile(out, Buffer.from(await res.arrayBuffer()));
console.log(`Wrote ${out} (${jpText.length} 文字分のフォントを使用)`);
