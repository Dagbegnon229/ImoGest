import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 rounded-full bg-[#f8fafc] p-4 text-[#6b7280]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#171717]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-[#6b7280]">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
