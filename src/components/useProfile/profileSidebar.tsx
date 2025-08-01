import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ComponentType } from "react";

export interface ProfileSidebarProps {
  activeItem: string;
  onSelectItem: (item: string) => void;
  avatarUrl?: string;
  avatarFallback: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: string | ComponentType;
}

const sidebarItems: SidebarItem[] = [
  { id: "introduction", label: "Giới thiệu bản thân", icon: "avatar" },
  {
    id: "trips",
    label: "Chuyến đi trước đây",
    icon: "https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-UserProfile/original/797c1df2-a40c-4d93-9550-ca5b213cd01b.png?im_w=240",
  },
];

export default function ProfileSidebar({
  activeItem,
  onSelectItem,
  avatarUrl,
  avatarFallback,
}: ProfileSidebarProps) {
  const handleClick = (id: string) => {
    onSelectItem(id);
  };

  return (
    <aside
      className="w-64 min-h-screen px-4 py-8"
      role="navigation"
      aria-label="Profile sidebar"
    >
      <h2 className="text-2xl font-bold mb-6">Hồ sơ</h2>
      <nav className="space-y-2">
        {sidebarItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <Button
              key={item.id}
              className={`
                w-full justify-start text-base font-medium
                px-4 py-3 h-20 rounded-2xl shadow-none transition
                flex items-center gap-3
                ${
                  isActive
                    ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-semibold"
                    : "bg-transparent"
                }
                hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] 
                focus:outline-none w-96
              `}
              onClick={() => handleClick(item.id)}
              aria-current={isActive ? "page" : undefined}
              variant="ghost"
            >
              {/* Avatar hoặc icon ảnh */}
              <div className="flex-shrink-0 flex items-center justify-center rounded-full h-12 w-12 bg-[#232323] overflow-hidden border border-white shadow">
                {item.icon === "avatar" ? (
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-2xl font-bold bg-black text-white">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <img
                    src={item.icon as string}
                    alt={item.label}
                    className="h-10 w-10 object-cover rounded-full"
                  />
                )}
              </div>
              <span className="ml-2">{item.label}</span>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
