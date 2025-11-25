// サーバーコンポーネントとして実装
import { COMPANY_INFO } from "@/config/company";
import { CompanyContent } from "./client/CompanyContent";

export function CompanySection() {
  const companyData = [
    { label: "社名", value: COMPANY_INFO.name },
    { label: "法人番号", value: COMPANY_INFO.corporateNumber },
    { label: "代表者", value: COMPANY_INFO.representative },
    { label: "所在地", value: COMPANY_INFO.address.full },
    { label: "設立", value: COMPANY_INFO.establishedDate },
  ];

  return (
    <section id="company" className="relative py-32 overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      <div className="absolute inset-0 pattern-dots" />
      
      <div className="relative container mx-auto px-6">
        <CompanyContent data={companyData} />
      </div>
    </section>
  );
}
