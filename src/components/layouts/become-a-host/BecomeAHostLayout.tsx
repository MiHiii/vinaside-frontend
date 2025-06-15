import { Outlet } from "react-router-dom";
import { HeaderBecomeAHost } from "./HeaderBecomeAHost";

export default function BecomeAHostLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <HeaderBecomeAHost />
      
      {/* Main Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

    </div>
  );
}
