import { Outlet } from "react-router-dom";
import { HostHeader } from "./HostHeader";

export default function HostLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <HostHeader />
      
      {/* Main Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

    </div>
  );
}
