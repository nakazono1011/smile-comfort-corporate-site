# 日次アフィリエイト記事ハーネス (automation/)

このパソコン (macOS) で **毎日 3 本**のアフィリエイト記事を自動生成し、品質ゲートを通ったものを **`main` へ直接 push して本番公開**するための無人ハーネス。生成本体は `.claude/skills/run-affiliate-article`（唯一の正）を使う。ここはその外側の「毎日回す・公開する」層。

## 全体像

```
launchd (毎日 12:17)
  └ caffeinate -i                       … スリープ抑止
      └ ~/.smile-comfort/launch.sh      … 安定ランチャ (リポジトリ外・git の影響を受けない)
          └ 専用 clone ~/.smile-comfort/publish (常に main) で pull
              └ automation/pipeline.sh
                  1. pick-topics.mjs    … バックログ+既存slug+台帳から本日分を選定 (製品バランス)
                  2. claude -p (無人)    … run-affiliate-article バッチで ja/en MDX + R2画像 + 採点
                  3. ゲート               … 既存編集を巻き戻し / 90点未満は holding へ退避
                  4. validate:articles → next build  … 二段ハードゲート (壊れたら push 中止・全退避)
                  5. git commit → push origin main    … Vercel 即本番デプロイ
                  6. 台帳/INBOX/デスクトップ通知
```

**設計の要点**: git・ファイル移動・公開判定はすべて決定論的な `pipeline.sh`(シェル)が行う。LLM (`claude -p`) の責務は「生成・採点・manifest 出力」だけに限定し、無人運用の事故 (誤 push・リンク切れ) を防ぐ。

## セットアップ (初回のみ)

### 0. 前提

- `main` から Vercel が本番デプロイされる構成であること。
- このハーネス一式が **`main` にマージ済み**であること（専用 clone は main を引くため）。
- `node` / `claude`(ログイン済) / `jq` が入っていること。`wrangler` は install.sh が入れる。

### 1. R2 API トークンを用意

Cloudflare Dashboard → R2 → *Manage R2 API Tokens* で **Object Read & Write** 権限のトークンを作成し、アカウント ID を控える。

### 2. インストール

```bash
# dev リポジトリのルートで
bash automation/install.sh
# 実行時刻を変えたい場合: RUN_HOUR=6 RUN_MIN=7 bash automation/install.sh
```

install.sh が行うこと: 専用 clone 作成 → `npm ci` → wrangler 導入 → `env.sh` 雛形作成 → 安定ランチャ生成 → launchd 登録 → 前提チェック。

### 3. シークレットを埋める

```bash
$EDITOR ~/.smile-comfort/publish/automation/env.sh
#   CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID を実値に
```

### 4. git push 認証を通す (無人 push の要)

このリポジトリは HTTPS remote。無人 push には資格情報の保存が必要。どちらか:

- **osxkeychain (既定)**: 一度手動で push して keychain に保存
  ```bash
  git -C ~/.smile-comfort/publish push origin main
  ```
- **PAT を credential store**（keychain がロックされる環境で確実）:
  ```bash
  git -C ~/.smile-comfort/publish config credential.helper store
  # 次回 push 時に user 名 + PAT を入力すると ~/.git-credentials に平文保存 (600)
  ```

install.sh の「git push 認証 OK」が出れば準備完了。

### 5. 動作確認

```bash
# 生成せず、本日選ばれるトピックだけ確認
( cd ~/.smile-comfort/publish && automation/pipeline.sh --dry-run )

# 生成〜ゲートまで実行して公開はしない (安全確認に推奨)
( cd ~/.smile-comfort/publish && automation/pipeline.sh --no-push )

# 本番同等 (生成→公開) を今すぐ実行
launchctl kickstart -k gui/$(id -u)/com.smile-comfort.daily-articles
```

## 日々の運用

- **公開されたもの**: 毎日 12:17 に自動で `main` へ push → Vercel 本番へ。
- **保留 (holding)**: 90 点未満・R2 失敗・build 不通過の記事は公開されず `automation/holding/<slug>/` に退避され、デスクトップ通知 + `automation/INBOX.md` に記録される。
- **レビュー**: `~/.smile-comfort/publish/automation/INBOX.md` を見て、保留記事を手直し → `npm run validate:articles` を通し → `src/lib/content/{ja,en}/media/` に戻し、**当日中に** commit/push する。翌 run 開始時に未コミットのまま残っていると `holding/_reclaimed-<ts>/` へ退避される（無言削除はしない）。
- **ログ**: `automation/logs/<日付>.log`(詳細) と `~/.smile-comfort/launchd.{out,err}.log`(launchd 側)。
- **台帳**: `automation/state/ledger.tsv`（`日付 / product / slug_hint / final_slug / score / status`）。status の意味:

  | status | 意味 | 再選 |
  |---|---|---|
  | `published` | commit + push 成功 (本番公開済) | しない |
  | `committed` | commit 済だが push 失敗 (翌 run の rebase で自動再送) | しない |
  | `held` | 生成したが未公開 (<90点 / validate / build fail) → 要手動レビュー | しない |
  | `error` | 生成自体が失敗 (manifest 欠落等) | する（連続 `TOPIC_MAX_RETRIES`=3 回で停止） |

