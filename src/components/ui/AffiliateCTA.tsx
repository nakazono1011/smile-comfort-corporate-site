import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AffiliateCTAProps {
  product: "BrightData" | "NextEngine" | "1Password" | "HubSpot" | "Salesforce";
  variant?: "default" | "compact";
  className?: string;
}

const productConfig = {
  BrightData: {
    name: "Bright Data",
    description: "世界最大のプロキシネットワーク",
    ctaText: "Bright Data 無料トライアルを試す",
    url: "https://brightdata.com/",
    badge: "30日間無料",
  },
  NextEngine: {
    name: "ネクストエンジン",
    description: "EC一元管理システム",
    ctaText: "ネクストエンジン 無料体験を申し込む",
    url: "https://next-engine.net/",
    badge: "30日間無料",
  },
  "1Password": {
    name: "1Password",
    description: "パスワード管理ツール",
    ctaText: "1Password 無料トライアルを始める",
    url: "https://1password.com/",
    badge: "14日間無料",
  },
  HubSpot: {
    name: "HubSpot",
    description: "CRM・マーケティングツール",
    ctaText: "HubSpot 無料プランを使う",
    url: "https://www.hubspot.com/",
    badge: "無料プラン",
  },
  Salesforce: {
    name: "Salesforce",
    description: "CRM・営業支援システム",
    ctaText: "Salesforce 無料トライアルを試す",
    url: "https://www.salesforce.com/",
    badge: "30日間無料",
  },
};

export function AffiliateCTA({ 
  product, 
  variant = "default", 
  className = "" 
}: AffiliateCTAProps) {
  const config = productConfig[product];

  if (variant === "compact") {
    return (
      <div className={`bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-4 my-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-primary text-sm">{config.name}</h3>
            <p className="text-support-gray text-xs">{config.description}</p>
          </div>
          <Link
            href={config.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            {config.ctaText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-primary/5 to-accent/10 border border-primary/20 rounded-lg p-6 my-8 ${className}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-primary text-lg">{config.name}</h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
              {config.badge}
            </span>
          </div>
          <p className="text-support-gray text-sm mb-3">{config.description}</p>
          <div className="flex items-center gap-4 text-xs text-support-gray">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              信頼性
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              高機能
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              サポート充実
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Link
            href={config.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm whitespace-nowrap"
          >
            {config.ctaText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}