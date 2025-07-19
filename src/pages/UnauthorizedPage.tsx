import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <Card className="w-full max-w-md mx-auto p-8 rounded-2xl shadow-lg text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <ShieldX className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Truy cập bị từ chối
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên để được cấp quyền.
          </p>
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link to="/">
                Về trang chủ
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">
                Đăng nhập lại
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 