- **push 失敗時**: 記事は publish clone にローカル commit 済で失われない。翌 run が未 push commit を検出し `rebase` で origin 先端へ載せ替えて再 push する（`reset --hard` では破棄しない）。diverge で rebase 不可の場合は `backup/unpushed-<ts>` ブランチを作って停止・通知する。

## バックログ (ネタ切れ防止)

- `automation/topic-backlog.tsv` が候補プール（TAB 区切り: `product / topic / slug_hint / priority`）。初期 42 本を投入済み。
- 消化判定はステートレス: `slug_hint` が既存記事にある、または台帳で published/held のものは選ばれない。
- **残りが少なくなったら**このファイルに追記するだけ。`grep -cv '^#' automation/topic-backlog.tsv` で総数、消化済みを引けば残数がわかる。
- 選定は「製品バランス優先（記事数が少ない製品を先に）→ priority 昇順」。同一製品は 1 日 `MAX_PER_PRODUCT_PER_DAY`(既定 2) 本まで。現状 Next Engine が手薄なので当面は Next Engine 中心に埋まる。

## パラメータ (`automation/env.sh`)

| 変数 | 既定 | 意味 |
|---|---|---|
| `ARTICLES_PER_DAY` | 3 | 1 日の生成本数 |
| `PUBLISH_MIN_SCORE` | 90 | 自動公開の合格ライン |
| `MAX_PER_PRODUCT_PER_DAY` | 2 | 1 日で同一製品を選ぶ上限 |
| `TOPIC_MAX_RETRIES` | 3 | error トピックの自動再試行上限 |
| `PUBLISH_BRANCH` | main | 公開先ブランチ |
| `CLAUDE_MODEL` | opus | ヘッドレス生成モデル |
| `CLAUDE_TIMEOUT` | 14400 | claude 実行の上限秒 (4h) |
| `STEP_TIMEOUT` | 2400 | npm ci / validate / build 各ステップの上限秒 |

## スリープ / 起動保証について

`caffeinate -i` は **run 中の idle sleep を抑止**するが、**12:17 に必ず起動させるものではない**。とくにノートの蓋を閉じている（クラムシェル）と launchd の時刻起動が走らない/中断されうる。確実に無人起動させたい場合:

- デスクトップ機 (Mac mini/Studio/iMac) を使う、または昼はノートを開けて AC 接続しておく（`昼 12:17` を選んだのはこのため）。
- さらに固くするなら、指定時刻の直前に wake させる:
  ```bash
  sudo pmset repeat wakeorpoweron MTWRFSU 12:15:00
  ```
- 取りこぼしても翌日再実行されるだけで、公開済み記事や台帳は保持される。

## R2 画像のオーファン

保留 (held) になった記事の画像は R2 に上がったまま残る（手動公開時に画像 404 を避けるため、退避時に消さない）。放置しても無害だが、四半期に一度ほど `corporate-images` バケットを棚卸しし、`src/lib/content` にも `holding/` にも無い slug prefix のオブジェクトだけ手動削除するとよい。

## トラブルシュート

- **その日動かなかった**: 12:17 に Mac が起動していたか（スリープ中は復帰後に実行、電源 OFF/クラムシェルはスキップ、上記「スリープ / 起動保証」参照）。`~/.smile-comfort/launchd.err.log` を確認。
- **毎回 push 失敗**: 上記「4. git push 認証」を再実施。`git -C ~/.smile-comfort/publish push origin main` が手で通るか。
- **R2 失敗で全保留**: `env.sh` のトークン権限、`wrangler r2 bucket list` が通るか。
- **build で全保留**: `automation/runs/<日付>/build.log` を確認。生成物の MDX 不整合が原因。
- **バックログ枯渇通知**: `topic-backlog.tsv` に pending が無い。追記して補充。
- **重複起動**: `automation/state/run.lock` で多重実行は防止（前回異常終了時は自動で stale 判定）。

## アンインストール

```bash
bash ~/.smile-comfort/publish/automation/uninstall.sh          # launchd 解除 (clone/ログ温存)
PURGE=1 bash ~/.smile-comfort/publish/automation/uninstall.sh  # clone/ランチャも削除
```

## ファイル一覧

| ファイル | 役割 | git |
|---|---|---|
| `pipeline.sh` | 日次オーケストレータ（生成→ゲート→公開） | 追跡 |
| `pick-topics.mjs` | 本日分トピック選定（バランス＋台帳消込） | 追跡 |
| `write-ledger.mjs` | 台帳追記（picked を正として全消込） | 追跡 |
| `daily-driver.md` | claude ヘッドレスへの指示テンプレ | 追跡 |
| `topic-backlog.tsv` | 候補プール | 追跡 |
| `install.sh` / `uninstall.sh` | 設置 / 撤去 | 追跡 |
| `env.sh.example` | 環境変数テンプレ | 追跡 |
| `*.plist.tmpl` | launchd テンプレ | 追跡 |
| `env.sh` | 実シークレット | **無視** |
| `logs/` `runs/` `holding/` `state/` `INBOX.md` | 実行時の状態 | **無視** |
