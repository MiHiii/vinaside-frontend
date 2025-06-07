import {  useNavigate, useSearchParams } from "react-router-dom";
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
  }, [token]);

  useEffect(() => {
    if (verifyStatus === "succeeded") {
      toast.success("✅ Xác minh email thành công!");
      setTimeout(() => navigate("/login"), 3000);
    } else if (verifyStatus === "failed") {
      toast.error(`❌ Xác minh thất bại: ${error || "Token không hợp lệ"}`);
    }
  }, [verifyStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-100 px-4">
      <Card className="max-w-md w-full shadow-xl rounded-2xl">
        <CardContent className="p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            Xác minh tài khoản...
          </h2>
          <Skeleton className="w-24 h-24 rounded-full mx-auto" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </CardContent>
      </Card>
    </div>
  );
}
