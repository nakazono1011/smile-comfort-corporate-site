#!/usr/bin/env node
// write-ledger.mjs — 台帳 (state/ledger.tsv) に本日の結果を追記する。
//
// 重要: **picked.tsv を正 (authoritative)** として、選定した全トピックに必ず 1 行を書く。
// これにより「LLM が manifest に topic をエコーし損ねても」全 slug_hint が消込まれ、
// 翌日の同トピック再生成 (重複記事) を防ぐ。
//
// join 優先度: manifest.slug_hint == picked.slug_hint (ASCII 完全一致・最も堅牢)
//            → manifest.final_slug == picked.slug_hint
//            → 正規化 topic 一致
//
// status: published (push成功) / committed (commitのみ・次回再送) / held (生成したが非公開) / error (manifestに無い=生成失敗)
//
// 行形式: date \t product \t slug_hint \t final_slug \t score \t status
import fs from "node:fs";

const args = process.argv.slice(2);
const get = (k, d = "") => {
  const i = args.indexOf(k);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : d;
};

const PICKED = get("--picked");
const MANIFEST = get("--manifest", "none");
const LEDGER = get("--ledger");
const DATE = get("--date");
const PUBLISHED = new Set(get("--published").split(",").filter(Boolean));
const COMMITTED = new Set(get("--committed").split(",").filter(Boolean));

const norm = (s) => String(s || "").trim().replace(/\s+/g, " ").toLowerCase();

function readPicked() {
  if (!PICKED || !fs.existsSync(PICKED)) return [];
  return fs
    .readFileSync(PICKED, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((l) => {
      const [product, topic, slugHint] = l.split("\t");
      return { product: (product || "").trim(), topic: (topic || "").trim(), slugHint: (slugHint || "").trim() };
    });
}

function readArticles() {
  if (!MANIFEST || MANIFEST === "none" || !fs.existsSync(MANIFEST)) return [];
  try {
    const m = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    return Array.isArray(m.articles) ? m.articles : [];
  } catch {
    return [];
  }
}

function main() {
  const picked = readPicked();
  const articles = readArticles();

  // 索引
  const byHint = new Map();
  const byFinal = new Map();
  const byTopic = new Map();
  for (const a of articles) {
    if (a.slug_hint) byHint.set(String(a.slug_hint).trim(), a);
    if (a.final_slug) byFinal.set(String(a.final_slug).trim(), a);
    if (a.topic) byTopic.set(norm(a.topic), a);
  }

  const rows = [];
  for (const p of picked) {
    const a =
      byHint.get(p.slugHint) ||
      byFinal.get(p.slugHint) ||
      byTopic.get(norm(p.topic)) ||
      null;

    const finalSlug = a && a.final_slug ? String(a.final_slug).trim() : "";
    const score = a && a.score != null ? a.score : 0;

    let status;
    const key = finalSlug || p.slugHint;
    if (PUBLISHED.has(finalSlug) || PUBLISHED.has(p.slugHint) || PUBLISHED.has(key)) status = "published";
    else if (COMMITTED.has(finalSlug) || COMMITTED.has(p.slugHint) || COMMITTED.has(key)) status = "committed";
    else if (a) status = "held"; // 生成はされたが公開されていない (<90 or validate/build fail)
    else status = "error"; // manifest に無い = 生成自体が失敗

    rows.push([DATE, p.product, p.slugHint, finalSlug, score, status].join("\t"));
  }

  if (rows.length && LEDGER) {
    fs.appendFileSync(LEDGER, rows.map((r) => r + "\n").join(""));
  }
  const summary = rows.reduce((acc, r) => {
    const st = r.split("\t")[5];
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});
  process.stderr.write(`ledger += ${rows.length} 行 ${JSON.stringify(summary)}\n`);
}

main();
