import { Outlet } from "react-router-dom";
import ClientFooter from "./ClientFooter";
import ClientHeader from "./ClientHeader";

const ClientLayout = () => {
  return (
    <div className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <ClientHeader />
      <main className="flex-1 w-full max-w-[1500px] mx-auto min-h-[80vh]">
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  );
};

export default ClientLayout;
