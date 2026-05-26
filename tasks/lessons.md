# Lessons

## 2026-05-24: プロダクト間でクロス言及した (1Password 記事に Bright Data へのリンクを入れた)

- **状況**: 1Password の損益分岐記事の改善作業で「データ系コスト全体を把握したい場合は Bright Data の料金記事も参照」という内部リンクを ja/en 両方に追加した。同様に Next Engine 記事にも「スクレイピング基盤側の費用感」として Bright Data 記事へのリンクが入っていた。
- **指摘**: 「ブライトデータの記事に 1Password の内容、その反対で 1Password の記事にブライトデータの内容など、プロダクト間をクロスして記事に含まないでください」
- **原因**:
  1. SEO 上の内部リンク 2 件以上を満たすために、ref-affiliate-article §3.1 の「内部リンク 2 件以上」を機械的に追求し、product-cluster を跨いだリンクを許容してしまった。
  2. ref-affiliate-article §2.5 の「関連記事候補の収集」では「同 product の他記事 → 最大 3 件、同一カテゴリの他製品記事 → 最大 2 件」と書かれていて、他製品とのクロスリンクが許可されていた。これは記事のクラスター純度を損なう。
- **ルール (今後の絶対遵守)**:
  - **記事は単一プロダクト・クラスター純粋**: Bright Data 記事には Bright Data の文脈のみ、1Password 記事には 1Password の文脈のみ、Next Engine 記事には Next Engine の文脈のみを書く。他プロダクトの言及・内部リンク・比較は禁止。
  - **frontmatter `related` は同 product のみ**: `related` 配列に他 product の slug を入れない。同 product 内にまだ記事が無いなら `[]` で良い。
  - **本文内の内部リンクは同 product のみ**: SEO 上の「内部リンク 2 件以上」が満たせない場合 (新規 product cluster の初期記事など) は 0〜1 件で許容する。クラスター純度を優先する。
  - **Why**: トピッククラスター戦略では、各 pillar (Bright Data / 1Password / Next Engine) の文脈純度を保つことで、Google のサイト構造評価とユーザーの予想インテントが一致する。クロスリンクは「この記事は何のためのページか」を曖昧にし、コンバージョン (アフィリエイト送客) も拡散させる。
  - **How to apply**:
    - `ref-affiliate-article` §2.5 と §3.1 で「同 product 限定」と明示
    - `assign-affiliate-article-generator` が related-candidates.json を生成する際、他 product の記事を候補に入れない
    - `assign-affiliate-article-evaluator` の seo 軸チェックで、内部リンクが他 product を参照していたら減点

## 2026-05-23: アフィリエイト記事で数値・固有情報を捏造した (Next Engine 月額・1Password 損益分岐)

