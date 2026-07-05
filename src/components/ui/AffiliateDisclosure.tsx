interface AffiliateDisclosureProps {
  locale?: "ja" | "en";
}

/**
 * 記事冒頭に表示する広告（アフィリエイト）開示。
 * 景表法のステルスマーケティング規制に対応し、product 記事の冒頭で明示する。
 * 末尾の PR 注記とは別に、視認性の高い位置での開示を担保する。
 */
export function AffiliateDisclosure({ locale = "ja" }: AffiliateDisclosureProps) {
  const text =
    locale === "ja"
      ? "本記事にはプロモーション（アフィリエイトリンク）が含まれます。"
      : "This article contains affiliate links (advertising).";

  return (
    <p className="mb-8 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
      {text}
    </p>
  );
}
