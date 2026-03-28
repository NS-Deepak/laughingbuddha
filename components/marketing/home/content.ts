export interface HowItWorksStep {
  id: string;
  title: string;
  description: string;
  icon: "message" | "search" | "clock" | "activity";
}

export interface ChecklistItem {
  id: string;
  text: string;
}

export interface PricingFeature {
  label: string;
  included: boolean;
}

export interface PricingPlan {
  tier: string;
  price: string;
  per: string;
  tag: string;
  cta: string;
  ctaClassName: string;
  badge?: string;
  className?: string;
  features: PricingFeature[];
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    id: "01",
    title: "Connect Telegram",
    description:
      "Authorise in one click. A private channel is created exclusively for your alerts. No groups, no other users, no noise.",
    icon: "message",
  },
  {
    id: "02",
    title: "Add Your Stocks",
    description:
      "Search any NSE or BSE symbol. Set a price target, a stop-loss, or a percentage threshold. Monitoring begins immediately.",
    icon: "search",
  },
  {
    id: "03",
    title: "Schedule Your Alerts",
    description:
      "A 9:15 AM market-open snapshot. A 3:00 PM pre-close brief. Schedule once, runs every trading session without touching the app.",
    icon: "clock",
  },
  {
    id: "04",
    title: "Act on the Signal",
    description:
      "Symbol. Price. Change. Trigger reason. Everything to decide in four seconds. The signal that makes you faster than the trader next to you.",
    icon: "activity",
  },
];

export const ALERT_CHECKLIST: ChecklistItem[] = [
  {
    id: "symbol-price",
    text: "<strong>Symbol + live price</strong> - no need to open another app",
  },
  {
    id: "trigger-reason",
    text: "<strong>Trigger reason</strong> - target hit, stop-loss breached, or scheduled time",
  },
  {
    id: "session-change",
    text: "<strong>Session % change</strong> - instant read on momentum direction",
  },
  {
    id: "timestamp",
    text: "<strong>Exact timestamp</strong> - know if it broke the level 10 seconds or 10 minutes ago",
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    tier: "Free",
    price: "₹0",
    per: "/month",
    tag: "The full alert experience for five stocks. Free, with no expiry.",
    cta: "Start Free - No Card",
    ctaClassName: "btn-plan bp-out",
    features: [
      { label: "Up to 5 stocks", included: true },
      { label: "5 alerts per day", included: true },
      { label: "Price target alerts", included: true },
      { label: "Private Telegram channel", included: true },
      { label: "Scheduled time alerts", included: false },
      { label: "Multiple watchlists", included: false },
    ],
  },
  {
    tier: "Pro",
    price: "₹299",
    per: "/month",
    tag: "For active traders who need unlimited alerts, scheduling, and no daily limits.",
    cta: "Start Pro - ₹299/month",
    ctaClassName: "btn-plan bp-brand",
    badge: "Most Popular",
    className: "is-pro",
    features: [
      { label: "Up to 50 stocks", included: true },
      { label: "Unlimited alerts", included: true },
      { label: "Target + Stop-loss alerts", included: true },
      { label: "Scheduled time alerts", included: true },
      { label: "5 watchlists", included: true },
      { label: "Percentage move alerts", included: true },
    ],
  },
  {
    tier: "Professional",
    price: "₹799",
    per: "/month",
    tag: "For full-time traders running large, complex watchlists every session.",
    cta: "Start Professional",
    ctaClassName: "btn-plan bp-out",
    features: [
      { label: "Unlimited stocks", included: true },
      { label: "Unlimited alerts", included: true },
      { label: "All Pro features", included: true },
      { label: "Unlimited watchlists", included: true },
      { label: "Priority alert delivery", included: true },
      { label: "Early feature access", included: true },
    ],
  },
];
