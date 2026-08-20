import { ExpenseCategory } from "../types";

export interface ExpenseClassificationResult {
  category: ExpenseCategory;
  confidence: number; // 0 to 1
  reason: string;
  suggestedVendor?: string;
  taxDeductible: boolean;
  taxDeductibleReason?: string;
  source: "gemini" | "heuristic";
}

export const EXPENSE_CATEGORIES: {
  value: ExpenseCategory;
  label: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    value: "Office Supplies",
    label: "Office Supplies",
    description: "Stationery, printer paper, ink cartridges, packaging & office consumables",
    color: "bg-amber-500",
    badgeBg: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-800",
  },
  {
    value: "Utilities",
    label: "Utilities & Connectivity",
    description: "Electricity (Eskom/Municipal), water, fibre internet, mobile & telephone",
    color: "bg-cyan-500",
    badgeBg: "bg-cyan-50 border-cyan-200",
    badgeText: "text-cyan-800",
  },
  {
    value: "Travel",
    label: "Travel & Transport",
    description: "Uber/Bolt, flights, accommodation, car hire, toll gates & business parking",
    color: "bg-emerald-500",
    badgeBg: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-800",
  },
  {
    value: "Vehicle & Petrol",
    label: "Vehicle & Petrol",
    description: "Fuel (Engen/Shell/Sasol), vehicle maintenance, tyres, oil & workshop servicing",
    color: "bg-orange-500",
    badgeBg: "bg-orange-50 border-orange-200",
    badgeText: "text-orange-800",
  },
  {
    value: "Software & Cloud",
    label: "Software & Cloud Services",
    description: "Google Workspace, Microsoft 365, AWS, GitHub, SaaS subscriptions & domain hosting",
    color: "bg-purple-500",
    badgeBg: "bg-purple-50 border-purple-200",
    badgeText: "text-purple-800",
  },
  {
    value: "Rent & Property",
    label: "Rent & Property",
    description: "Office rent, warehouse lease, building levies, storage & business premises",
    color: "bg-blue-500",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-800",
  },
  {
    value: "Professional Fees",
    label: "Professional Fees",
    description: "Legal, accounting, SAIPA/SAICA audit, tax consulting & compliance certifications",
    color: "bg-indigo-500",
    badgeBg: "bg-indigo-50 border-indigo-200",
    badgeText: "text-indigo-800",
  },
  {
    value: "Marketing & Ads",
    label: "Marketing & Advertising",
    description: "Google Ads, Meta/Facebook Ads, LinkedIn, graphic design, print flyers & promotional",
    color: "bg-pink-500",
    badgeBg: "bg-pink-50 border-pink-200",
    badgeText: "text-pink-800",
  },
  {
    value: "Operating Expenses",
    label: "Operating Expenses",
    description: "General staff refreshments, cleaning materials, small tools & daily workshop costs",
    color: "bg-slate-500",
    badgeBg: "bg-slate-100 border-slate-200",
    badgeText: "text-slate-800",
  },
  {
    value: "Other",
    label: "Other Expenses",
    description: "Bank fees, interest charges, unexpected operational disbursements",
    color: "bg-zinc-500",
    badgeBg: "bg-zinc-100 border-zinc-200",
    badgeText: "text-zinc-800",
  },
];

/**
 * High-speed deterministic regex & keyword matcher for instantaneous offline suggestion
 */
