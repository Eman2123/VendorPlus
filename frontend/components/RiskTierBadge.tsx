const TIER_LABELS = ["Confirmed", "Likely", "At Risk", "High Risk", "Critical"];
const TIER_COLORS = [
  "bg-tier0/10 text-tier0 border-tier0/30 dark:bg-tier0/20",
  "bg-tier1/10 text-tier1 border-tier1/30 dark:bg-tier1/20",
  "bg-tier2/10 text-tier2 border-tier2/30 dark:bg-tier2/20",
  "bg-tier3/10 text-tier3 border-tier3/30 dark:bg-tier3/20",
  "bg-tier4/10 text-tier4 border-tier4/30 dark:bg-tier4/20",
];

export default function RiskTierBadge({ tier }: { tier: 0 | 1 | 2 | 3 | 4 }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TIER_COLORS[tier]}`}
    >
      Tier {tier} · {TIER_LABELS[tier]}
    </span>
  );
}
