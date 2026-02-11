import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  className?: string;
  href?: string;
}

export function StatsCard({
  label,
  value,
  change,
  icon,
  className = "",
  href,
}: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  const content = (
    <>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#6b7280]">{label}</p>
          <p className="mt-2 text-3xl font-bold text-[#171717]">{value}</p>
        </div>
        {icon && (
          <div className="flex-shrink-0 rounded-lg bg-[#d1fae5] p-3 text-[#10b981]">
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-4 flex items-center gap-1.5">
          {isPositive && (
            <TrendingUp className="h-4 w-4 text-[#10b981]" />
          )}
          {isNegative && (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span
            className={`text-sm font-medium ${
              isPositive ? "text-[#10b981]" : "text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {change}%
          </span>
          <span className="text-sm text-[#6b7280]">vs last month</span>
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`block bg-white rounded-xl border border-[#e5e7eb] p-6 hover:border-[#10b981] hover:shadow-md transition-all cursor-pointer group ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border border-[#e5e7eb] p-6 ${className}`}
    >
      {content}
    </div>
  );
}
