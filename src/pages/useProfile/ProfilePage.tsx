import { useEffect, useState } from "react";
import ProfileSidebar from "@/components/useProfile/profileSidebar";
import ProfileIntroductionCard from "@/components/useProfile/ProfileIntroductionCard";
import CompleteProfilePrompt from "@/components/useProfile/CompleteProfilePrompt";
import { Button } from "@/components/ui/button";
import PastTrip from "@/components/useProfile/PastTrip";
import Connection from "@/components/useProfile/Connection";
import { Link } from "react-router-dom";
import { api } from "@/services/api"; // Axios instance đã cấu hình interceptor
import { useAppSelector } from "@/hooks/useRedux";

export default function UserProfilePage() {
  const [activeSidebarItem, setActiveSidebarItem] = useState("introduction");
  const [apiError, setApiError] = useState<string | null>(null);

  // Lấy token từ Redux (bạn có thể không cần dùng trực tiếp token ở đây, nhưng có thể muốn listen khi token đổi)
  const token = useAppSelector((state) => state.auth.token);

  // Khi vào trang, tự động gọi API để test token còn hạn/refresh token
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        console.log("✅ Lấy thông tin user thành công:", res.data);
        setApiError(null);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          setApiError("Token hết hạn hoặc không hợp lệ!");
          console.log("❌ Token hết hạn hoặc không hợp lệ (401 Unauthorized)");
        } else {
          setApiError("Lỗi khác khi gọi API!");
          console.log("Lỗi khác:", err);
        }
      });
  }, [token]); // Nếu token đổi sẽ gọi lại (ví dụ vừa refresh)

  // Dữ liệu mẫu, bạn sẽ thay thế bằng dữ liệu thực tế từ API, context, hoặc props
  const userData = {
    name: "Minh Quang",
    role: "Khách",
    avatarInitial: "M",
    isVerified: true, // Ví dụ cho trạng thái xác minh
  };

  const handleSidebarSelect = (item : string ) => {
    setActiveSidebarItem(item);
    // Có thể fetch thêm dữ liệu theo từng mục nếu muốn
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row lg:space-x-12">
        {/* Sidebar */}
        <aside className="mb-8 lg:mb-0 lg:w-1/4 xl:w-1/5">
          <ProfileSidebar
            activeItem={activeSidebarItem}
            onSelectItem={handleSidebarSelect}
            avatarFallback="M"
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:w-3/4 xl:w-4/5 lg:ml-[200px]">
          {/* Hiển thị lỗi nếu có */}
          {apiError && (
            <div className="text-red-500 text-sm mb-4">{apiError}</div>
          )}

          {activeSidebarItem === "introduction" && (
            <section aria-labelledby="introduction-section-title">
              <div className="flex items-center gap-2 mb-6">
                <h1
                  id="introduction-section-title"
                  className="text-2xl sm:text-3xl font-bold"
                >
                  Giới thiệu bản thân
                </h1>
                <Button
                  size="sm"
                  className="bg-gray-100 text-sm font-medium px-3 h-8 rounded-md text-gray-800 shadow-none border-none ml-3"
                >
                  <Link
                    to="/edit-profile"
                    className="flex items-center justify-center w-full h-full"
                  >
                    Chỉnh sửa
                  </Link>
                </Button>
              </div>

              {/* Bố cục cho thẻ giới thiệu và thẻ hoàn tất hồ sơ */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-22 items-start">
                <div className="md:col-span-12 lg:col-span-5 xl:col-span-4 w-[1200px] ">
                  <ProfileIntroductionCard
                    userName={userData.name}
                    userRole={userData.role}
                    avatarFallback={userData.avatarInitial}
                  />
                </div>
                <div className="md:col-span-12 lg:col-span-7 xl:col-span-5">
                  <CompleteProfilePrompt />
                </div>
              </div>

              {/* Phần "Đánh giá đã giới thiệu" hoặc thông tin xác minh */}
              <div className="mt-10 pt-8 border-t border-gray-200">
                <button
                  className="w-[200px] h-[50px] flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-xl focus:outline-none"
                  onClick={() => {
                    console.log("Đánh giá tôi đã viết clicked");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                    role="presentation"
                    focusable="false"
                    className="block h-[24px] w-[24px] fill-current"
                  >
                    <path d="M26 1a5 5 0 0 1 5 4.78v10.9a5 5 0 0 1-4.78 5H26a5 5 0 0 1-4.78 5h-4l-3.72 4.36-3.72-4.36H6a5 5 0 0 1-4.98-4.56L1 21.9 1 21.68V11a5 5 0 0 1 4.78-5H6a5 5 0 0 1 4.78-5H26zm-5 7H6a3 3 0 0 0-3 2.82v10.86a3 3 0 0 0 2.82 3h4.88l2.8 3.28 2.8-3.28H21a3 3 0 0 0 3-2.82V11a3 3 0 0 0-3-3zm-1 10v2H6v-2h14zm6-15H11a3 3 0 0 0-3 2.82V6h13a5 5 0 0 1 5 4.78v8.9a3 3 0 0 0 3-2.82V6a3 3 0 0 0-2.82-3H26zM15 13v2H6v-2h9z"></path>
                  </svg>
                  <span>Đánh giá tôi đã viết</span>
                </button>
              </div>
            </section>
          )}

          {activeSidebarItem === "trips" && (
            <section aria-labelledby="trips-section-title">
              <h1
                id="trips-section-title"
                className="text-2xl sm:text-3xl font-bold mb-6"
              >
                Chuyến đi trước đây
              </h1>
              <PastTrip />
            </section>
          )}

          {activeSidebarItem === "reviews" && (
            <section aria-labelledby="connection-section-title">
              <h1
                id="connection-section-title"
                className="text-2xl sm:text-3xl font-bold mb-6"
              >
                Kết nối
              </h1>
              <Connection />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
