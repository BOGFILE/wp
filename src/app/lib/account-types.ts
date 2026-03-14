export type AccountType = {
  id: string;
  title: string;
  description: string;
  subDescription?: string;
  tags: string[];
  icon: 'Building2' | 'Shield' | 'Lock' | 'Bitcoin' | 'Custom';
  fee: string;
};

export const ACCOUNT_TYPES: AccountType[] = [
  {
    id: "savings",
    title: "Savings Account",
    description: "Account Opening Fee (Onboarding & Compliance Processing Fee) €25,000",
    tags: ["SWIFT Compatible"],
    icon: "Building2",
    fee: "€25,000",
  },
  {
    id: "custody",
    title: "Custody Account",
    description: "Account Opening Fee (Onboarding & Compliance Processing Fee) €25,000",
    tags: ["ETF Compatible"],
    icon: "Shield",
    fee: "€25,000",
  },
  {
    id: "numbered",
    title: "Numbered Account",
    description: "Account Opening Fee (Onboarding & Compliance Processing Fee) €50,000",
    tags: [],
    icon: "Lock",
    fee: "€50,000",
  },
  {
    id: "cryptocurrency",
    title: "Cryptocurrency Account",
    description: "Account Opening Fee (Onboarding & Compliance Processing Fee) €25,000",
    tags: ["ETF Compatible"],
    icon: "Bitcoin",
    fee: "€25,000",
  },
];
