# SaaSアフィリエイト記事生成システム リファイン

計画: `~/.claude/plans/saas-seo-cvr-saas-mellow-quokka.md`

## P0 — サイト実装（全100ページに一括適用）✅ 完了・ビルド検証済み
- [x] P0-1 `mdx-components.tsx` の `a` に AF ドメイン判定で `rel="sponsored nofollow ..."` 自動付与 + `affiliate.ts` にホスト定数（成果物で rel×4 確認）
- [x] P0-2 `[slug]/page.tsx`（ja/en）FaqJsonLd に frontmatter `faq` を供給（成果物で FAQPage 5問確認、従来 0）
- [x] P0-3 ヒーロー直下に広告開示行を自動描画（product 記事のみ）
- [x] P0-4 `next-sitemap.config.js` の lastmod を frontmatter `updated||date` 反映（102 distinct lastmod 確認）
- [x] P0-5 ルート `CLAUDE.md` の旧ブロック除去 + 実装同期（PostMeta 18フィールド）
- [x] P0 検証: `npm run build` + postbuild 通過

## P1 — スキルの矛盾解消と検索意図分岐
- [x] ref-affiliate-article v3（11軸145点 / CTA基準表 / rel修正 / intent別テンプレ §4 / BOFU向き不向き / §5.1 titleルール / 名称修正 / §2.5 クラスタバランス）
- [x] evaluator + eval-schema（cv_readiness / intent_fit 追加, 145点化 / title字数 / AF URL を link_health 除外）
- [x] generator（intent分岐 / reserved_slug / CTA基準表 / FAQ単一化 / parity緩和 / serp_brief / templates_dir）
- [x] run-affiliate-article（SERP Step2.5 / LOCALES NEはjaのみ / heredocバグ修正 / __TEMP__廃止→Step1.6 / Step9 sed修正 / Step9.5逆リンク / Step10 CL / refresh）
- [x] references（product 一次データ節×3 + intent別テンプレ5種）… CTA条件分岐ガード・捏造禁止警告を確認済み

## P2 — 保守ワークフロー
- [x] `scripts/validate-articles.mjs` + `npm run validate:articles`（100件検証・0 error・1 warning 検出）
- [x] run-affiliate-article に refresh モード（--refresh <slug>）

## レビュー
- P0 ビルド成果物で FAQ schema / rel sponsored / 開示 / lastmod を実証
- validate-articles が en/1password-vs-dashlane の開示欠落を検出（冒頭開示は P0 で自動描画されるため実害なし）
- 残: サブエージェント完了確認 → スキル整合の最終 grep → メモリ更新
