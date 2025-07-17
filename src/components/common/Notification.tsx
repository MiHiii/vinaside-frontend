"use client";

import type React from "react";

import { useState } from "react";
import {
  Bell,
  Check,
  X,
  Trash2,
  MessageCircle,
  Home,
  Star,
  Settings,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Notification {
  id: string;
  type: "message" | "booking" | "review" | "system";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  avatar?: string;
}

const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "message",
    title: "Tin nhắn mới từ Nguyễn Văn A",
    message:
      "Chào bạn! Tôi muốn hỏi về dịch vụ của bạn. Bạn có thể tư vấn cho tôi được không?",
    time: "2 phút trước",
    isRead: false,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    type: "booking",
    title: "Đặt phòng mới tại Villa Đà Lạt",
    message:
      "Khách hàng Trần Thị B vừa đặt phòng Deluxe Suite từ 15/12 đến 18/12. Tổng giá trị: 3.500.000 VNĐ",
    time: "1 giờ trước",
    isRead: false,
  },
];

const getNotificationIcon = (type: string) => {
  const iconClass = "h-5 w-5 text-slate-600 dark:text-slate-400";
  switch (type) {
    case "message":
      return <MessageCircle className={iconClass} />;
    case "booking":
      return <Home className={iconClass} />;
    case "review":
      return <Star className={iconClass} />;
    case "system":
      return <Settings className={iconClass} />;
    default:
      return <Bell className={iconClass} />;
  }
};

export default function Notification() {
  const [notifications, setNotifications] =
    useState<Notification[]>(sampleNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const highPriorityUnread = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleDeleteNotification = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          75% { transform: rotate(-5deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.6); }
        }
        
        .animate-slide-down { animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-slide-in-left { animation: slideInLeft 0.5s ease-out; }
        .animate-pulse-gentle { animation: pulse 2s infinite; }
        .animate-wiggle { animation: wiggle 0.5s ease-in-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        
        .notification-item {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .notification-item:hover {
          transform: translateX(4px);
        }
        
        .btn-hover {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .red-glow {
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }
        
        .notification-scroll::-webkit-scrollbar { width: 6px; }
        .notification-scroll::-webkit-scrollbar-track { 
          background: rgba(0, 0, 0, 0.05); 
          border-radius: 3px; 
        }
        .notification-scroll::-webkit-scrollbar-thumb { 
          background: linear-gradient(to bottom, #475569, #1e293b); 
          border-radius: 3px; 
        }
        .notification-scroll::-webkit-scrollbar-thumb:hover { 
          background: linear-gradient(to bottom, #334155, #0f172a); 
        }
      `}</style>

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <Bell
              className={`h-8 w-8 text-slate-700 dark:text-slate-300 border-none ${
                unreadCount > 0 ? "animate-wiggle" : ""
              }`}
            />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-600 hover:bg-red-600 text-white text-xs animate-pulse-gentle">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[480px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-0 mt-2 animate-slide-down"
          sideOffset={8}
        >
          {/* Header */}
          <div
            className={`px-6 py-5 rounded-t-2xl border-b border-slate-200 dark:border-slate-600 relative overflow-hidden ${
              highPriorityUnread > 0
                ? "bg-gradient-to-r from-red-50 via-red-100 to-red-50 dark:from-red-900/20 dark:via-red-800/30 dark:to-red-900/20"
                : "bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800"
            }`}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full transition-all duration-300 ${
                    highPriorityUnread > 0
                      ? "bg-red-600 red-glow animate-float"
                      : "bg-slate-900 dark:bg-white shadow-lg"
                  }`}
                >
                  <Bell
                    className={`h-5 w-5 transition-all duration-300 ${
                      highPriorityUnread > 0
                        ? "text-white"
                        : "text-white dark:text-slate-900"
                    }`}
                  />
                </div>
                <div className="animate-slide-in-left">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Thông báo
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {unreadCount > 0 ? (
                      <>{unreadCount} thông báo chưa đọc</>
                    ) : (
                      "Tất cả đã được đọc"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-300 btn-hover ${
                      highPriorityUnread > 0
                        ? "text-red-700 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                        : "text-slate-900 hover:text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    Đọc tất cả
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg btn-hover icon-spin"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 animate-fade-in"
                  >
                    <DropdownMenuItem
                      onClick={handleClearAll}
                      className="text-red-600 hover:text-red-700 focus:text-red-700 hover:bg-red-50 focus:bg-red-50 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa tất cả
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="max-h-[500px] notification-scroll">
            {notifications.length === 0 ? (
              <div className="p-12 text-center animate-fade-in">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-slate-400" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Không có thông báo nào
                </h4>
                <p className="text-slate-500 dark:text-slate-400">
                  Bạn sẽ nhận được thông báo khi có hoạt động mới
                </p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div
                      className={`notification-item px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer relative group border-l-4 ${
                        !notification.isRead
                          ? "bg-slate-50/80 dark:bg-slate-800/30 border-l-slate-900 dark:border-l-white"
                          : "border-l-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar or Icon */}
                        <div className="flex-shrink-0 relative">
                          {notification.avatar ? (
                            <Avatar className="h-12 w-12 ring-2 ring-slate-200 dark:ring-slate-700 shadow-md">
                              <AvatarImage
                                src={notification.avatar || "/placeholder.svg"}
                                alt="Avatar"
                              />
                              <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 text-white dark:text-slate-900 font-semibold">
                                {notification.title.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-12 w-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center shadow-md">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4
                              className={`text-base font-semibold leading-tight ${
                                !notification.isRead
                                  ? "text-slate-900 dark:text-white"
                                  : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2.5 h-2.5 bg-red-600 dark:bg-red-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                            )}
                          </div>

                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <Clock className="h-3 w-3" />
                              <span className="font-medium">
                                {notification.time}
                              </span>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) =>
                                    handleMarkAsRead(notification.id, e)
                                  }
                                  className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
                                  title="Đánh dấu đã đọc"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) =>
                                  handleDeleteNotification(notification.id, e)
                                }
                                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-lg"
                                title="Xóa thông báo"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < notifications.length - 1 && (
                      <div className="mx-6 border-b border-slate-100 dark:border-slate-700"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl border-t border-slate-100 dark:border-slate-700">
              <Button
                variant="ghost"
                className="w-full text-sm font-medium text-slate-900 hover:text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 py-2.5 rounded-xl transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                Xem tất cả thông báo
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
