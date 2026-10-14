/**
 * 4章を読み終えた後の山場。デスクトップでは右の文字盤が針を巻き戻し、中央に一言を出す (DialStage が [data-climax] を見る)。
 * 左の列には、その一言につながる短い文を置く
 */
export function Climax() {
  return (
    <section
      data-climax
      data-section-theme="light"
      aria-label="4つの業務のまとめ"
      className="relative lg:h-[170svh]"
    >
      <div className="sc-wrap lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center">
        <div className="py-24 lg:w-[52%] lg:py-0">
          <p data-reveal className="t-kicker text-sc-fg/60">
            1:00
          </p>
          <p data-reveal className="t-h2 mt-6">
            針が一周するあいだに、
            <br />
            4つの業務が片付いた。
          </p>
          <p
            data-reveal
            className="mt-8 max-w-[30em] text-[15px] leading-[1.95] text-sc-fg/70 sm:text-base"
          >
            登録、在庫の数合わせ、返信、ページの見直し。空いた時間は、商品と売り場を良くすることに使えます。
          </p>
          <p data-reveal className="t-lead mt-10 text-sc-accent lg:hidden">
            取り戻した時間で、売り場を育てる。
          </p>
        </div>
      </div>
    </section>
  );
}
