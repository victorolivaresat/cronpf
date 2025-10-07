"use client";

import { Header } from "@/components/layout/header";
import { AuthGuard } from "@/context/auth-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
