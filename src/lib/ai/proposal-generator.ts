/**
 * @module ai/proposal-generator
 * @description Global Tender Proposal Generator - Multi-language Support
 *
 * Features:
 * - Multi-language proposals (EN/DE/FR)
 * - Global tender format support (TED, SAM.gov, UNGM)
 * - Currency handling (USD, EUR, KRW)
 * - International proposal standards
 * - Claude Opus 4.5 with Effort Parameter
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultHeaders: {
    'anthropic-beta': 'files-api-2025-04-14,effort-2025-11-24',
  },
});

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ProposalLanguage = 'en' | 'de' | 'fr' | 'ko';
export type ProposalFormat = 'technical' | 'price' | 'combined';
export type Currency = 'USD' | 'EUR' | 'KRW' | 'SGD';

export interface ProposalSection {
  title: string;
  content: string;
  order: number;
}

export interface GeneratedProposal {
  bid_id: string;
  product_id: string;
  language: ProposalLanguage;
  sections: ProposalSection[];
  executive_summary: string;
  technical_approach: string;
  pricing: string;
  timeline: string;
  generated_at: string;
  tokens_used: {
    input: number;
    output: number;
  };
  cost_usd: number;
}

export interface ProposalTemplate {
  name: string;
  sections: string[];
  format: ProposalFormat;
  language: ProposalLanguage;
}

// ============================================================================
// MULTI-LANGUAGE TEMPLATES
// ============================================================================

const TEMPLATES: Record<ProposalLanguage, Record<ProposalFormat, ProposalTemplate>> = {
  en: {
    technical: {
      name: 'Technical Proposal',
      sections: [
        'Project Overview',
        'Understanding of Requirements',
        'Technical Approach',
        'Technical Specifications',
        'Quality Assurance',
        'Delivery Schedule',
        'Maintenance Plan',
        'Company Profile & References',
      ],
      format: 'technical',
      language: 'en',
    },
    price: {
      name: 'Price Proposal',
      sections: [
        'Pricing Overview',
        'Item-wise Pricing',
        'Total Amount',
        'Delivery Terms',
        'Payment Terms',
        'Validity Period',
      ],
      format: 'price',
      language: 'en',
    },
    combined: {
      name: 'Combined Proposal',
      sections: [
        'Executive Summary',
        'Understanding of Tender Requirements',
        'Technical Proposal',
        'Product Specifications',
        'Implementation Schedule',
        'Price Proposal',
        'Quality & After-Sales Service',
        'Company Profile',
        'Past Performance & References',
      ],
      format: 'combined',
      language: 'en',
    },
  },
  de: {
    technical: {
      name: 'Technisches Angebot',
      sections: [
        'Projektübersicht',
        'Verständnis der Anforderungen',
        'Technischer Ansatz',
        'Technische Spezifikationen',
        'Qualitätssicherung',
        'Lieferzeitplan',
        'Wartungsplan',
        'Firmenprofil & Referenzen',
      ],
      format: 'technical',
      language: 'de',
    },
    price: {
      name: 'Preisangebot',
      sections: [
        'Preisübersicht',
        'Positionsweise Preisgestaltung',
        'Gesamtbetrag',
        'Lieferbedingungen',
        'Zahlungsbedingungen',
        'Gültigkeitsdauer',
      ],
      format: 'price',
      language: 'de',
    },
    combined: {
      name: 'Kombiniertes Angebot',
      sections: [
        'Zusammenfassung',
        'Verständnis der Ausschreibungsanforderungen',
        'Technisches Angebot',
        'Produktspezifikationen',
        'Umsetzungszeitplan',
        'Preisangebot',
        'Qualität & Kundendienst',
        'Firmenprofil',
        'Bisherige Leistungen & Referenzen',
      ],
      format: 'combined',
      language: 'de',
    },
  },
  fr: {
    technical: {
      name: 'Proposition Technique',
      sections: [
        'Aperçu du Projet',
        'Compréhension des Exigences',
        'Approche Technique',
        'Spécifications Techniques',
        'Assurance Qualité',
        "Calendrier de Livraison",
        'Plan de Maintenance',
        'Profil de la Société & Références',
      ],
      format: 'technical',
      language: 'fr',
    },
    price: {
      name: 'Proposition de Prix',
      sections: [
        'Aperçu des Prix',
        'Prix par Article',
        'Montant Total',
        'Conditions de Livraison',
        'Conditions de Paiement',
        'Période de Validité',
      ],
      format: 'price',
      language: 'fr',
    },
    combined: {
      name: 'Proposition Combinée',
      sections: [
        'Résumé Exécutif',
        "Compréhension des Exigences de l'Appel d'Offres",
        'Proposition Technique',
        'Spécifications du Produit',
        'Calendrier de Mise en Œuvre',
        'Proposition de Prix',
        'Qualité & Service Après-Vente',
        'Profil de la Société',
        'Performances Passées & Références',
      ],
      format: 'combined',
      language: 'fr',
    },
  },
  ko: {
    technical: {
      name: '기술제안서',
      sections: [
        '사업 개요',
        '기술 이해도',
        '수행 방법론',
        '기술 사양',
        '품질 보증',
        '납품 일정',
        '유지보수 계획',
        '회사 소개 및 실적',
      ],
      format: 'technical',
      language: 'ko',
    },
    price: {
      name: '가격제안서',
      sections: [
        '견적 개요',
        '품목별 단가',
        '총 금액',
        '납품 조건',
        '결제 조건',
        '유효 기간',
      ],
      format: 'price',
      language: 'ko',
    },
    combined: {
      name: '종합제안서',
      sections: [
        '제안 개요',
        '사업 이해 및 목표',
        '기술 제안',
        '제품 사양',
        '수행 일정',
        '가격 제안',
        '품질 및 A/S',
        '회사 소개',
        '과거 실적',
      ],
      format: 'combined',
      language: 'ko',
    },
  },
};

// ============================================================================
// SYSTEM PROMPTS (MULTI-LANGUAGE)
// ============================================================================

const SYSTEM_PROMPTS: Record<ProposalLanguage, string> = {
  en: `You are an expert proposal writer specializing in international manufacturing tenders.
Write persuasive and professional proposals based on tender requirements and product specifications.

Proposal Writing Principles:
1. Clear, specific, and detailed
2. Precisely address all tender requirements
3. Highlight technical advantages
4. Emphasize track record and reliability
5. Professional and formal tone
6. Comply with international tender standards (TED, SAM.gov, UNGM)
7. Use appropriate currency and units
8. Follow local regulations and certifications`,

  de: `Sie sind ein erfahrener Angebotsschreiber, spezialisiert auf internationale Fertigungsausschreibungen.
Erstellen Sie überzeugende und professionelle Angebote basierend auf Ausschreibungsanforderungen und Produktspezifikationen.

Grundsätze für das Verfassen von Angeboten:
1. Klar, spezifisch und detailliert
2. Alle Ausschreibungsanforderungen präzise erfüllen
3. Technische Vorteile hervorheben
4. Erfolgsgeschichte und Zuverlässigkeit betonen
5. Professioneller und formeller Ton
6. Internationale Ausschreibungsstandards einhalten (TED, SAM.gov, UNGM)
7. Angemessene Währung und Einheiten verwenden
8. Lokale Vorschriften und Zertifizierungen befolgen`,

  fr: `Vous êtes un rédacteur de propositions expert, spécialisé dans les appels d'offres internationaux pour la fabrication.
Rédigez des propositions convaincantes et professionnelles basées sur les exigences de l'appel d'offres et les spécifications du produit.

Principes de rédaction de propositions:
1. Claire, spécifique et détaillée
2. Répondre précisément à toutes les exigences de l'appel d'offres
3. Mettre en avant les avantages techniques
4. Souligner les antécédents et la fiabilité
5. Ton professionnel et formel
6. Respecter les normes internationales d'appel d'offres (TED, SAM.gov, UNGM)
7. Utiliser la devise et les unités appropriées
8. Respecter les réglementations et certifications locales`,

  ko: `당신은 제조업 국제 입찰 전문 제안서 작성 전문가입니다.
입찰 공고와 제품 정보를 바탕으로 설득력 있는 전문 제안서를 작성하세요.

제안서 작성 원칙:
1. 명확하고 구체적이며 상세하게 작성
2. 모든 입찰 요구사항에 정확히 부합
3. 기술적 우위 강조
4. 실적 및 신뢰성 강조
5. 전문적이고 격식있는 문체
6. 국제 입찰 표준 준수 (TED, SAM.gov, UNGM)
7. 적절한 통화 및 단위 사용
8. 현지 규정 및 인증 준수`,
};

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

export function formatCurrency(amount: number, currency: Currency): string {
  const formatters: Record<Currency, Intl.NumberFormat> = {
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
    KRW: new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }),
    SGD: new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }),
  };
  return formatters[currency].format(amount);
}

// ============================================================================
// PROPOSAL GENERATION
// ============================================================================

/**
 * Generate proposal for global tender
 */
