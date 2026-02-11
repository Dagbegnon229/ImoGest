"use client";

import { useState, useMemo } from "react";
import {
  FolderOpen,
  FileText,
  Receipt,
  Bell,
  File,
  Download,
  Filter,
  Calendar,
  HardDrive,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { formatDate, formatFileSize } from "@/lib/utils";
import {
  documentTypeLabels,
  documentTypeColors,
} from "@/lib/constants";
import type { DocumentType } from "@/types/document";

// ---------------------------------------------------------------------------
// Filter tab configuration
// ---------------------------------------------------------------------------

interface FilterTab {
  key: "all" | DocumentType;
  label: string;
}

const filterTabs: FilterTab[] = [
  { key: "all", label: "Tous" },
  { key: "lease_contract", label: "Contrats" },
  { key: "receipt", label: "Reçus" },
  { key: "notice", label: "Avis" },
  { key: "invoice", label: "Factures" },
];

// ---------------------------------------------------------------------------
// Icon helper
// ---------------------------------------------------------------------------

function getDocumentIcon(type: DocumentType) {
  switch (type) {
    case "lease_contract":
      return <FileText className="h-6 w-6" />;
    case "receipt":
      return <Receipt className="h-6 w-6" />;
    case "notice":
      return <Bell className="h-6 w-6" />;
    case "invoice":
      return <File className="h-6 w-6" />;
    default:
      return <File className="h-6 w-6" />;
  }
}

function getDocumentIconColor(type: DocumentType): string {
  switch (type) {
    case "lease_contract":
      return "bg-blue-50 text-blue-600";
    case "receipt":
      return "bg-green-50 text-green-600";
    case "notice":
      return "bg-yellow-50 text-yellow-600";
    case "invoice":
      return "bg-purple-50 text-purple-600";
    default:
      return "bg-gray-50 text-[#6b7280]";
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function MyDocumentsPage() {
  const { user } = useAuth();
  const { tenants, getDocumentsByTenant } = useData();
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState<"all" | DocumentType>("all");

  // Resolve tenant record from the authenticated user
  const tenant = useMemo(
    () => tenants.find((t) => t.id === user?.id),
    [tenants, user?.id],
  );

  // Fetch all documents for this tenant, sorted newest-first
  const allDocuments = useMemo(() => {
    if (!tenant) return [];
    return [...getDocumentsByTenant(tenant.id)].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [tenant, getDocumentsByTenant]);

  // Apply active filter
  const filteredDocuments = useMemo(() => {
    if (activeFilter === "all") return allDocuments;
    return allDocuments.filter((doc) => doc.type === activeFilter);
  }, [allDocuments, activeFilter]);

  // Count per type for tabs
  const countByType = useMemo(() => {
    const counts: Record<string, number> = { all: allDocuments.length };
    for (const doc of allDocuments) {
      counts[doc.type] = (counts[doc.type] || 0) + 1;
    }
    return counts;
  }, [allDocuments]);

  // Handle document download
  const handleDownload = (fileUrl: string, title: string) => {
    if (fileUrl && fileUrl.startsWith("http")) {
      window.open(fileUrl, "_blank");
    } else {
      showToast(`Document "${title}" — URL non disponible`, "info");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f1b2d]">Mes documents</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          {allDocuments.length} document{allDocuments.length !== 1 ? "s" : ""}{" "}
          disponible{allDocuments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── Filter Tabs ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 text-[#6b7280] flex-shrink-0" />
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          const count = countByType[tab.key] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-[#10b981] text-white"
                  : "bg-white text-[#6b7280] border border-[#e5e7eb] hover:bg-[#f8fafc] hover:text-[#0f1b2d]"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs rounded-full px-1.5 py-0.5 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-[#6b7280]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Documents Grid / Empty State ───────────────────────────────── */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderOpen className="h-10 w-10" />}
            title={
              activeFilter === "all"
                ? "Aucun document disponible"
                : `Aucun document de type "${filterTabs.find((t) => t.key === activeFilter)?.label}" trouvé`
            }
            description={
              activeFilter === "all"
                ? "Vos documents apparaîtront ici dès qu'ils seront ajoutés par votre gestionnaire."
                : "Essayez un autre filtre ou consultez tous les documents."
            }
            action={
              activeFilter !== "all" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveFilter("all")}
                >
                  Voir tous les documents
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="flex flex-col">
              <div className="flex-1 space-y-3">
                {/* Icon + Type badge row */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex-shrink-0 rounded-lg p-2.5 ${getDocumentIconColor(doc.type)}`}
                  >
                    {getDocumentIcon(doc.type)}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${documentTypeColors[doc.type] || ""}`}
                  >
                    {documentTypeLabels[doc.type] || doc.type}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-[#0f1b2d] leading-snug">
                  {doc.title}
                </h3>

                {/* Description (truncated) */}
                <p className="text-xs text-[#6b7280] line-clamp-2">
                  {doc.description}
                </p>

                {/* Metadata row */}
                <div className="flex items-center gap-4 text-xs text-[#6b7280]">
                  <span className="inline-flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {formatFileSize(doc.fileSize)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(doc.createdAt)}
                  </span>
                </div>
              </div>

              {/* Download button */}
              <div className="mt-4 pt-3 border-t border-[#e5e7eb]">
                <button
                  onClick={() => handleDownload(doc.fileUrl, doc.title)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#10b981] hover:text-[#059669] transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Télécharger
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
