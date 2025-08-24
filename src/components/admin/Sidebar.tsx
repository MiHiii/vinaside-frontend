import {
  Home,
  ListChecks,
  MessageCircle,
  Users,
  Settings,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Building2,
  BookOpen,
  Ticket,
  Briefcase,
  MessageSquare,
  UserCheck,
  Heart,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { useAppSelector } from "@/hooks/useRedux";

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string | number;
  small?: boolean;
  collapsed?: boolean;
}

interface SidebarCollapseProps {
  icon: React.ReactNode;
  label: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
  id: string;
  active: boolean;
  collapsed?: boolean;
}

interface SidebarSectionProps {
  label: string;
  children: React.ReactNode;
  collapsed?: boolean;
}

function SidebarSection({ label, children, collapsed }: SidebarSectionProps) {
  if (collapsed) return <div className="space-y-1">{children}</div>;
  return (
    <div className="mt-4">
      <div className="px-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        {label}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SidebarItem({
  to,
  icon,
  label,
  active = false,
  badge,
  small = false,
  collapsed = false,
}: SidebarItemProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-md transition-colors 
        ${
          small
            ? "text-xs pl-2 py-1"
            : collapsed
            ? "justify-center px-2 py-2"
            : "text-sm px-4 py-2"
        }
        ${
          active
            ? "bg-gray-200 text-primary font-semibold"
            : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
        }`}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
      {!collapsed && badge && (
        <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

function SidebarCollapse({
  icon,
  label,
  open,
  setOpen,
  children,
  active,
  collapsed = false,
}: SidebarCollapseProps) {
  return (
    <div>
      {!collapsed ? (
        <button
          type="button"
          className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm w-full transition-colors
            ${
              active
                ? "bg-gray-200 text-primary font-semibold"
                : "text-muted-foreground hover:bg-gray-200 hover:text-accent-foreground"
            }
          `}
          onClick={() => setOpen(!open)}
        >
          {icon}
          <span>{label}</span>
          {open ? (
            <ChevronDown className="ml-auto h-4 w-4" />
          ) : (
            <ChevronRight className="ml-auto h-4 w-4" />
          )}
        </button>
      ) : (
        <button
          type="button"
          className="flex items-center justify-center w-full p-2 rounded-md transition-colors hover:bg-gray-100"
          onClick={() => setOpen(!open)}
        >
          {icon}
        </button>
      )}
      {open && <div>{children}</div>}
    </div>
  );
}

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const { pathname } = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  console.log("Sidebar user:", user);
  console.log("Sidebar user.permissions:", user?.permissions);
  const [openUsers, setOpenUsers] = useState(false);
  const [openSystem, setOpenSystem] = useState(false);
  const [openReviews, setOpenReviews] = useState(false);
  const [/*activeCollapseId*/, setActiveCollapseId] = useState<string | null>(null);

  // Chỉ render Sidebar khi đã có user và permissions
  if (!user || !user.permissions) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Đang tải menu...
      </div>
    );
  }

  const toggleUsers = (open: boolean) => {
    setOpenUsers(open);
    setActiveCollapseId(open ? "users" : null);
  };

  const toggleSystem = (open: boolean) => {
    setOpenSystem(open);
    setActiveCollapseId(open ? "system" : null);
  };

  const toggleReviews = (open: boolean) => {
    setOpenReviews(open);
    setActiveCollapseId(open ? "reviews" : null);
  };

  return (
    <aside
      className={`transition-all duration-300 bg-background min-h-screen flex flex-col rounded-xl shadow-xl m-2 overflow-hidden shrink-0 ${
        collapsed ? "w-16" : "w-64"
      } `}
    >
      {/* Header */}
      <div className="p-2 sm:p-3 md:p-4 text-center border-b border-gray-300">
        <Link
          to="/"
          className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2"
        >
          <div className="text-rose-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
            >
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
          </div>
          <span className="text-lg sm:text-xl font-bold ml-2">Vinaside</span>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-2">
        {/* General */}
        <SidebarSection label="" collapsed={collapsed}>
          <SidebarItem
            to="/admin"
            icon={<Home className="h-4 w-4" />}
            label="Dashboard"
            active={pathname === "/admin"}
            collapsed={collapsed}
          />
          <PermissionGuard permission="message.view">
            <SidebarItem
              to="/admin/messages"
              icon={<MessageCircle className="h-4 w-4" />}
              label="Tin nhắn"
              active={pathname.startsWith("/admin/messages")}
              badge="3"
              collapsed={collapsed}
            />
          </PermissionGuard>
          <PermissionGuard permission="booking.view">
            <SidebarItem
              to="/admin/bookings"
              icon={<Ticket className="h-4 w-4" />}
              label="Quản lý đặt phòng"
              active={pathname.startsWith("/admin/bookings")}
              collapsed={collapsed}
            />
          </PermissionGuard>
          <PermissionGuard permission="listing.view">
            <SidebarItem
              to="/admin/listings"
              icon={<Building2 className="h-4 w-4" />}
              label="Quản lý phòng"
              active={pathname.startsWith("/admin/listings")}
              collapsed={collapsed}
            />
          </PermissionGuard>
          <PermissionGuard permission="property.view">
            <SidebarItem
              to="/admin/properties"
              icon={<Home className="h-4 w-4" />}
              label="Quản lý homestay"
              active={pathname.startsWith("/admin/properties")}
              collapsed={collapsed}
            />
          </PermissionGuard>
          <PermissionGuard permission="user.view">
            <SidebarCollapse
              icon={<Users className="h-4 w-4" />}
              label="Quản lý người dùng"
              open={openUsers}
              setOpen={toggleUsers}
              id="users"
              active={
                pathname.startsWith("/admin/users") ||
                pathname === "/admin/staff" ||
                pathname.startsWith("/admin/property-staff")
              }
              collapsed={collapsed}
            >
              <div className="pl-7 space-y-1">
                <SidebarItem
                  to="/admin/staff"
                  icon={<UserCheck className="h-4 w-4" />}
                  label="Quản lý nhân viên"
                  active={pathname === "/admin/staff"}
                  collapsed={collapsed}
                />
                <SidebarItem
                  to="/admin/users"
                  icon={<Users className="h-4 w-4" />}
                  label="Quản lý người dùng"
                  active={pathname === "/admin/users"}
                  collapsed={collapsed}
                />
                <SidebarItem
                  to="/admin/property-staff"
                  icon={<UserCheck className="h-4 w-4" />}
                  label="Gán nhân viên"
                  active={pathname.startsWith("/admin/property-staff")}
                  collapsed={collapsed}
                />
                <PermissionGuard permission="user.edit">
                  <SidebarItem
                    to="/admin/permissions-manager"
                    icon={<ShieldCheck className="h-4 w-4" />}
                    label="Quản lý vai trò"
                    active={pathname === "/admin/permissions-manager"}
                    collapsed={collapsed}
                  />
                </PermissionGuard>
              </div>
            </SidebarCollapse>
          </PermissionGuard>
          <PermissionGuard permission="voucher.view">
            <SidebarItem
              to="/admin/vouchers"
              icon={<Ticket className="h-4 w-4" />}
              label="Voucher"
              active={pathname === "/admin/vouchers"}
              collapsed={collapsed}
            />
          </PermissionGuard>
          <PermissionGuard permission="service.view">
            <SidebarItem
              to="/admin/services"
              icon={<Briefcase className="h-4 w-4" />}
              label="Dịch vụ"
              active={pathname === "/admin/services"}
              collapsed={collapsed}
            />
          </PermissionGuard>
          <PermissionGuard permission="review.view">
            <SidebarCollapse
              icon={<MessageSquare className="h-4 w-4" />}
              label="Quản lý đánh giá"
              open={openReviews}
              setOpen={toggleReviews}
              id="reviews"
              active={
                pathname.startsWith("/admin/reviews") ||
                pathname === "/admin/wishlists"
              }
              collapsed={collapsed}
            >
              <div className="pl-7 space-y-1">
                <SidebarItem
                  to="/admin/reviews"
                  icon={<MessageSquare className="h-4 w-4" />}
                  label="Đánh giá"
                  active={pathname.startsWith("/admin/reviews")}
                  collapsed={collapsed}
                />
                <PermissionGuard permission="user.view">
                  <SidebarItem
                    to="/admin/wishlists"
                    icon={<Heart className="h-4 w-4" />}
                    label="Quản lý Wishlist"
                    active={pathname === "/admin/wishlists"}
                    collapsed={collapsed}
                  />
                </PermissionGuard>
              </div>
            </SidebarCollapse>
          </PermissionGuard>
          
            <SidebarCollapse
              icon={<Settings className="h-4 w-4" />}
              label="Quản lý hệ thống"
              open={openSystem}
              setOpen={toggleSystem}
              id="system"
              active={
                pathname.startsWith("/admin/amenities") ||
                pathname === "/admin/house-rules" ||
                pathname === "/admin/safety-features"
              }
              collapsed={collapsed}
            >
              <div className="pl-7 space-y-1">
                <PermissionGuard permission="amenity.view">
                  <SidebarItem
                    to="/admin/amenities"
                    icon={<ListChecks className="h-4 w-4" />}
                    label="Tiện ích"
                    active={pathname.startsWith("/admin/amenities")}
                    collapsed={collapsed}
                  />
                </PermissionGuard>
                <PermissionGuard permission="house_rule.view">
                  <SidebarItem
                    to="/admin/house-rules"
                    icon={<BookOpen className="h-4 w-4" />}
                    label="Quản lý quy tắc nhà"
                    active={pathname === "/admin/house-rules"}
                    collapsed={collapsed}
                  />
                </PermissionGuard>
                <PermissionGuard permission="safety_feature.view">
                <SidebarItem
                  to="/admin/safety-features"
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Chính sách an toàn"
                  active={pathname === "/admin/safety-features"}
                  collapsed={collapsed}
                />
                </PermissionGuard>
              </div>
            </SidebarCollapse>
        </SidebarSection>

        {/* Other */}
        <SidebarSection label="Other" collapsed={collapsed}>
          <SidebarItem
            to="/admin/settings"
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            active={pathname === "/admin/settings"}
            collapsed={collapsed}
          />
        </SidebarSection>
      </nav>

      {/* Footer */}
      <div
        className={`p-4 flex items-center ${
          collapsed ? "justify-center" : "gap-3"
        }`}
      >
        <div className="bg-muted rounded-full h-10 w-10 flex items-center justify-center font-semibold text-sm text-primary">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        {!collapsed && (
          <>
            <div className="flex-1">
              <div className="font-medium text-sm">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </>
        )}
      </div>
    </aside>
  );
}
