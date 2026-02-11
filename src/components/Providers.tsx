"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        <NotificationProvider>
          <ToastProvider>{children}</ToastProvider>
        </NotificationProvider>
      </DataProvider>
    </AuthProvider>
  );
}
