import { useLocation } from "react-router-dom";
import { useAppSelector } from "@/hooks/useRedux";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { RootState } from "@/store";
import { selectListing } from "@/store/slices/listingSlice";

// Định nghĩa title cho các route
const routeTitles: Record<string, string> = {
  "/": "Trang chủ",
  "/login": "Đăng nhập",
  "/register": "Đăng ký",
  "/profile": "Hồ sơ cá nhân",
  "/payment": "Thanh toán",
  "/payment/return": "Thanh toán thành công",
  "/payment/failed": "Thanh toán thất bại",
  "/overview": "Tổng quan",
  "/location": "Vị trí",
  "/about-your-place": "Về nơi ở của bạn",
  "/floor-plan": "Sơ đồ tầng",
  "/stand-out": "Nổi bật",
  "/amenities": "Tiện nghi",
  "/photos": "Hình ảnh",
  "/title": "Tiêu đề",
  "/description": "Mô tả",
  "/finish-setup": "Hoàn tất thiết lập",
  "/price": "Giá",
  "/become-a-host": "Trở thành chủ nhà",
  "/hosting": "Quản lý cho thuê",
  "/admin": "Quản trị",
  "/messages": "Tin nhắn",
  "/bookings": "Đặt phòng",
  "/favorites": "Yêu thích",
  "/search": "Tìm kiếm",
  "/wishlists": "Danh sách yêu thích",
};

// Định nghĩa title cho các route động (có tham số)
const dynamicRouteTitles: Record<string, (params: any) => string> = {
  "/property/:id": (params: any) =>
    `Chi tiết nơi ở - ${params.id || "Không xác định"}`,
  "/user/:id": (params: any) =>
    `Hồ sơ người dùng - ${params.id || "Không xác định"}`,
};

/**
 * Component quản lý title động cho toàn bộ ứng dụng
 */
export const TitleManager = () => {
  const location = useLocation();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const listing = useAppSelector(selectListing);

  // Tính toán title dựa trên route và user
  let title = "";

  // Kiểm tra route tĩnh trước
  if (routeTitles[location.pathname]) {
    title = routeTitles[location.pathname];
  } else {
    // Kiểm tra route động
    const pathSegments = location.pathname.split("/");

    // Xử lý route /list/:id (chi tiết phòng)
    if (pathSegments[1] === "list" && pathSegments[2]) {
      if (listing) {
        title = listing.title || `Phòng ${pathSegments[2]}`;
      } else {
        title = `Đang tải...`;
      }
    }
    // Xử lý route /property/:id
    else if (pathSegments[1] === "property" && pathSegments[2]) {
      title = `Chi tiết nơi ở - ${pathSegments[2]}`;
    }
    // Xử lý route /user/:id
    else if (pathSegments[1] === "user" && pathSegments[2]) {
      title = `Hồ sơ người dùng - ${pathSegments[2]}`;
    }
    // Xử lý các route khác
    else {
      // Lấy tên route từ pathname
      const routeName = pathSegments[1] || "Trang chủ";
      title = routeName.charAt(0).toUpperCase() + routeName.slice(1);
    }
  }

  // Thêm thông tin người dùng nếu đã đăng nhập
  if (user?.name && location.pathname.includes("/profile")) {
    title = `Hồ sơ - ${user.name}`;
  }

  // Gọi hook ở cấp độ component
  useDocumentTitle(title);

  return null; // Component này không render gì
};
