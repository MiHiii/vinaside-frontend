import { Outlet } from "react-router-dom";
import ClientHeader from "./ClientHeader";
import ClientFooter from "./ClientFooter";
import { AppLayout } from "@/components/common/AppLayout";

export default function ClientLayout() {
  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <ClientHeader />

        {/* Main Content */}
        <main className="flex-1 w-full">
          <Outlet />
        </main>

        {/* Footer */}
        <ClientFooter />
      </div>
    </AppLayout>
  );
}
