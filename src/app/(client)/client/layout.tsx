"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ClientSidebar } from "@/components/layout/ClientSidebar";
import { ClientTopbar } from "@/components/layout/ClientTopbar";
import { useRouter } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.portalType !== "client")) {
      router.push("/connexion/client");
    }
  }, [user, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#6b7280]">Chargement...</p>
        </div>
      </div>
    );
  }

  // If not authenticated as client, don't render children
  if (!user || user.portalType !== "client") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#6b7280]">Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <ClientSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <ClientTopbar
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