export function classifyExpenseLocal(
  description: string = "",
  vendor: string = "",
  _amount?: number
): ExpenseClassificationResult {
  const text = `${description} ${vendor}`.toLowerCase().trim();

  if (!text) {
    return {
      category: "Operating Expenses",
      confidence: 0.5,
      reason: "Default operating expense category",
      taxDeductible: true,
      source: "heuristic",
    };
  }

  // 1. Travel & Transport
  if (
    /\b(uber|bolt|lyft|flight|flysafair|airlink|saa|hotel|lodging|airbnb|gautrain|avis|hertz|europcar|budget rent|car hire|car rental|parking|toll|sanral|toll gate|airport|shuttle|flight ticket|durban hotel|cape town stay|conference accommodation)\b/i.test(
      text
    )
  ) {
    return {
      category: "Travel",
      confidence: 0.95,
      reason: "Matched travel, ride-hailing, flight, or business accommodation keywords",
      taxDeductible: true,
      taxDeductibleReason: "Business travel incurred in the production of income",
      source: "heuristic",
    };
  }

  // 2. Utilities & Connectivity
  if (
    /\b(eskom|electricity|prepaid power|city power|city of jhb|city of cape town|city of tshwane|water|municipal|rates|refuse|fibre|wifi|broadband|internet|openserve|vumatel|frogfoot|afrihost|webafrica|cool ideas|vodacom|mtn|telkom|cell c|rain 5g|telephone|mobile data)\b/i.test(
      text
    )
  ) {
    return {
      category: "Utilities",
      confidence: 0.96,
      reason: "Matched municipal utilities, electricity, or telecom & fibre broadband",
      taxDeductible: true,
      taxDeductibleReason: "Essential operational utility service",
      source: "heuristic",
    };
  }

  // 3. Office Supplies & Stationery
  if (
    /\b(stationery|paper|a4 paper|printer|ink|toner|cartridge|pen|pens|notebook|stapler|staples|envelope|packaging|cardboard|bubble wrap|tape|makro|waltons|office national|desk|chair|whiteboard|binder|files|laminat|post-it)\b/i.test(
      text
    )
  ) {
    return {
      category: "Office Supplies",
      confidence: 0.94,
      reason: "Matched office stationery, printing media, or office equipment supply keywords",
      taxDeductible: true,
      taxDeductibleReason: "Consumable office supplies deductible under Section 11(a)",
      source: "heuristic",
    };
  }

  // 4. Vehicle & Petrol
  if (
    /\b(engen|shell|bp|caltex|sasol|totalenergies|total petrol|petrol|diesel|fuel|unleaded|service station|oil change|castrol|tyre|tires|tyres|tiger wheel|supa quick|hi-q|brakes|clutch|wheel alignment|mechanic|bakkie|auto spares|service kit)\b/i.test(
      text
    )
  ) {
    return {
      category: "Vehicle & Petrol",
      confidence: 0.95,
      reason: "Matched commercial vehicle fuel, garage station, or automotive servicing",
      taxDeductible: true,
      taxDeductibleReason: "Business vehicle operational expense",
      source: "heuristic",
    };
  }

  // 5. Software & Cloud
  if (
    /\b(google workspace|google cloud|aws|amazon web|azure|github|figma|adobe|creative cloud|microsoft 365|office 365|zoom|slack|chatgpt|openai|canva|dropbox|notion|atlassian|jira|godaddy|hostinger|hetzner|domains|domain renewal|saas|api credits)\b/i.test(
      text
    )
  ) {
    return {
      category: "Software & Cloud",
      confidence: 0.97,
      reason: "Matched SaaS cloud software, hosting, or productivity suite provider",
      taxDeductible: true,
      taxDeductibleReason: "Cloud software subscription",
      source: "heuristic",
    };
  }

  // 6. Marketing & Advertising
  if (
    /\b(google ads|google adwords|meta ads|facebook ads|instagram ads|linkedin ads|tiktok ads|advertising|marketing|flyer|flyers|banners|billboard|signage|promotional|branding|seo|social media campaign|graphic design|printing banners)\b/i.test(
      text
    )
  ) {
    return {
      category: "Marketing & Ads",
      confidence: 0.93,
      reason: "Matched digital advertising platform or promotional campaign material",
      taxDeductible: true,
      taxDeductibleReason: "Marketing expenditure for business revenue generation",
      source: "heuristic",
    };
  }

  // 7. Rent & Property
  if (
    /\b(rent|rental|lease|landlord|commercial lease|property levy|body corporate|storage unit|storage park|office space|workshop rental|building levy|rates and taxes office)\b/i.test(
      text
    )
  ) {
    return {
      category: "Rent & Property",
      confidence: 0.94,
      reason: "Matched commercial premises lease, office rental, or property levy",
      taxDeductible: true,
      taxDeductibleReason: "Business premises operational lease",
      source: "heuristic",
    };
  }

  // 8. Professional Fees
  if (
    /\b(attorney|lawyer|legal|advocate|court fee|saipa|saica|auditor|accounting fee|bookkeeping fee|tax consultant|compliance|notary|cipc fee|annual return cipc|iso certification)\b/i.test(
      text
    )
  ) {
    return {
      category: "Professional Fees",
      confidence: 0.92,
      reason: "Matched professional legal, accounting, or statutory regulatory advisory fees",
      taxDeductible: true,
      taxDeductibleReason: "Professional business advisory fees",
      source: "heuristic",
    };
  }

  // 9. Refreshments & Operating Supplies
  if (
    /\b(coffee|tea|milk|sugar|nespresso|checkers|woolworths|pick n pay|spar|clicks|cleaning|detergent|bleach|hand soap|toilet paper|sunlight|refreshments|staff kitchen|workshop rag|wd-40|grease|gloves)\b/i.test(
      text
    )
  ) {
    return {
      category: "Operating Expenses",
      confidence: 0.88,
      reason: "Matched operational consumables, cleaning, or staff kitchen provisions",
      taxDeductible: true,
      taxDeductibleReason: "Staff welfare and operational upkeep",
      source: "heuristic",
    };
  }

  // 10. Bank Charges / Other
  if (/\b(bank fee|bank charge|service fee|cash deposit fee|monthly account fee|interest paid|overdraft interest)\b/i.test(text)) {
    return {
      category: "Other",
      confidence: 0.90,
      reason: "Matched financial institution administration fees or interest charges",
      taxDeductible: true,
      taxDeductibleReason: "Bank operational administration fees",
      source: "heuristic",
    };
  }

  return {
    category: "Operating Expenses",
    confidence: 0.70,
    reason: "Standard general operating expense",
    taxDeductible: true,
    source: "heuristic",
  };
}

/**
 * Async classifier connecting to the server-side Gemini 3.7 Flash endpoint,
 * falling back to deterministic heuristics when offline or during connection latency.
 */
export async function classifyExpenseAI(
  description: string,
  vendor: string = "",
  amount: number = 0
): Promise<ExpenseClassificationResult> {
  const localGuess = classifyExpenseLocal(description, vendor, amount);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

    const response = await fetch("/api/gemini/classify-expense", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        vendor,
        amount,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.category) {
        return {
          category: data.category as ExpenseCategory,
          confidence: data.confidence || 0.95,
          reason: data.reason || localGuess.reason,
          suggestedVendor: data.suggestedVendor || vendor,
          taxDeductible: data.taxDeductible !== false,
          taxDeductibleReason: data.taxDeductibleReason,
          source: "gemini",
        };
      }
    }
  } catch {
    // Graceful offline fallback
  }

  return localGuess;
}
