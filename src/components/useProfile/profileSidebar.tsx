import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Import Avatar và AvatarFallback
import { ComponentType,  } from "react"; // ReactNode để chấp nhận cả img và icon


export interface ProfileSidebarProps {
  activeItem: string;
  onSelectItem: (item: string) => void;
  avatarFallback: string; // Nhận giá trị avatarFallback từ props
}

// Khai báo rõ kiểu icon để TS không complain
interface SidebarItem {
  id: string;
  label: string;
  icon: string | ComponentType; // Cập nhật kiểu icon để có thể là một URL hình ảnh hoặc component
}

const sidebarItems: SidebarItem[] = [
  { id: "introduction", label: "Giới thiệu bản thân", icon: "avatar" }, // Giữ nguyên Avatar cho 'Giới thiệu bản thân'
  { id: "trips", label: "Chuyến đi trước đây", icon: "https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-UserProfile/original/797c1df2-a40c-4d93-9550-ca5b213cd01b.png?im_w=240" }, // Sử dụng URL hình ảnh cho 'Chuyến đi trước đây'
  { id: "reviews", label: "Kết nối", icon: "https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-UserProfile/original/3009d40c-3aa7-498b-a887-ba641d3bbcc6.png?im_w=240" }, // Sử dụng URL hình ảnh cho 'Kết nối'
];

export default function ProfileSidebar({
  activeItem,
  onSelectItem,
  avatarFallback,
}: ProfileSidebarProps) {
   const handleClick = (id: string) => {
    onSelectItem(id); 
  };

  return (
    <aside className="w-64 h-screen mr-[112px] px-4 py-8" role="navigation" aria-label="Profile sidebar">
      <div className="absolute top-0 left-130 h-[980px] w-[1px] bg-gray-200"></div>
      <h2 className="text-2xl font-bold mb-6">Hồ sơ</h2>
      <nav className="space-y-1">
        {sidebarItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
           <Button
            key={item.id}
            className={`w-[300px] justify-start text-base py-3 px-4 
                        ${isActive ? "bg-gray-100" : ""} 
                        hover:bg-gray-100 focus:outline-none 
                        rounded-xl h-[65px] shadow-none`}
            onClick={() => handleClick(item.id)} 
            aria-current={isActive ? "page" : undefined}
          >

              {/* Render Avatar if it's the 'introduction' item */}
              {item.icon === "avatar" ? (
                <div className="mr-3 h-12 w-12 rounded-full overflow-hidden">
                  <Avatar className="h-full w-full">
                    <AvatarFallback className="text-2xl bg-black text-white">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <img src={item.icon as string} alt={item.label} className="mr-3 h-10 w-10 object-cover" /> // Hiển thị hình ảnh cho 'trips' và 'reviews'
              )}
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
