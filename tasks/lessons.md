# Lessons

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
