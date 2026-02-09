"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

/* ---------- Types ---------- */
type ToastType = "success" | "error" | "info" | "warning";

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (msg: Omit<ToastMessage, "id">) => void;
  dismiss: (id: string) => void;
}

/* ---------- Styling maps ---------- */
const typeStyles: Record<ToastType, string> = {
  success: "border-l-4 border-l-[#10b981] bg-white",
  error: "border-l-4 border-l-red-500 bg-white",
  info: "border-l-4 border-l-blue-500 bg-white",
  warning: "border-l-4 border-l-amber-500 bg-white",
};

const typeIcons: Record<ToastType, ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-[#10b981]" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
};

/* ---------- Context ---------- */
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

/* ---------- Single Toast ---------- */
function ToastItem({
  item,
  onDismiss,
}: {
  item: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(item.id);
    }, item.duration || 4000);
    return () => clearTimeout(timer);
  }, [item.id, item.duration, onDismiss]);

  return (
    <div
      className={`pointer-events-auto w-80 rounded-lg shadow-lg border border-[#e5e7eb] ${typeStyles[item.type]} animate-in slide-in-from-right duration-300`}
      role="alert"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="flex-shrink-0 mt-0.5">{typeIcons[item.type]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#171717]">{item.title}</p>
          {item.description && (
            <p className="mt-1 text-xs text-[#6b7280]">{item.description}</p>
          )}
        </div>
        <button
          onClick={() => onDismiss(item.id)}
          className="flex-shrink-0 rounded p-1 text-[#6b7280] hover:bg-gray-100 hover:text-[#171717] transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Container (rendered via portal) ---------- */
function ToastContainer({ toasts, dismiss }: { toasts: ToastMessage[]; dismiss: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} item={t} onDismiss={dismiss} />
      ))}
    </div>,
    document.body
  );
}

/* ---------- Provider ---------- */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((msg: Omit<ToastMessage, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { ...msg, id }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}
