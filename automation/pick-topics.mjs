#!/usr/bin/env node
// pick-topics.mjs — 本日生成する N 本のトピックを選ぶ。
//
// 選定ロジック:
//   1. topic-backlog.tsv (候補プール) を読む
//   2. src/lib/content/{ja,en}/media/*.mdx から既存 slug を集める (= 公開済み)
//   3. state/ledger.tsv から published / held の slug_hint を集める (= 再選しない)
//   4. pending = 候補のうち「既存 slug に無い」かつ「台帳で published/held でない」もの
//   5. 製品バランス: 既存記事数が少ない製品を優先して round-robin で N 本選ぶ
//      (現状 Next Engine が極端に少ないので自然と Next Engine が厚くなる)
//
// 出力:
//   - stdout: 選ばれた N 行 (`<product>\t<topic>`)  ← pipeline がバッチ入力に使う
//   - --out <path>: 選定結果 TSV (product / topic / slug_hint) を書き出す (台帳突合用)
//
// 終了コード: 0=選定成功(1本以上) / 3=pending ゼロ(バックログ枯渇) / 1=入出力エラー
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};

const REPO = process.env.SMILE_COMFORT_REPO || getArg("--repo", process.cwd());
const COUNT = parseInt(getArg("--count", process.env.ARTICLES_PER_DAY || "3"), 10);
const OUT = getArg("--out", "");
const BACKLOG = getArg("--backlog", path.join(REPO, "automation/topic-backlog.tsv"));
const LEDGER = getArg("--ledger", path.join(REPO, "automation/state/ledger.tsv"));
// 1 日あたり同一 product の上限 (多様性キャップ)。他に選べる product が無ければ自動解除。
const MAX_PER = parseInt(getArg("--max-per-product", process.env.MAX_PER_PRODUCT_PER_DAY || "2"), 10);
// error が連続 MAX_RETRIES 回に達したトピックは自動再試行を止め、消化扱い(要手動確認)にする。
const MAX_RETRIES = parseInt(getArg("--max-retries", process.env.TOPIC_MAX_RETRIES || "3"), 10);

// product キー → 既存 slug のプレフィックス (既存記事数カウント用)
const PREFIX = {
  "1password": ["1password-"],
  brightdata: ["bright-data-", "brightdata-"],
  nextengine: ["next-engine-"],
};

function readLines(file) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

// 既存 slug (ja / en の和集合)
function existingSlugs() {
  const set = new Set();
  for (const lang of ["ja", "en"]) {
    const dir = path.join(REPO, "src/lib/content", lang, "media");
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith(".mdx")) set.add(f.replace(/\.mdx$/, ""));
    }
  }
  return set;
}

// 台帳から「再選しない」slug_hint。
//  - published / committed / held は消化 (再選しない)。
//  - error は再挑戦させるが、連続 MAX_RETRIES 回に達したら消化扱い (暴走防止)。
function consumedFromLedger() {
  const set = new Set();
  const errorCount = {};
  const DONE = ["published", "committed", "held"];
  for (const line of readLines(LEDGER)) {
    const cols = line.split("\t");
    // date \t product \t slug_hint \t final_slug \t score \t status
    const slugHint = (cols[2] || "").trim();
    const finalSlug = (cols[3] || "").trim();
    const status = (cols[5] || "").trim();
    if (DONE.includes(status)) {
      if (slugHint) set.add(slugHint);
      if (finalSlug) set.add(finalSlug);
    } else if (status === "error" && slugHint) {
      errorCount[slugHint] = (errorCount[slugHint] || 0) + 1;
    }
  }
  for (const [hint, c] of Object.entries(errorCount)) {
    if (c >= MAX_RETRIES) set.add(hint);
  }
  return set;
}

function productOf(slug) {
  for (const [p, prefixes] of Object.entries(PREFIX)) {
    if (prefixes.some((pre) => slug.startsWith(pre))) return p;
  }
  return null;
}

function main() {
  const existing = existingSlugs();
  const consumed = consumedFromLedger();

  // 候補プール parse: product \t topic \t slug_hint [\t priority]
  const rows = [];
  for (const line of readLines(BACKLOG)) {
    const [product, topic, slugHint, priority] = line.split("\t").map((s) => (s || "").trim());
    if (!product || !topic || !slugHint) continue;
    if (!PREFIX[product]) {
      process.stderr.write(`WARN: 未知の product '${product}' をスキップ (${slugHint})\n`);
      continue;
    }
    rows.push({ product, topic, slugHint, priority: parseInt(priority || "2", 10) });
  }

  // pending
  const pending = rows.filter(
    (r) => !existing.has(r.slugHint) && !consumed.has(r.slugHint)
  );

  if (pending.length === 0) {
    process.stderr.write(
      `BACKLOG_EMPTY: pending=0 (候補${rows.length} / 既存${existing.size} / 台帳消込${consumed.size})。バックログを補充してください。\n`
    );
    process.exit(3);
  }

  // 製品別 現在数 (既存 + 台帳 published)。バランス用の基準。
  const counts = { "1password": 0, brightdata: 0, nextengine: 0 };
  for (const slug of existing) {
    const p = productOf(slug);
    if (p) counts[p]++;
  }

  // pending を product ごとに priority 昇順で並べる
  const byProduct = {};
  for (const r of pending) (byProduct[r.product] ||= []).push(r);
  for (const p of Object.keys(byProduct)) byProduct[p].sort((a, b) => a.priority - b.priority);

  // round-robin: 毎回「(現在数 + 今回採用済み) が最小 かつ pending が残る製品」から1本取る。
  // ただし同一 product は 1 日 MAX_PER 本まで (他に選べる product が無い場合のみ超過を許可)。
  const picked = [];
  const running = { ...counts };
  const perPicked = {};
  while (picked.length < COUNT) {
    const avail = Object.keys(byProduct).filter((p) => byProduct[p].length > 0);
    if (avail.length === 0) break;
    const under = avail.filter((p) => (perPicked[p] || 0) < MAX_PER);
    const pool = under.length > 0 ? under : avail;
    pool.sort((a, b) => running[a] - running[b] || a.localeCompare(b));
    const p = pool[0];
    picked.push(byProduct[p].shift());
    running[p]++;
    perPicked[p] = (perPicked[p] || 0) + 1;
  }

  if (picked.length < COUNT) {
    process.stderr.write(
      `WARN: pending が ${picked.length} 本しか無い (要求 ${COUNT})。可能な分だけ生成します。\n`
    );
  }

  // 出力 (stdout はスペース区切り = run-affiliate-article バッチ入力形式。topic 内の空白は許容)
  const outLines = picked.map((r) => `${r.product} ${r.topic}`);
  process.stdout.write(outLines.join("\n") + "\n");

  if (OUT) {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    const tsv = picked.map((r) => `${r.product}\t${r.topic}\t${r.slugHint}`).join("\n") + "\n";
    fs.writeFileSync(OUT, tsv);
  }

  process.stderr.write(
    `PICKED ${picked.length}: ${picked.map((r) => `${r.product}/${r.slugHint}`).join(", ")}\n` +
      `現在数 1password=${counts["1password"]} brightdata=${counts.brightdata} nextengine=${counts.nextengine} / pending=${pending.length}\n`
  );
  process.exit(0);
}

main();
