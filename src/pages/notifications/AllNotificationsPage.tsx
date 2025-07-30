import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { Clock, Check, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCallback } from "react";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "message":
      return "💬";
    case "booking":
      return "🏠";
    case "review":
      return "⭐";
    case "system":
      return "⚙️";
    default:
      return "🔔";
  }
};

export default function AllNotificationsPage() {
  const {
    notifications,
    markNotificationAsRead,
    removeNotification,
    markAllNotificationsAsRead,
  } = useNotifications();

  const handleMarkAsRead = useCallback(
    (id: string, event: React.MouseEvent) => {
      event.stopPropagation();
      markNotificationAsRead(id);
    },
    [markNotificationAsRead]
  );

  const handleDeleteNotification = useCallback(
    (id: string, event: React.MouseEvent) => {
      event.stopPropagation();
      removeNotification(id);
    },
    [removeNotification]
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllNotificationsAsRead();
  }, [markAllNotificationsAsRead]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-full">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Tất cả thông báo
                </h1>
                <p className="text-gray-600">
                  {notifications.length} thông báo • {unreadCount} chưa đọc
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300"
              >
                <Check className="h-4 w-4 mr-2" />
                Đọc tất cả
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không có thông báo nào
              </h3>
              <p className="text-gray-500">
                Bạn sẽ nhận được thông báo khi có hoạt động mới
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-200 hover:shadow-xl ${
                  !notification.isRead
                    ? "border-l-4 border-red-500 bg-red-50/30"
                    : "border-l-4 border-transparent"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar or Icon */}
                  <div className="flex-shrink-0">
                    {notification.avatar ? (
                      <Avatar className="h-12 w-12 ring-2 ring-gray-200 shadow-md">
                        <AvatarImage src={notification.avatar} alt="Avatar" />
                        <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 text-white font-semibold">
                          {notification.title.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-md text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className={`text-lg font-semibold leading-tight ${
                          !notification.isRead
                            ? "text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3 leading-relaxed">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">
                          {format(
                            new Date(notification.time),
                            "HH:mm dd/MM/yyyy"
                          )}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) =>
                              handleMarkAsRead(notification.id, e)
                            }
                            className="h-8 px-3 hover:bg-green-100 text-green-600"
                            title="Đánh dấu đã đọc"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Đã đọc
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) =>
                            handleDeleteNotification(notification.id, e)
                          }
                          className="h-8 px-3 hover:bg-red-100 text-red-600"
                          title="Xóa thông báo"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
