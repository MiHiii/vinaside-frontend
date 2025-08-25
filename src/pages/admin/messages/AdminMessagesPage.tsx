import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import AdminMessages from "./AdminMessages";
import StaffMessages from "./StaffMessages";

export default function AdminMessagesPage() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const userRole = user?.role || "guest";

  console.log("🔍 [AdminMessagesPage] User role:", userRole);
  console.log("🔍 [AdminMessagesPage] User:", user);

  // Render appropriate component based on user role
  if (userRole === "admin") {
    return <AdminMessages />;
  } else if (userRole === "staff") {
    return <StaffMessages />;
  } else {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">Access Denied</h3>
          <p className="text-sm">
            You don't have permission to access admin messages
          </p>
        </div>
      </div>
    );
  }
}