- **状況**: run-affiliate-article を 2 本 (1Password / Next Engine) 並列実行した結果、Next Engine 記事の基本月額を「10,000 円」と書いたが、公式 (https://next-engine.net/price) では **月額 3,000 円 (税抜)** + 200 件まで含む。1Password 記事は「年額 $47.88 / $71.88」と書いたがこれは月払い基準 × 12 の数字で、年払い時の正しい年額 ($35.88 / $53.88) との区別が無く読者を誤導する状態だった。
- **指摘**: 「ネクストエンジンの基本料金は3000円となっています」「嘘をかかないように、根拠のあるソースをもって記事を執筆するように必ずしてください」
- **原因**:
  1. generator subagent が **公式料金ページを直接読まず**、X 検索 (Grok x_search) の AI 要約と subagent 自身の事前知識だけで料金を書いた。Grok の回答自体に Next Engine の具体的な月額数字は含まれていなかったため、subagent が「らしい数字」を捏造した。
  2. **evaluator (Haiku モデル)** は SEO / 可読性 / アフィリエイト適性は採点していたが、**事実関係 (公式情報源との突き合わせ)** を採点軸に持っていなかった。スコア 94 で「合格」になり、嘘が通過した。
  3. 1Password の「年額 $47.88」は X 検索結果の中に出てくる数字 (Grok の AI 出力) で、Grok 自身が月払い・年払いを区別せず引用したもの。subagent がそれをコピーした。
- **ルール (今後の絶対遵守)**:
  - **数値・固有情報は必ず公式一次情報源で確認**: 料金は公式の pricing ページを `WebFetch` で取得して照合する。X 検索の AI 要約だけを根拠にしない。
  - **すべての数値・固有情報に脚注 URL を付ける**: 「公式 〜 ページ」と明記し、reader が裏取りできる状態にする。
  - **evaluator に `factual_accuracy` 軸を必ず含める**: weight 10、threshold 7。公式 URL が脚注に含まれているか、X 引用文の原文が実在するか、subagent が捏造したと疑われる数字が含まれていないかを採点。
  - **「らしい数字」を書かない**: 確認できない情報は「公式に問い合わせが必要」「公開されていない」と書いて止まる。

## 2026-05-23: evaluator の model を haiku → codex に移譲した

- **状況**: 上記の事実誤認を Haiku モデルの evaluator が検知できなかった。深い fact-check には推論能力の高いモデルが必要だった。
- **指摘**: 「evaluatorのmodelをcodexに移譲しましょう」
- **対応**: `assign-affiliate-article-evaluator` の採点本体を `delegate-codex` 経由で Codex CLI に委譲する構造に改修。Claude (親) は context JSON を作って Codex に渡し、Codex が公式 URL の取得 + 数値突合 + 脚注検証 + X 引用の実在チェックまで実施する。
- **ルール (今後)**:
  - 採点で「事実関係チェック」「数値突合」「X 引用の実在検証」が必要な軸は **Codex 移譲** とする。Haiku で軽く採点して済む軸 (構造・字数・grep ベースの機械チェック) は Haiku のままで OK。
  - **Why**: 推論能力の差。Haiku は出典 URL のドメイン名 + ステータスコードまでしか検証できないが、Codex は WebFetch で本文を取得して数値突合まで実施できる。
  - **How to apply**: SKILL.md の `model:` を変更するだけでなく、採点本体を delegate-codex 経由に変える。eval JSON の `model` フィールドにも `codex` を記録。

## 2026-05-23: サムネのトーンが 3 製品で区別できていなかった

- **状況**: 1Password = teal / Next Engine = light / Bright Data = navy の 3 種で運用していたが、ユーザーから「1Password・Next Engine・Bright Data のサムネトーンを区別してほしい (Bright Data は現状維持)」と指摘。teal (dark gray) と navy (dark blue) は視覚的に類似で、シリーズ感に欠ける。
- **対応**: 各製品の公式ブランドカラーに揃える形でテーマを再設計:
  - `brightdata` → `navy` (現状維持・濃紺 + 文字白)
  - `1password` → `blue` (1Password 公式ブルー #1A82E2 系、シアン系アクセント、文字白)
  - `nextengine` → `orange` (Next Engine 公式オレンジ #FF6B00 系、深いブラウン-オレンジグラデ、文字白)
- **ルール (今後)**:
  - **製品 → accent-theme マッピングは固定**。途中で変えない (シリーズ感を出すため)。
  - **新製品を追加する場合は公式ブランドカラーに揃える**。汎用 light/teal などを当てはめない。
  - `run-thumbnail/config.json` の `business-headline` mode の promptTemplate にも `blue` / `orange` の case を追加して、誠実トーンを維持する。煽り色化しないため彩度はあえて控えめに。

## 2026-05-22: TweetCard を追加したのに dev 起動確認をしなかった

- **状況**: メディア記事追加コミット（f46d4de）で大量の `<TweetCard id="..." />` を MDX に埋め込んだが、`enrichTweet` が `entities.hashtags/user_mentions/urls/symbols` が undefined のツイートで `entities is not iterable` を投げてページ全体がクラッシュしていた。
- **指摘**: ユーザーから「ちゃんと起動確認してますか？」
- **原因**:
  1. react-tweet@3.3.0 の `enrichTweet` は media 以外の entity の存在チェックをしていない（ライブラリ側の仕様）。Twitter syndication API は一部 entity を省くことがあるため、生 tweet を渡すと特定 ID で必ず落ちる。
  2. `MagicTweet` 側に try/catch がなく、TweetCard の try/catch は `await getTweet(id)` しか覆っていなかった。
  3. 何より、外部 API に依存する UI を含む変更を入れたのに **dev サーバーでページを開いて確認していなかった**。
- **ルール（今後）**:
  - 外部依存（API、サードパーティライブラリのパース）を含むコンポーネントを既存 MDX に挿入したら、必ず `npm run dev` で代表ページを少なくとも 1 本開いてエラーを目視確認する。
  - サードパーティが入力を完全には検証しない場合、こちら側で normalize もしくは try/catch + fallback を必ず用意する（ユーザーに白画面を見せない）。
  - MDX への一括差し込みは複数記事に影響するため、curl で複数ページの HTTP コードを叩く軽量スモークテストもあわせて回す。
