import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ProfileSidebar from "@/components/useProfile/profileSidebar";
import ProfileIntroductionCard from "@/components/useProfile/ProfileIntroductionCard";
import CompleteProfilePrompt from "@/components/useProfile/CompleteProfilePrompt";
import { Button } from "@/components/ui/button";
import PastTrip from "@/components/useProfile/PastTrip";
import Connection from "@/components/useProfile/Connection";
import { Link, useNavigate } from "react-router-dom";
import { RootState } from "@/store";
import toast from "react-hot-toast";
export default function UserProfilePage() {
  const [activeSidebarItem, setActiveSidebarItem] = useState("introduction");
  const { user, loading, error } = useSelector(
    (state: RootState) => state.auth
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast.error("Vui lòng đăng nhập");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    }
  }, [error, navigate]);

  const handleSidebarSelect = (item: string) => {
    setActiveSidebarItem(item);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500 text-lg">
          Không tìm thấy thông tin người dùng
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row lg:space-x-12">
        {/* Sidebar */}
        <aside className="mb-8 lg:mb-0 lg:w-1/4 xl:w-1/5">
          <ProfileSidebar
            activeItem={activeSidebarItem}
            onSelectItem={handleSidebarSelect}
            avatarUrl={user.avatar_url}
            avatarFallback={user.email?.toUpperCase()[0] || "U"}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:w-3/4 xl:w-4/5 lg:ml-[200px]">
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

              <div className="grid grid-cols-1 md:grid-cols-12 gap-22 items-start">
                <div className="md:col-span-12 lg:col-span-5 xl:col-span-4 w-[1200px]">
                  <ProfileIntroductionCard
                    userName={user.name}
                    userRole={user.role || "Khách"}
                    avatarUrl={user.avatar_url}
                    avatarFallback={user.email?.toUpperCase()[0] || "U"}
                  />
                </div>
                <div className="md:col-span-12 lg:col-span-7 xl:col-span-5">
                  <CompleteProfilePrompt />
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-200">
                <button
                  className="w-[200px] h-[50px] flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-xl focus:outline-none"
                  onClick={() => console.log("Đánh giá tôi đã viết clicked")}
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
