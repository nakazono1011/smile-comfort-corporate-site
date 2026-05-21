---
name: wrap-affiliate-thumbnail
base: run-thumbnail
description: アフィリエイト記事 (Bright Data / Next Engine / 1Password) のサムネ + OGP を「ビジネス・誠実トーン + タイトル必須」で生成する run-thumbnail の wrap。「アフィリエイトサムネ」「記事サムネ」で発動。
user-invocable: true
argument-hint: "<output-dir> <prefix> <title> <subtitle> [--category <text>] [--logo <url-or-path>] [--accent navy|light|teal] [--n 4]"
---

# wrap-affiliate-thumbnail

run-thumbnail engine を **`business-headline` mode 固定** で N 並列実行する wrap。アフィリエイト記事用に「ビジネス的・誠実トーン・タイトル主役・煽りなし」を保証する。

engine 仕様 (mode 定義 / プロンプトテンプレート / config.json) は `~/.claude/skills/run-thumbnail/SKILL.md` が一次情報。この skill は「アフィリエイト記事専用の制約 + 並列 fire + 集約」だけを担当する。

## Input / Output

- **Input**:
  - `output-dir`: 出力ディレクトリ (例: `${WORKDIR}/images`)
  - `prefix`: ファイル名プレフィックス (例: `cover` / `og`)
  - `title`: メインタイトル (frontmatter `title` をそのまま入れる想定)
  - `subtitle`: サブタイトル / 切り口 (frontmatter `summary` を圧縮した 1 行、20-32 字)
  - `--category` (optional): 上部カテゴリ帯 (例: "2026年版" "完全ガイド")
  - `--logo` (optional): 製品ロゴ画像 URL または既存ローカルパス
  - `--accent` (optional): `navy` / `light` / `teal` (default=navy)
  - `--n` (optional): 並列数 (default=4)
- **Output**: `<output-dir>/<prefix>-01.png` 〜 `<prefix>-NN.png`

## 厳守ルール (アフィリエイト記事ならではの制約)

1. **mode は `business-headline` 固定**: 他 mode を選ばない。煽り mode (right-layout / center-chaos 等) は禁止
2. **`--title` は frontmatter title を改変せず使用**: 「衝撃の」「9割が知らない」等の煽り語を付け足さない
3. **`subtitle` の文字数は 18-34 字**: 長すぎるとレイアウトが崩れる
4. **製品ロゴ (`--logo`) を可能な限り渡す**: 製品名 (Bright Data / Next Engine / 1Password / CataMap / Tra-bell) のロゴ取得は反射で行う
5. **accent-theme は記事の product / 雰囲気で揃える**: 同一シリーズ (Bright Data 記事群) では同じ accent-theme を使い、シリーズ感を出す

## 製品 → accent-theme の推奨マッピング

| product | 推奨 accent-theme | 理由 |
|---|---|---|
| `brightdata` | `navy` | Bright Data 公式の青系コーポレートカラーと整合 |
| `nextengine` | `light` | 国内 SaaS で読みやすさ重視、Next Engine のクリーンな印象 |
| `1password` | `teal` | 1Password 公式のティール/ダーク系イメージ |

同一プロダクトの記事群はこのマッピング固定で運用するとシリーズ感が出る。

## 手順

### Step 1: ロゴ画像を取得 (一度だけ)

製品ロゴは N 枚で共有するので、画像取得は **Claude 側で 1 回だけ** 走らせる。

```bash
# 例: Bright Data の公式ロゴ
curl -sL "https://brightdata.com/static/icons/logo.svg" -o "<output-dir>/ref-logo.png"
# SVG なら ImageMagick で PNG 化する場合あり: magick ref-logo.svg ref-logo.png
```

ロゴ URL の探し方:
- WebSearch で「<product> official logo SVG」で公式ロゴを特定
- WebFetch でブランドアセットページから直リンクを取得
- 取得できない場合は `--logo` 省略で進める (image_gen が代替表現を生成)

公式ロゴ URL の候補:
- Bright Data: `https://brightdata.com/static/images/brightdata-logo.svg`
- Next Engine: `https://next-engine.net/...` (要確認)
- 1Password: `https://1password.com/icon/icon-512x512.png`

> **注**: URL は変わる可能性があるため、必ず実行時に WebSearch / WebFetch で最新を確認する。

### Step 2: title と subtitle を整形

- `title`: frontmatter `title` をそのままコピー (改変禁止)
- `subtitle`: frontmatter `summary` から 18-34 字を抜粋
  - 例 (元): "Bright Data の料金プランを 2026 年最新版で徹底比較。Residential/DC/Web Unlocker のコスト最適化テクニックも紹介"
  - 例 (subtitle): "2026年版・プラン比較とコスト最適化"
- `category`: 任意。「2026年版」「ベストプラクティス」「完全ガイド」「実装解説」など

### Step 3: N 並列 fire

N 個 (default=4) の `generate.sh` を **`run_in_background: true` で同時発火**。**全パターンで `business-headline` 固定**、subtitle / category を僅かに変えて多様性を出す:

