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
    <section id="company" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <CompanyContent data={companyData} />
      </div>
    </section>
  );
}