export async function generateProposal(
  bidId: string,
  productId: string,
  options: {
    language?: ProposalLanguage;
    format?: ProposalFormat;
    effort?: 'low' | 'medium' | 'high';
  } = {}
): Promise<GeneratedProposal> {
  const {
    language = 'en',
    format = 'combined',
    effort = 'medium',
  } = options;

  const startTime = Date.now();

  try {
    // Step 1: Fetch bid information
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .select('*')
      .eq('id', bidId)
      .single();

    if (bidError || !bid) {
      throw new Error(`Bid not found: ${bidId}`);
    }

    // Step 2: Fetch product information
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error(`Product not found: ${productId}`);
    }

    // Step 3: Fetch match information (score, confidence)
    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('bid_id', bidId)
      .eq('product_id', productId)
      .single();

    // Step 4: Select template
    const template = TEMPLATES[language][format];
    const systemPrompt = SYSTEM_PROMPTS[language];

    // Step 5: Detect currency
    const currency: Currency =
      bid.currency?.toUpperCase() as Currency ||
      (language === 'en' ? 'USD' : language === 'de' ? 'EUR' : 'KRW');

    // Step 6: Generate proposal with Claude
    const response = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 16000,
      output_config: {
        effort: effort,
      },
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Write a ${template.name} for the following tender.

## Tender Information
- Title: ${bid.title}
- Organization: ${bid.organization}
- Country: ${bid.country || 'N/A'}
- Amount: ${bid.estimated_price ? formatCurrency(bid.estimated_price, currency) : 'TBD'}
- Deadline: ${bid.deadline}
- Description: ${bid.description || 'None'}
- Source: ${bid.source_id || 'N/A'}

## Product Information
- Product Name: ${product.name}
- Model: ${product.model}
- Category: ${product.category}
- Description: ${product.description || 'None'}
- Specifications: ${JSON.stringify(product.specs, null, 2)}
- Price Range: ${product.price_range || 'Negotiable'}

## Matching Information
- Match Score: ${match?.score || 'N/A'}/175 points
- Confidence: ${match?.confidence || 'N/A'}

## Proposal Structure (Write all sections)
${template.sections.map((section, idx) => `${idx + 1}. ${section}`).join('\n')}

Write each section in detail and respond in JSON format:
{
  "executive_summary": "Proposal summary (2-3 paragraphs)",
  "sections": [
    {
      "title": "Section title",
      "content": "Section content (detailed)",
      "order": 1
    }
  ],
  "technical_approach": "Technical approach",
  "pricing": "Price proposal (with specific amounts)",
  "timeline": "Implementation schedule (by phase)"
}`,
        },
      ],
    });

    // Step 7: Parse response
    const firstBlock = response.content[0];
    if (firstBlock.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }

    const proposalData = JSON.parse(firstBlock.text);

    // Step 8: Calculate cost
    const inputCost = (response.usage.input_tokens * 15) / 1_000_000; // $15/MTok
    const outputCost = (response.usage.output_tokens * 75) / 1_000_000; // $75/MTok
    const costUsd = inputCost + outputCost;

    // Step 9: Construct result
    const proposal: GeneratedProposal = {
      bid_id: bidId,
      product_id: productId,
      language,
      sections: proposalData.sections || [],
      executive_summary: proposalData.executive_summary || '',
      technical_approach: proposalData.technical_approach || '',
      pricing: proposalData.pricing || '',
      timeline: proposalData.timeline || '',
      generated_at: new Date().toISOString(),
      tokens_used: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
      cost_usd: costUsd,
    };

    console.log(`[Proposal] Generated for bid ${bidId}, product ${productId}`);
    console.log(`[Proposal] Language: ${language}, Format: ${format}`);
    console.log(`[Proposal] Tokens: ${response.usage.input_tokens} + ${response.usage.output_tokens}`);
    console.log(`[Proposal] Cost: $${costUsd.toFixed(4)}`);

    return proposal;
  } catch (error) {
    console.error(`[Proposal] Generation failed for ${bidId}:`, error);
    throw error;
  }
}

/**
 * Batch generate proposals for multiple products
 */
export async function batchGenerateProposals(
  bidId: string,
  productIds: string[],
  options: {
    language?: ProposalLanguage;
    format?: ProposalFormat;
    effort?: 'low' | 'medium' | 'high';
  } = {}
): Promise<GeneratedProposal[]> {
  const results = await Promise.all(
    productIds.map(async (productId) => {
      try {
        return await generateProposal(bidId, productId, options);
      } catch (error) {
        console.error(`[Proposal] Failed for product ${productId}:`, error);
        return null;
      }
    })
  );

  return results.filter((r) => r !== null) as GeneratedProposal[];
}

/**
 * Convert proposal to Markdown
 */
export function proposalToMarkdown(proposal: GeneratedProposal): string {
  const langTitles = {
    en: 'Proposal',
    de: 'Angebot',
    fr: 'Proposition',
    ko: '제안서',
  };

  const langGenerated = {
    en: 'Generated',
    de: 'Erstellt',
    fr: 'Généré',
    ko: '생성일',
  };

  let markdown = `# ${langTitles[proposal.language]}\n\n`;
  markdown += `**${langGenerated[proposal.language]}**: ${new Date(proposal.generated_at).toLocaleString(proposal.language === 'ko' ? 'ko-KR' : proposal.language === 'de' ? 'de-DE' : proposal.language === 'fr' ? 'fr-FR' : 'en-US')}\n\n`;
  markdown += `---\n\n`;

  // Executive summary
  const summaryTitles = {
    en: 'Executive Summary',
    de: 'Zusammenfassung',
    fr: 'Résumé Exécutif',
    ko: '제안 요약',
  };
  markdown += `## ${summaryTitles[proposal.language]}\n\n${proposal.executive_summary}\n\n`;

  // Sections
  const sortedSections = proposal.sections.sort((a, b) => a.order - b.order);
  for (const section of sortedSections) {
    markdown += `## ${section.title}\n\n${section.content}\n\n`;
  }

  // Technical approach
  if (proposal.technical_approach) {
    const techTitles = {
      en: 'Technical Approach',
      de: 'Technischer Ansatz',
      fr: 'Approche Technique',
      ko: '기술 접근 방법',
    };
    markdown += `## ${techTitles[proposal.language]}\n\n${proposal.technical_approach}\n\n`;
  }

  // Pricing
  if (proposal.pricing) {
    const priceTitles = {
      en: 'Price Proposal',
      de: 'Preisangebot',
      fr: 'Proposition de Prix',
      ko: '가격 제안',
    };
    markdown += `## ${priceTitles[proposal.language]}\n\n${proposal.pricing}\n\n`;
  }

  // Timeline
  if (proposal.timeline) {
    const timelineTitles = {
      en: 'Implementation Schedule',
      de: 'Umsetzungszeitplan',
      fr: 'Calendrier de Mise en Œuvre',
      ko: '수행 일정',
    };
    markdown += `## ${timelineTitles[proposal.language]}\n\n${proposal.timeline}\n\n`;
  }

  markdown += `---\n\n`;

  const disclaimer = {
    en: '*This proposal is an AI-generated draft. Please review and modify as needed.*',
    de: '*Dieses Angebot ist ein KI-generierter Entwurf. Bitte überprüfen und bei Bedarf ändern.*',
    fr: '*Cette proposition est un brouillon généré par IA. Veuillez réviser et modifier si nécessaire.*',
    ko: '*본 제안서는 AI가 자동 생성한 초안입니다. 검토 후 수정이 필요할 수 있습니다.*',
  };
  markdown += `${disclaimer[proposal.language]}\n`;

  return markdown;
}

/**
 * Convert proposal to HTML
 */
export function proposalToHTML(proposal: GeneratedProposal): string {
  const markdown = proposalToMarkdown(proposal);

  // Simple markdown to HTML conversion
  let html = markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gim, '<p>$1</p>')
    .replace(/<p><h/g, '<h')
    .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
    .replace(/---/g, '<hr />');

  return `
<!DOCTYPE html>
<html lang="${proposal.language}">
<head>
  <meta charset="UTF-8">
  <title>${proposal.language === 'en' ? 'Proposal' : proposal.language === 'de' ? 'Angebot' : proposal.language === 'fr' ? 'Proposition' : '제안서'}</title>
  <style>
    body {
      font-family: ${proposal.language === 'ko' ? "'Noto Sans KR', sans-serif" : "'Arial', sans-serif"};
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #1a1a1a; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
    h3 { color: #555; }
    hr { border: none; border-top: 1px solid #eee; margin: 30px 0; }
    p { margin: 10px 0; }
  </style>
</head>
<body>
${html}
</body>
</html>
  `.trim();
}
