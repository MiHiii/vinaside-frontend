import { useState } from "react";
import { Header } from "@/components/admin/Header";
import { Sidebar } from "@/components/admin/Sidebar";
import { Outlet } from "react-router-dom";
import { AppLayout } from "@/components/common/AppLayout";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AppLayout>
      <div className="flex min-h-screen">
        <Sidebar collapsed={collapsed} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            onToggleSidebar={() => setCollapsed((c) => !c)}
            collapsed={collapsed}
          />
          <main className="flex-1 bg-gray-50 p-2 sm:p-4 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </AppLayout>
  );
}
