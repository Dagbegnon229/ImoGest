import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({
  children,
  header,
  className = "",
  padding = true,
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#e5e7eb] overflow-hidden ${className}`}
    >
      {header && (
        <div className="px-6 py-4 border-b border-[#e5e7eb]">{header}</div>
      )}
      <div className={padding ? "p-6" : ""}>{children}</div>
    </div>
  );
}
