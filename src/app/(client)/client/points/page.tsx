"use client";

import { useMemo } from "react";
import {
  Award,
  TrendingUp,
  Star,
  Gift,
  Trophy,
  Zap,
  Target,
  Clock,
  CheckCircle,
  ArrowUp,
  ShieldCheck,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import {
  loyaltyTierLabels,
  pointsTypeLabels,
} from "@/lib/constants";

// ── Tier configuration ─────────────────────────────────────────────────────

interface TierConfig {
  key: string;
  label: string;
  minPoints: number;
  icon: React.ReactNode;
  gradient: string;
  ring: string;
}

const TIERS: TierConfig[] = [
  {
    key: "bronze",
    label: "Bronze",
    minPoints: 0,
    icon: <Award className="h-5 w-5" />,
    gradient: "from-orange-400 to-orange-600",
    ring: "ring-orange-300",
  },
  {
    key: "silver",
    label: "Argent",
    minPoints: 400,
    icon: <Star className="h-5 w-5" />,
    gradient: "from-gray-400 to-gray-500",
    ring: "ring-gray-300",
  },
  {
    key: "gold",
    label: "Or",
    minPoints: 800,
    icon: <Trophy className="h-5 w-5" />,
    gradient: "from-yellow-400 to-yellow-600",
    ring: "ring-yellow-300",
  },
  {
    key: "platinum",
    label: "Platine",
    minPoints: 1500,
    icon: <Zap className="h-5 w-5" />,
    gradient: "from-indigo-400 to-indigo-600",
    ring: "ring-indigo-300",
  },
  {
    key: "diamond",
    label: "Diamant",
    minPoints: 2000,
    icon: <Gift className="h-5 w-5" />,
    gradient: "from-cyan-400 to-cyan-600",
    ring: "ring-cyan-300",
  },
];

// ── Hero badge styling per tier ────────────────────────────────────────────

const tierHeroStyles: Record<string, { bg: string; text: string; glow: string }> = {
  bronze: {
    bg: "bg-gradient-to-br from-orange-400 to-orange-600",
    text: "text-white",
    glow: "shadow-orange-200",
  },
  silver: {
    bg: "bg-gradient-to-br from-gray-300 to-gray-500",
    text: "text-white",
    glow: "shadow-gray-200",
  },
  gold: {
    bg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    text: "text-white",
    glow: "shadow-yellow-200",
  },
  platinum: {
    bg: "bg-gradient-to-br from-indigo-400 to-indigo-600",
    text: "text-white",
    glow: "shadow-indigo-200",
  },
  diamond: {
    bg: "bg-gradient-to-br from-cyan-400 to-cyan-600",
    text: "text-white",
    glow: "shadow-cyan-200",
  },
};

// ── Circular Progress Component ────────────────────────────────────────────

function CircularProgress({
  value,
  size = 96,
  strokeWidth = 8,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-[#0f1b2d]">{value}%</span>
        <span className="text-[10px] text-[#6b7280] leading-tight">
          Ponctualit&eacute;
        </span>
      </div>
    </div>
  );
}

// ── How‑to‑earn config ─────────────────────────────────────────────────────

const HOW_TO_EARN = [
  {
    icon: <Zap className="h-5 w-5 text-yellow-500" />,
    label: "Paiement anticip\u00e9",
    points: 50,
    description: "Payez avant la date d'\u00e9ch\u00e9ance",
  },
  {
    icon: <CheckCircle className="h-5 w-5 text-[#10b981]" />,
    label: "Paiement \u00e0 temps",
    points: 30,
    description: "Payez le jour de l'\u00e9ch\u00e9ance",
  },
  {
    icon: <Star className="h-5 w-5 text-indigo-500" />,
    label: "Bonus fid\u00e9lit\u00e9 mensuel",
    points: 100,
    description: "R\u00e9compense de fid\u00e9lit\u00e9 chaque mois",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-cyan-500" />,
    label: "Aucun incident",
    points: 25,
    description: "Mois sans aucun incident signal\u00e9",
  },
];

// ── Page component ─────────────────────────────────────────────────────────

export default function LoyaltyPointsPage() {
  const { user } = useAuth();
  const { tenants, getPointsByTenant, getLoyaltyProfile } = useData();

  const tenant = useMemo(
    () => tenants.find((t) => t.id === user?.id),
    [tenants, user?.id],
  );

  const profile = useMemo(
    () => (tenant ? getLoyaltyProfile(tenant.id) : undefined),
    [tenant, getLoyaltyProfile],
  );

  const transactions = useMemo(() => {
    if (!tenant) return [];
    return [...getPointsByTenant(tenant.id)].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [tenant, getPointsByTenant]);

  // Derived values
  const totalPoints = profile?.totalPoints ?? 0;
  const currentTier = profile?.currentTier ?? "bronze";
  const punctualityScore = profile?.punctualityScore ?? 0;
  const consecutiveOnTime = profile?.consecutiveOnTime ?? 0;
  const totalPayments = profile?.totalPayments ?? 0;
  const onTimePayments = profile?.onTimePayments ?? 0;

  // Next tier calculation
  const currentTierIndex = TIERS.findIndex((t) => t.key === currentTier);
  const nextTier =
    currentTierIndex < TIERS.length - 1
      ? TIERS[currentTierIndex + 1]
      : null;
  const pointsToNext = nextTier ? nextTier.minPoints - totalPoints : 0;

  // Progress within current tier range (for tier progress bar)
  const currentTierMin = TIERS[currentTierIndex]?.minPoints ?? 0;
  const nextTierMin = nextTier?.minPoints ?? currentTierMin;
  const tierProgress =
    nextTier && nextTierMin > currentTierMin
      ? Math.min(
          100,
          Math.round(
            ((totalPoints - currentTierMin) /
              (nextTierMin - currentTierMin)) *
              100,
          ),
        )
      : 100;

  const heroStyle = tierHeroStyles[currentTier] ?? tierHeroStyles.bronze;

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f1b2d]">
          Points fid&eacute;lit&eacute;
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Suivez vos points, votre niveau et vos r&eacute;compenses
        </p>
      </div>

      {/* ── 1. Hero: Loyalty Profile Card ───────────────────────────────── */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          {/* Left: Tier Badge + Points */}
          <div className="flex items-center gap-6">
            {/* Tier Badge */}
            <div
              className={`flex-shrink-0 w-24 h-24 rounded-2xl ${heroStyle.bg} ${heroStyle.glow} shadow-lg flex flex-col items-center justify-center`}
            >
              <Trophy className={`h-8 w-8 ${heroStyle.text} mb-1`} />
              <span
                className={`text-sm font-bold ${heroStyle.text} tracking-wide`}
              >
                {loyaltyTierLabels[currentTier] || currentTier}
              </span>
            </div>

            {/* Points */}
            <div>
              <p className="text-sm text-[#6b7280] mb-1">Total des points</p>
              <p className="text-4xl font-extrabold text-[#0f1b2d] tracking-tight">
                {totalPoints.toLocaleString("fr-FR")}
              </p>
              {nextTier && (
                <p className="text-xs text-[#6b7280] mt-1 flex items-center gap-1">
                  <ArrowUp className="h-3 w-3 text-[#10b981]" />
                  <span>
                    Encore{" "}
                    <span className="font-semibold text-[#0f1b2d]">
                      {pointsToNext}
                    </span>{" "}
                    pts pour{" "}
                    <span className="font-semibold">
                      {nextTier.label}
                    </span>
                  </span>
                </p>
              )}
              {!nextTier && (
                <p className="text-xs text-[#10b981] mt-1 font-medium">
                  Niveau maximum atteint !
                </p>
              )}
            </div>
          </div>

          {/* Center: Circular Punctuality */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <CircularProgress value={punctualityScore} />
          </div>

          {/* Right: Stats */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#f8fafc] rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-[#10b981]" />
              </div>
              <p className="text-2xl font-bold text-[#0f1b2d]">
                {consecutiveOnTime}
              </p>
              <p className="text-xs text-[#6b7280] mt-0.5 leading-tight">
                Paiements cons&eacute;cutifs &agrave; temps
              </p>
            </div>
            <div className="bg-[#f8fafc] rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-[#0f1b2d]">
                {totalPayments}
              </p>
              <p className="text-xs text-[#6b7280] mt-0.5 leading-tight">
                Total paiements
              </p>
            </div>
            <div className="bg-[#f8fafc] rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-[#0f1b2d]">
                {onTimePayments}
              </p>
              <p className="text-xs text-[#6b7280] mt-0.5 leading-tight">
                Paiements &agrave; temps
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 2. Tier Progress Section ────────────────────────────────────── */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#10b981]" />
            <h2 className="text-lg font-semibold text-[#0f1b2d]">
              Progression de niveau
            </h2>
          </div>
        }
      >
        {/* Tier ladder */}
        <div className="space-y-4">
          {/* Progress bar (overall) */}
          <div>
            <div className="flex items-center justify-between text-xs text-[#6b7280] mb-2">
              <span>
                {loyaltyTierLabels[currentTier]} ({currentTierMin} pts)
              </span>
              {nextTier ? (
                <span>
                  {nextTier.label} ({nextTier.minPoints} pts)
                </span>
              ) : (
                <span>Niveau max</span>
              )}
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#10b981] to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${tierProgress}%` }}
              />
            </div>
            {nextTier && (
              <p className="text-xs text-[#6b7280] mt-1.5 text-right">
                {tierProgress}% &mdash; encore {pointsToNext} points
              </p>
            )}
          </div>

          {/* Visual tier ladder */}
          <div className="flex items-center justify-between gap-1 pt-2">
            {TIERS.map((tier, index) => {
              const isActive = tier.key === currentTier;
              const isReached = totalPoints >= tier.minPoints;

              return (
                <div key={tier.key} className="flex-1 flex flex-col items-center">
                  {/* Connector + Node */}
                  <div className="relative w-full flex items-center justify-center mb-2">
                    {/* Left connector line */}
                    {index > 0 && (
                      <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 w-1/2 ${
                          isReached
                            ? "bg-[#10b981]"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                    {/* Right connector line */}
                    {index < TIERS.length - 1 && (
                      <div
                        className={`absolute right-0 top-1/2 -translate-y-1/2 h-1 w-1/2 ${
                          totalPoints >= TIERS[index + 1].minPoints
                            ? "bg-[#10b981]"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                    {/* Node circle */}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? `bg-gradient-to-br ${tier.gradient} text-white ring-4 ${tier.ring} shadow-md`
                          : isReached
                            ? `bg-gradient-to-br ${tier.gradient} text-white`
                            : "bg-gray-100 text-[#6b7280]"
                      }`}
                    >
                      {tier.icon}
                    </div>
                  </div>
                  {/* Label */}
                  <span
                    className={`text-[11px] font-medium text-center leading-tight ${
                      isActive
                        ? "text-[#0f1b2d] font-bold"
                        : isReached
                          ? "text-[#0f1b2d]"
                          : "text-[#6b7280]"
                    }`}
                  >
                    {tier.label}
                  </span>
                  <span
                    className={`text-[10px] ${
                      isActive ? "text-[#10b981] font-semibold" : "text-[#6b7280]"
                    }`}
                  >
                    {tier.minPoints} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── 3. How to earn points + 4. Transaction History ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* How to earn points */}
        <Card
          header={
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-[#10b981]" />
              <h2 className="text-lg font-semibold text-[#0f1b2d]">
                Comment gagner des points
              </h2>
            </div>
          }
        >
          <div className="space-y-4">
            {HOW_TO_EARN.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-[#e5e7eb] flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0f1b2d]">
                    {item.label}
                  </p>
                  <p className="text-xs text-[#6b7280]">{item.description}</p>
                </div>
                <span className="flex-shrink-0 text-sm font-bold text-[#10b981]">
                  +{item.points} pts
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Transaction History */}
        <div className="lg:col-span-2">
          <Card
            padding={false}
            header={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#10b981]" />
                  <h2 className="text-lg font-semibold text-[#0f1b2d]">
                    Historique des transactions
                  </h2>
                </div>
                <Badge variant="default">
                  {transactions.length} transaction
                  {transactions.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            }
          >
            {transactions.length === 0 ? (
              <EmptyState
                icon={<Award className="h-10 w-10" />}
                title="Aucune transaction"
                description="Vos transactions de points appara&icirc;tront ici d&egrave;s que vous commencerez &agrave; en accumuler."
              />
            ) : (
              <div className="divide-y divide-[#e5e7eb]">
                {transactions.map((tx) => {
                  const isPositive = tx.points > 0;

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fafc] transition-colors"
                    >
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                          isPositive
                            ? "bg-[#d1fae5] text-[#059669]"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowUp className="h-4 w-4 rotate-180" />
                        )}
                      </div>

                      {/* Label + Description */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0f1b2d]">
                          {pointsTypeLabels[tx.type] || tx.type}
                        </p>
                        <p className="text-xs text-[#6b7280] truncate">
                          {tx.description}
                        </p>
                      </div>

                      {/* Points */}
                      <span
                        className={`flex-shrink-0 text-sm font-bold tabular-nums ${
                          isPositive ? "text-[#10b981]" : "text-red-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {tx.points}
                      </span>

                      {/* Date */}
                      <span className="flex-shrink-0 text-xs text-[#6b7280] w-20 text-right">
                        {formatDate(tx.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