```bash
ACCENT="navy"  # product に応じて (上記マッピング参照)
TITLE="Bright Data 料金完全ガイド"
LOGO="<output-dir>/ref-logo.png"

# Pattern 01: subtitle=要約版 / category=年号
bash ~/.claude/skills/run-thumbnail/scripts/generate.sh \
  -o "<output-dir>/cover-01.png" -m business-headline \
  --title "${TITLE}" \
  --subtitle "2026年版・プラン比較とコスト最適化" \
  --category "2026年版" \
  --icon-image "${LOGO}" \
  --accent-theme "${ACCENT}"

# Pattern 02: subtitle=切り口版 / category=種別
bash ~/.claude/skills/run-thumbnail/scripts/generate.sh \
  -o "<output-dir>/cover-02.png" -m business-headline \
  --title "${TITLE}" \
  --subtitle "コスト最適化込みで徹底比較" \
  --category "完全ガイド" \
  --icon-image "${LOGO}" \
  --accent-theme "${ACCENT}"

# Pattern 03: category なし / subtitle=ターゲット版
bash ~/.claude/skills/run-thumbnail/scripts/generate.sh \
  -o "<output-dir>/cover-03.png" -m business-headline \
  --title "${TITLE}" \
  --subtitle "EC事業者・データ収集担当者向け" \
  --icon-image "${LOGO}" \
  --accent-theme "${ACCENT}"

# Pattern 04: subtitle=数値版 / category=種別
bash ~/.claude/skills/run-thumbnail/scripts/generate.sh \
  -o "<output-dir>/cover-04.png" -m business-headline \
  --title "${TITLE}" \
  --subtitle "5プランを実コストで比較" \
  --category "比較表" \
  --icon-image "${LOGO}" \
  --accent-theme "${ACCENT}"
```

Claude の Bash ツール側では「複数の独立した Bash 呼び出しを 1 メッセージ内で発行」すれば自動で並列に回る。`run_in_background=true` で fire し、全 TaskOutput を block=true で待ってから次へ。

### Step 4: 目視確認 & 部分リトライ

全 N 枚を `Read` で確認。**失敗したインデックスだけ再実行** (image_gen のランダム性で改善することが多い)。上限 3 リトライ / 枚。

評価観点 (アフィリエイト記事向け):
- ✅ タイトルが画面の 60-70% を占めて読める (主役か)
- ✅ 煽り・派手なネオン色・爆発エフェクト・キャラクター描画が無い
- ✅ 製品ロゴが正しく描画されている (画像と一致)
- ✅ category 帯が混雑していない
- ✅ 全体のトーンが「ビジネス白書 / SaaS ヘッダー」風

### Step 5: 1 枚を採用してリネーム

4 枚から最も良いものを 1 枚採用し、`cover.webp` (または `og.webp`) にリネーム/変換。残りは `<output-dir>/_rejected/` に退避。

```bash
# 採用例 (cover-02.png を採用)
magick "<output-dir>/cover-02.png" -resize 1200x630 "<output-dir>/cover.webp"
mkdir -p "<output-dir>/_rejected"
mv "<output-dir>/cover-01.png" "<output-dir>/cover-03.png" "<output-dir>/cover-04.png" "<output-dir>/_rejected/"
```

OGP も同様に prefix=`og` で別途 4 並列生成 (cover とは別の subtitle で展開してもよいし、cover をそのまま流用してもよい)。

## cover と og の使い分け

| 用途 | アスペクト比 | 推奨設定 |
|---|---|---|
| `cover.webp` | 1200x630 (16:8.4 ≒ 1.9:1) | 記事カード・記事ヘッダー用。subtitle は短め (18-26 字) |
| `og.webp` | 1200x630 | SNS シェア時の OGP。subtitle を強めに (24-34 字)、製品名を強調 |

両方とも 1200x630 でよいが、cover はカード一覧で縮小されるので「タイトル可読性 > 詳細情報」、og はシェア時にフルサイズで見られるので「製品 + 切り口がしっかり伝わる」設計にする。

## Gotchas

- **mode は `business-headline` 固定**: 他 mode を選ぼうとしたら停止して計画を見直す。トーン統一の核心はここ
- **frontmatter title は改変禁止**: 「衝撃」「9割が」等を付け足すと記事内文言と乖離する。SEO 上もタイトルとサムネ文字が一致している方が CTR が上がる
- **ロゴが取れないときは省略で進む**: image_gen の自動生成に任せても誠実トーンは保たれる (派手化しない)
- **product ごとの accent-theme は固定**: シリーズ感のため。途中で変えない
- **並列は CODEX_HOME 隔離で安全**: generate.sh を同時に N 個 fire しても race しない (run-thumbnail SKILL.md Gotchas 参照)
- **subtitle に煽り語を入れない**: 「神」「衝撃」「ヤバい」「もう」「9割が知らない」等の YouTube 風煽り語は禁止。`business-headline` テンプレ側のホワイトリスト/トーン制約とも矛盾する

## ファイル構成

```
/Users/nakazono/dev/smile-comfort-corporate-site/.claude/skills/wrap-affiliate-thumbnail/
└── SKILL.md   # このファイル (engine は持たない / wrap のみ)
```

engine は `~/.claude/skills/run-thumbnail/` (ユーザーグローバル)。この skill は engine の scripts (`generate.sh`) を直接叩く。
