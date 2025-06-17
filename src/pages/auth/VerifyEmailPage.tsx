import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { verifyEmailByToken } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const dispatch = useAppDispatch();
  const { verifyStatus, error } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      dispatch(verifyEmailByToken(token));
    }
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    if (verifyStatus === "succeeded") {
      toast.success("✅ Xác minh email thành công!");
      setTimeout(() => navigate("/login"), 2000);
    } else if (verifyStatus === "failed") {
      toast.error(`❌ Xác minh thất bại: ${error || "Token không hợp lệ"}`);
    }
    // eslint-disable-next-line
  }, [verifyStatus]);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <Card
        className="
        max-w-md w-full rounded-2xl shadow-xl
        border border-[hsl(var(--border))]
        text-[hsl(var(--card-foreground))]
        flex flex-col items-center
      "
      >
        <CardContent className="p-8 text-center space-y-6 w-full flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-[hsl(var(--card-foreground))]">
            Đang xác minh tài khoản...
          </h2>
          {/* Skeleton loading hiệu ứng */}
          <Skeleton className="w-20 h-20 rounded-full mx-auto bg-[hsl(var(--muted))]" />
          <Skeleton className="h-5 w-1/2 mx-auto bg-[hsl(var(--muted))]" />
          <Skeleton className="h-3 w-1/3 mx-auto bg-[hsl(var(--muted))]" />
          <div className="text-sm text-[hsl(var(--muted-foreground))] mt-4">
            Vui lòng chờ trong giây lát...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
