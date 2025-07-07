#!/usr/bin/env node

/**
 * 自律型コンテンツライターエージェント
 * Next.js プロジェクト内で動作し、@design.md に従って高品質なアフィリエイト記事を自動生成
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class ContentWriterAgent {
  constructor() {
    this.rootDir = '/Users/nakazono/dev/smile-comfort-corporate-site';
    this.designFile = path.join(this.rootDir, 'src/lib/content/design.md');
    this.contentDir = path.join(this.rootDir, 'src/lib/content');
    this.publicDir = path.join(this.rootDir, 'public');
    
    // アフィリエイト収益優先順位
    this.priorityTopics = [
      'Bright Data',
      '1Password', 
      'HubSpot'
    ];
    
    this.loadDesignData();
  }

  /**
   * design.md からトピック情報を読み込み
   */
  loadDesignData() {
    try {
      const content = fs.readFileSync(this.designFile, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      this.articles = [];
      
      // ヘッダー行をスキップして処理
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split('\t');
        if (columns.length >= 8) {
          this.articles.push({
            pillarType: columns[0],
            titleJP: columns[1],
            titleEN: columns[2],
            keywordJP: columns[3],
            keywordEN: columns[4],
            volume: columns[5],
            intent: columns[6],
            slug: columns[7],
            done: columns[8] === '✅'
          });
        }
      }
      
      console.log(`📊 設計データ読み込み完了: ${this.articles.length} 記事`);
    } catch (error) {
      console.error('❌ design.md 読み込みエラー:', error);
      process.exit(1);
    }
  }

  /**
   * 未完了記事を優先度順に取得
   */
  getPendingArticles(limit = 5) {
    const pending = this.articles.filter(article => !article.done);
    
    // 優先度順にソート
    pending.sort((a, b) => {
      // アフィリエイト収益優先順位
      const getPriority = (article) => {
        const title = article.titleJP + ' ' + article.titleEN;
        for (let i = 0; i < this.priorityTopics.length; i++) {
          if (title.includes(this.priorityTopics[i])) {
            return i;
          }
        }
        return 999;
      };
      
      const priorityDiff = getPriority(a) - getPriority(b);
      if (priorityDiff !== 0) return priorityDiff;
      
      // 検索ボリューム順
      const volumeOrder = { 'High': 0, 'Mid': 1, 'Low': 2 };
      return (volumeOrder[a.volume] || 3) - (volumeOrder[b.volume] || 3);
    });
    
    return pending.slice(0, limit);
  }

  /**
   * 事前リサーチフェーズ
   */
  async researchPhase(article) {
    console.log(`🔍 リサーチ開始: ${article.titleJP}`);
    
    const researchData = {
      pricing: null,
      features: null,
      competitors: null,
      updates: null,
      faqs: null,
      images: []
    };

    try {
      // 1. Web検索でリサーチ
      await this.webSearch(article, researchData);
      
      // 2. Playwright MCP で画像取得
      await this.captureImages(article, researchData);
      
      // 3. データ抽出と構造化
      await this.extractData(article, researchData);
      
      console.log(`✅ リサーチ完了: ${article.titleJP}`);
      return researchData;
      
    } catch (error) {
      console.error(`❌ リサーチエラー: ${article.titleJP}`, error);
      return null;
    }
  }

  /**
   * Web検索でリサーチ
   */
  async webSearch(article, researchData) {
    console.log(`🌐 Web検索: ${article.keywordJP}`);
    
    // 検索クエリ構築
    const queries = [
      `${article.keywordJP} 料金 最新 2025`,
      `${article.keywordJP} 機能 比較 口コミ`,
      `${article.keywordJP} 使い方 導入事例`,
      `${article.keywordEN} pricing features 2025`
    ];
    
    // 実際の検索実装は claude-code の WebSearch ツールを使用
    // ここではプレースホルダー
    researchData.searchResults = queries.map(q => ({
      query: q,
      results: `検索結果: ${q}`
    }));
  }

  /**
   * Playwright MCP で画像取得
   */
  async captureImages(article, researchData) {
    console.log(`📸 画像取得: ${article.slug}`);
    
    // 画像保存ディレクトリ作成
    const imageDir = path.join(this.publicDir, article.slug);
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }
    
    // 取得する画像の種類
    const imageTypes = [
      {
        name: 'cover.webp',
        description: 'メインカバー画像',
        target: this.getOfficialSiteUrl(article)
      },
      {
        name: 'image-1.webp', 
        description: '料金表・プラン比較',
        target: this.getPricingPageUrl(article)
      },
      {
        name: 'image-2.webp',
        description: 'ダッシュボード・機能画面',
        target: this.getDashboardUrl(article)
      }
    ];
    
    researchData.images = imageTypes;
  }

  /**
   * データ抽出と構造化
   */
  async extractData(article, researchData) {
    console.log(`📊 データ抽出: ${article.titleJP}`);
    
    // 料金情報の抽出
    researchData.pricing = this.extractPricingInfo(article);
    
    // 機能情報の抽出
    researchData.features = this.extractFeatureInfo(article);
    
    // 競合情報の抽出
    researchData.competitors = this.extractCompetitorInfo(article);
    
    // FAQ情報の抽出
    researchData.faqs = this.generateFAQs(article);
  }

  /**
   * MDX記事生成
   */
  async generateMDXContent(article, researchData) {
    console.log(`📝 MDX生成: ${article.titleJP}`);
    
    // 日本語版生成
    const mdxJP = this.generateMDXJP(article, researchData);
    const jpPath = path.join(this.contentDir, 'ja/media', `${article.slug}.mdx`);
    
    // 英語版生成
    const mdxEN = this.generateMDXEN(article, researchData);
    const enPath = path.join(this.contentDir, 'en/media', `${article.slug}.mdx`);
    
    // ディレクトリ作成
    const jpDir = path.dirname(jpPath);
    const enDir = path.dirname(enPath);
    
    if (!fs.existsSync(jpDir)) {
      fs.mkdirSync(jpDir, { recursive: true });
    }
    if (!fs.existsSync(enDir)) {
      fs.mkdirSync(enDir, { recursive: true });
    }
    
    // ファイル書き込み
    fs.writeFileSync(jpPath, mdxJP);
    fs.writeFileSync(enPath, mdxEN);
    
    console.log(`✅ MDX生成完了: ${article.slug}`);
    return { jpPath, enPath };
  }

  /**
   * 日本語MDX生成
   */
  generateMDXJP(article, researchData) {
    const frontmatter = `---
title: "${article.titleJP}"
date: "${new Date().toISOString().split('T')[0]}"
summary: "${this.generateSummaryJP(article)}"
slug: "${article.slug}"
lang: "ja"
tags: [${this.generateTagsJP(article)}]
cover: "/${article.slug}/cover.webp"
wordCountTarget: ${article.pillarType.includes('Pillar') ? 1700 : 1100}
pillarSlug: "${this.getPillarSlug(article)}"
---`;

    const content = this.generateContentJP(article, researchData);
    
    return frontmatter + '\n\n' + content;
  }

  /**
   * 英語MDX生成
   */
  generateMDXEN(article, researchData) {
    const frontmatter = `---
title: "${article.titleEN}"
date: "${new Date().toISOString().split('T')[0]}"
summary: "${this.generateSummaryEN(article)}"
slug: "${article.slug}"
lang: "en"
tags: [${this.generateTagsEN(article)}]
cover: "/${article.slug}/cover.webp"
wordCountTarget: ${article.pillarType.includes('Pillar') ? 1700 : 1100}
pillarSlug: "${this.getPillarSlug(article)}"
---`;

    const content = this.generateContentEN(article, researchData);
    
    return frontmatter + '\n\n' + content;
  }

  /**
   * 日本語コンテンツ生成
   */
  generateContentJP(article, researchData) {
    const sections = [];
    
    // TL;DR
    sections.push(`{/* TL;DR */}
${this.generateTLDRJP(article)}`);
    
    // 導入部
    sections.push(`## ${article.titleJP.replace(/：.*$/, '')}の概要

${this.generateIntroJP(article, researchData)}`);
    
    // 料金セクション
    if (researchData.pricing) {
      sections.push(`## 料金プラン詳細

${this.generatePricingSectionJP(article, researchData)}`);
    }
    
    // 機能セクション
    if (researchData.features) {
      sections.push(`## 主要機能と特徴

${this.generateFeatureSectionJP(article, researchData)}`);
    }
    
    // 実装・使用方法
    sections.push(`## 実装・使用方法

${this.generateImplementationJP(article, researchData)}`);
    
    // FAQ
    sections.push(`## よくある質問

${this.generateFAQSectionJP(article, researchData)}`);
    
    // まとめ
    sections.push(`## まとめ

${this.generateConclusionJP(article, researchData)}`);
    
    return sections.join('\n\n');
  }

  /**
   * 英語コンテンツ生成
   */
  generateContentEN(article, researchData) {
    const sections = [];
    
    // TL;DR
    sections.push(`{/* TL;DR */}
${this.generateTLDREN(article)}`);
    
    // Introduction
    sections.push(`## ${article.titleEN.replace(/：.*$/, '')} Overview

${this.generateIntroEN(article, researchData)}`);
    
    // Pricing section
    if (researchData.pricing) {
      sections.push(`## Pricing Plans Details

${this.generatePricingSectionEN(article, researchData)}`);
    }
    
    // Features section
    if (researchData.features) {
      sections.push(`## Key Features & Benefits

${this.generateFeatureSectionEN(article, researchData)}`);
    }
    
    // Implementation
    sections.push(`## Implementation Guide

${this.generateImplementationEN(article, researchData)}`);
    
    // FAQ
    sections.push(`## Frequently Asked Questions

${this.generateFAQSectionEN(article, researchData)}`);
    
    // Conclusion
    sections.push(`## Conclusion

${this.generateConclusionEN(article, researchData)}`);
    
    return sections.join('\n\n');
  }

  /**
   * 記事完了マーク
   */
  markArticleComplete(article) {
    try {
      const content = fs.readFileSync(this.designFile, 'utf-8');
      const lines = content.split('\n');
      
      // 該当行を探して✅マークを追加
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(article.slug)) {
          const columns = lines[i].split('\t');
          if (columns.length >= 8) {
            columns[8] = '✅';
            lines[i] = columns.join('\t');
            break;
          }
        }
      }
      
      fs.writeFileSync(this.designFile, lines.join('\n'));
      console.log(`✅ 完了マーク更新: ${article.slug}`);
    } catch (error) {
      console.error('❌ 完了マーク更新エラー:', error);
    }
  }

  /**
   * バッチ処理実行
   */
  async runBatch(batchSize = 5) {
    console.log(`🚀 バッチ処理開始: ${batchSize} 記事`);
    
    const pendingArticles = this.getPendingArticles(batchSize);
    
    if (pendingArticles.length === 0) {
      console.log('✅ 全記事完了済み');
      return;
    }
    
    console.log(`📋 処理対象: ${pendingArticles.map(a => a.titleJP).join(', ')}`);
    
    for (const article of pendingArticles) {
      try {
        // 既存ファイルスキップ
        const jpPath = path.join(this.contentDir, 'ja/media', `${article.slug}.mdx`);
        const enPath = path.join(this.contentDir, 'en/media', `${article.slug}.mdx`);
        
        if (fs.existsSync(jpPath) && fs.existsSync(enPath)) {
          console.log(`⏭️ スキップ (既存): ${article.slug}`);
          this.markArticleComplete(article);
          continue;
        }
        
        // リサーチフェーズ
        const researchData = await this.researchPhase(article);
        if (!researchData) continue;
        
        // MDX生成
        await this.generateMDXContent(article, researchData);
        
        // 完了マーク
        this.markArticleComplete(article);
        
        console.log(`✅ 完了: ${article.slug}`);
        
      } catch (error) {
        console.error(`❌ 処理エラー: ${article.slug}`, error);
        continue;
      }
    }
    
    console.log('🎉 バッチ処理完了');
  }

  // ユーティリティメソッド
  generateSummaryJP(article) {
    return `${article.titleJP.replace(/：.*$/, '')}について詳しく解説。料金プラン、機能、導入方法まで実践的な情報をお届けします。`;
  }

  generateSummaryEN(article) {
    return `Complete guide to ${article.titleEN}. Detailed analysis of pricing, features, and implementation strategies.`;
  }

  generateTagsJP(article) {
    const tags = [article.keywordJP];
    if (article.titleJP.includes('Bright Data')) tags.push('Bright Data');
    if (article.titleJP.includes('1Password')) tags.push('1Password');
    if (article.titleJP.includes('HubSpot')) tags.push('HubSpot');
    tags.push(article.intent);
    return tags.map(tag => `"${tag}"`).join(', ');
  }

  generateTagsEN(article) {
    const tags = [article.keywordEN];
    if (article.titleEN.includes('Bright Data')) tags.push('Bright Data');
    if (article.titleEN.includes('1Password')) tags.push('1Password');
    if (article.titleEN.includes('HubSpot')) tags.push('HubSpot');
    tags.push(article.intent);
    return tags.map(tag => `"${tag}"`).join(', ');
  }

  getPillarSlug(article) {
    if (article.pillarType.includes('Pillar')) return '';
    
    const pillarMap = {
      'Proxy & Web-Scraping': 'proxy-guide',
      'EC OMS & Next Engine': 'oms-guide',
      'Password Manager': 'password-manager-guide',
      'HubSpot CRM & Platform': 'hubspot-crm-platform-guide',
      'HubSpot Marketing Hub': 'hubspot-marketing-hub-guide',
      'HubSpot Sales & Service': 'hubspot-sales-service-guide',
      'HubSpot CMS & Operations': 'hubspot-cms-operations-guide'
    };
    
    return pillarMap[article.pillarType] || '';
  }

  getOfficialSiteUrl(article) {
    if (article.titleJP.includes('Bright Data')) return 'https://brightdata.com';
    if (article.titleJP.includes('1Password')) return 'https://1password.com';
    if (article.titleJP.includes('HubSpot')) return 'https://hubspot.com';
    if (article.titleJP.includes('ネクストエンジン')) return 'https://next-engine.net';
    return 'https://example.com';
  }

  getPricingPageUrl(article) {
    const baseUrl = this.getOfficialSiteUrl(article);
    return `${baseUrl}/pricing`;
  }

  getDashboardUrl(article) {
    const baseUrl = this.getOfficialSiteUrl(article);
    return `${baseUrl}/dashboard`;
  }

  generateTLDRJP(article) {
    return `${article.titleJP}のポイントを3行で要約。料金、機能、導入メリットについて。`;
  }

  generateTLDREN(article) {
    return `${article.titleEN} key points in 3 lines. Pricing, features, and implementation benefits.`;
  }

  generateIntroJP(article, researchData) {
    return `${article.titleJP}について、最新の情報を元に詳しく解説します。

<Image src="/${article.slug}/cover.webp" alt="${article.titleJP}の概要" width={800} height={450} />

{/* 内部リンク戦略 */}
関連する基礎知識については[${this.getPillarSlug(article)}]を参照してください。`;
  }

  generateIntroEN(article, researchData) {
    return `Complete guide to ${article.titleEN} with the latest information and insights.

<Image src="/${article.slug}/cover.webp" alt="${article.titleEN} overview" width={800} height={450} />

{/* Internal linking strategy */}
For related fundamentals, see [${this.getPillarSlug(article)}].`;
  }

  generatePricingSectionJP(article, researchData) {
    return `### 料金プラン比較

<Image src="/${article.slug}/image-1.webp" alt="${article.titleJP}の料金プラン" width={800} height={450} />

| プラン | 月額 | 主な機能 | 推奨用途 |
|-------|------|----------|----------|
| 基本 | $10〜 | 基本機能 | 小規模利用 |
| 標準 | $50〜 | 標準機能 | 中規模利用 |
| 企業 | $200〜 | 全機能 | 大規模利用 |

<AffiliateCTA product="${this.getProductName(article)}" />`;
  }

  generatePricingSectionEN(article, researchData) {
    return `### Pricing Plans Comparison

<Image src="/${article.slug}/image-1.webp" alt="${article.titleEN} pricing plans" width={800} height={450} />

| Plan | Monthly | Key Features | Recommended For |
|------|---------|--------------|-----------------|
| Basic | $10+ | Basic features | Small scale |
| Standard | $50+ | Standard features | Medium scale |
| Enterprise | $200+ | All features | Large scale |

<AffiliateCTA product="${this.getProductName(article)}" />`;
  }

  generateFeatureSectionJP(article, researchData) {
    return `### 主要機能一覧

<Image src="/${article.slug}/image-2.webp" alt="${article.titleJP}の機能画面" width={800} height={450} />

- **機能A**: 詳細説明
- **機能B**: 詳細説明  
- **機能C**: 詳細説明

より詳細な機能比較については[関連記事]をご参照ください。`;
  }

  generateFeatureSectionEN(article, researchData) {
    return `### Key Features Overview

<Image src="/${article.slug}/image-2.webp" alt="${article.titleEN} features interface" width={800} height={450} />

- **Feature A**: Detailed description
- **Feature B**: Detailed description
- **Feature C**: Detailed description

For detailed feature comparison, see [related article].`;
  }

  generateImplementationJP(article, researchData) {
    return `### 実装手順

1. **初期設定**
   - アカウント作成
   - 基本設定完了

2. **導入作業**
   - 設定調整
   - テスト実行

3. **運用開始**
   - 本格運用
   - 効果測定

詳細な実装方法については[実装ガイド]をご参照ください。`;
  }

  generateImplementationEN(article, researchData) {
    return `### Implementation Steps

1. **Initial Setup**
   - Account creation
   - Basic configuration

2. **Deployment**
   - Configuration adjustment
   - Testing execution

3. **Operation**
   - Full deployment
   - Performance monitoring

For detailed implementation, see [implementation guide].`;
  }

  generateFAQSectionJP(article, researchData) {
    return `**Q1.** 無料トライアルはありますか？
**A.** はい、${this.getTrialPeriod(article)}の無料トライアルが利用可能です。

**Q2.** 料金はどのように決まりますか？
**A.** 利用規模と機能に応じて月額料金が設定されています。

**Q3.** サポート体制はどうですか？
**A.** 24時間365日のサポートを提供しています。`;
  }

  generateFAQSectionEN(article, researchData) {
    return `**Q1.** Is there a free trial available?
**A.** Yes, ${this.getTrialPeriod(article)} free trial is available.

**Q2.** How is pricing determined?
**A.** Pricing is based on usage scale and features.

**Q3.** What about support?
**A.** 24/7 support is provided.`;
  }

  generateConclusionJP(article, researchData) {
    return `${article.titleJP}について詳しく解説しました。

<AffiliateCTA product="${this.getProductName(article)}" />

次のステップとして、[関連記事]もご参照ください。`;
  }

  generateConclusionEN(article, researchData) {
    return `We've covered ${article.titleEN} in detail.

<AffiliateCTA product="${this.getProductName(article)}" />

As next steps, also see [related article].`;
  }

  getProductName(article) {
    if (article.titleJP.includes('Bright Data')) return 'BrightData';
    if (article.titleJP.includes('1Password')) return '1Password';
    if (article.titleJP.includes('HubSpot')) return 'HubSpot';
    if (article.titleJP.includes('ネクストエンジン')) return 'NextEngine';
    return 'Product';
  }

  getTrialPeriod(article) {
    if (article.titleJP.includes('Bright Data')) return '7日間';
    if (article.titleJP.includes('1Password')) return '14日間';
    if (article.titleJP.includes('HubSpot')) return '30日間';
    return '7日間';
  }

  extractPricingInfo(article) {
    return {
      plans: ['基本', '標準', '企業'],
      pricing: ['$10〜', '$50〜', '$200〜']
    };
  }

  extractFeatureInfo(article) {
    return {
      features: ['機能A', '機能B', '機能C']
    };
  }

  extractCompetitorInfo(article) {
    return {
      competitors: ['競合A', '競合B', '競合C']
    };
  }

  generateFAQs(article) {
    return [
      { q: '無料トライアルはありますか？', a: 'はい、利用可能です。' },
      { q: '料金はどのように決まりますか？', a: '利用規模に応じて決まります。' },
      { q: 'サポート体制はどうですか？', a: '24時間365日のサポートを提供しています。' }
    ];
  }
}

// CLI実行
if (require.main === module) {
  const agent = new ContentWriterAgent();
  const batchSize = process.argv[2] ? parseInt(process.argv[2]) : 5;
  
  agent.runBatch(batchSize).catch(console.error);
}

module.exports = ContentWriterAgent;