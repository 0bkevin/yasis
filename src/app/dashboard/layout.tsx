import { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen relative">
      {/* Background ambient blobs for dashboard */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-misty-rose/40 rounded-xl blur-[100px] -z-10 mix-blend-multiply opacity-50" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-terracotta/10 rounded-xl blur-[120px] -z-10 mix-blend-multiply opacity-50" />
      
      <DashboardShell>
        {children}
      </DashboardShell>
    </main>
  );
}
