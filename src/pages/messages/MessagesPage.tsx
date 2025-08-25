import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import Messages from "./Messages";

export default function MessagesPage() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const userRole = (user?.role || "guest") as "guest" | "staff" | "admin";

  return (
    <div className="h-full">
      <Messages userRole={userRole} />
    </div>
  );
}
