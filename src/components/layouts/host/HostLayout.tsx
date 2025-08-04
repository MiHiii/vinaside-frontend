import { Outlet } from "react-router-dom";
import { HostHeader } from "./HostHeader";
import { AppLayout } from "@/components/common/AppLayout";

export default function HostLayout() {
  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <HostHeader />

        {/* Main Content */}
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>
    </AppLayout>
  );
}
