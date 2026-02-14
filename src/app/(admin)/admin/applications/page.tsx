"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useData } from "@/contexts/DataContext";
import { Card, Button, Select, Badge, EmptyState } from "@/components/ui";
import { ClipboardList, Eye } from "lucide-react";
import {
  applicationStatusLabels,
  applicationStatusColors,
} from "@/lib/constants";

export default function ApplicationsPage() {
  const { applications } = useData();
  const [filterStatus, setFilterStatus] = useState("");

  const statusOptions = [
    { value: "", label: "Tous les statuts" },
    { value: "pending_review", label: "En attente de révision" },
    { value: "approved", label: "Approuvée" },
    { value: "rejected", label: "Rejetée" },
  ];

  const filtered = useMemo(() => {
    const list = filterStatus
      ? applications.filter((a) => a.status === filterStatus)
      : applications;
    return [...list].sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }, [applications, filterStatus]);

  const pendingCount = applications.filter(
    (a) => a.status === "pending_review"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#171717]">Demandes</h1>
          {pendingCount > 0 && (
            <Badge variant="warning" className="text-sm">
              {pendingCount} en attente
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="w-full sm:w-56">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={statusOptions}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-10 w-10" />}
            title="Aucune demande trouvée"
            description="Aucune demande ne correspond aux filtres sélectionnés."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Nom</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">T&eacute;l&eacute;phone</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Date soumission</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Statut</th>
                  <th className="px-4 py-3 text-right font-medium text-[#6b7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#f8fafc]"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#6b7280]">
                      {app.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#171717]">
                      {app.firstName} {app.lastName}
                    </td>
                    <td className="px-4 py-3 text-[#6b7280]">{app.email}</td>
                    <td className="px-4 py-3 text-[#6b7280]">{app.phone}</td>
                    <td className="px-4 py-3 text-[#6b7280]">
                      {new Date(app.submittedAt).toLocaleDateString("fr-CA")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          applicationStatusColors[app.status] ?? ""
                        }`}
                      >
                        {applicationStatusLabels[app.status] ?? app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/applications/${app.id}`}>
                        <Button size="sm" variant={app.status === "pending_review" ? "secondary" : "ghost"}>
                          {app.status === "pending_review" ? (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              Examiner
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              Voir
                            </>
                          )}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
