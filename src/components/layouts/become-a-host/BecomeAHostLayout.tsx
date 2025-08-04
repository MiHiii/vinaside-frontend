import { Outlet } from "react-router-dom";
import { HeaderBecomeAHost } from "./HeaderBecomeAHost";
import { AppLayout } from "@/components/common/AppLayout";

export default function BecomeAHostLayout() {
  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <HeaderBecomeAHost />

        {/* Main Content */}
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>
    </AppLayout>
  );
}
