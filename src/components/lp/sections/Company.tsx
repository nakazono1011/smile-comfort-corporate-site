import type { CSSProperties } from "react";
import { COMPANY_INFO } from "@/config/company";

const d = (n: number) => ({ "--d": n }) as CSSProperties;

const ROWS = [
  { label: "社名", value: `${COMPANY_INFO.name}（${COMPANY_INFO.nameEn}）` },
  { label: "事業内容", value: "EC × AIによる業務改善の支援（出品業務・併売・問い合わせ対応・ページ改善）／自社SaaSの開発・運営" },
  { label: "所在地", value: `〒${COMPANY_INFO.address.postalCode} ${COMPANY_INFO.address.full}` },
  { label: "設立", value: COMPANY_INFO.establishedDate },
  { label: "代表者", value: COMPANY_INFO.representative },
  { label: "法人番号", value: COMPANY_INFO.corporateNumber },
];

export function Company() {
  return (
    <section
      id="company"
      data-section-theme="light"
      aria-labelledby="company-title"
      className="relative pb-28 sm:pb-36 lg:pb-44"
    >
      <div className="sc-wrap">
      <div className="grid gap-12 border-t border-sc-fg/15 pt-28 sm:pt-36 lg:grid-cols-12 lg:pt-44">
        <div className="lg:col-span-5">
          <p data-reveal className="t-kicker text-sc-fg/60">
            Company
          </p>
          <h2 id="company-title" data-reveal className="t-h2 mt-6" style={d(0.05)}>
            会社概要
          </h2>
        </div>
        <dl className="border-t border-sc-fg/15 lg:col-span-7">
          {ROWS.map((r, i) => (
            <div
              key={r.label}
              data-reveal
              style={d(i * 0.04)}
              className="grid gap-1 border-b border-sc-fg/15 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6"
            >
              <dt className="text-xs font-bold text-sc-fg/60 sm:pt-1">{r.label}</dt>
              <dd className="text-[15px] leading-[1.9]">{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      </div>
    </section>
  );
}
