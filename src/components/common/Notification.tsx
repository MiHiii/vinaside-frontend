'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Check, X, Trash2, MessageCircle, Home, Star, Settings, Clock, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications } from '@/hooks/useNotifications';
import socketService from '@/services/socket.service';
import type { Notification } from '@/services/notification.service';
import { parseISO } from 'date-fns';
import { useAppSelector } from '@/hooks/useRedux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Global Set để chia sẻ giữa các instance của Notification component
const globalShownNotiIds = new Set<string>();

const getNotificationIcon = (type: string) => {
  const iconClass = 'h-5 w-5 text-slate-600 dark:text-slate-400';
  switch (type) {
    case 'message':
      return <MessageCircle className={iconClass} />;
    case 'booking':
      return <Home className={iconClass} />;
    case 'review':
      return <Star className={iconClass} />;
    case 'system':
      return <Settings className={iconClass} />;
    default:
      return <Bell className={iconClass} />;
  }
};

// Thêm hàm format giờ Việt Nam
function formatVietnamTime(isoString: string) {
  if (!isoString) return '';
  try {
    const date = parseISO(isoString);
    // Format giờ phút ngày tháng năm theo giờ Việt Nam
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(date);
  } catch {
    return isoString;
  }
}

export default function Notification({ isAdmin = false }: { isAdmin?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    addNotificationRealtime,
    clearNotifications,
  } = useNotifications();
  // Lấy userId, token và user role từ redux hoặc localStorage
  const userId = useAppSelector((state) => state.auth.user?._id);
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : undefined;

  const navigate = useNavigate();

  const handleNotificationClickToast = (notification: Notification) => {
    // Debug: log toast notification
    console.log('=== TOAST NOTIFICATION DEBUG ===');
    console.log('Toast notification:', notification);
    console.log('Toast metadata:', notification.metadata);

    if (notification.type === 'message') {
      navigate(isAdmin ? '/admin/messages' : '/messages');
    } else if (notification.type === 'booking') {
      // Nếu là admin hoặc staff thì chuyển đến trang chi tiết booking
      if (userRole === 'admin' || userRole === 'staff') {
        // Kiểm tra xem có metadata với bookingId và propertyId không
        if (notification.metadata?.bookingId && notification.metadata?.propertyId) {
          const url = `/admin/bookings/${notification.metadata.propertyId}/${notification.metadata.bookingId}`;
          console.log('✅ Toast navigating to booking detail:', url);
          navigate(url);
        } else {
          // Fallback về trang quản lý booking nếu không có metadata
          console.log('❌ Toast no metadata found, navigating to /admin/bookings');
          navigate('/admin/bookings');
        }
      }
    } else if (notification.type === 'payment') {
      const recipientType = notification.metadata?.['recipient_type'] as string | undefined;
      if (recipientType === 'guest') {
        navigate('/past-trip');
      } else if (userRole === 'admin' || userRole === 'staff') {
        if (notification.metadata?.bookingId && notification.metadata?.propertyId) {
          const url = `/admin/bookings/${notification.metadata.propertyId}/${notification.metadata.bookingId}`;
          console.log('✅ Toast navigating to booking detail:', url);
          navigate(url);
        } else {
          console.log('❌ Toast no metadata found, navigating to /admin/bookings');
          navigate('/admin/bookings');
        }
      } else {
        navigate('/past-trip');
      }
    } else if (notification.type === 'review') {
      navigate('/profilepage');
    } else if (notification.type === 'system') {
      navigate('/');
    }
  };

  // Kết nối socket notification khi có userId và token
  useEffect(() => {
    if (token && userId) {
      socketService.connect(token, userId);
      console.log('[Notification] socket connected', {
        token,
        userId,
      });
    }
    return () => {
      socketService.disconnect();
    };
  }, [token, userId]);

  // Lấy danh sách và số lượng chưa đọc khi userId hoặc token thay đổi (đăng nhập/đăng xuất)
  useEffect(() => {
    if (userId && token) {
      getNotifications();
      getUnreadCount();
    } else {
      if (typeof clearNotifications === 'function') clearNotifications();
    }
    // eslint-disable-next-line
  }, [userId, token]);

  // Lắng nghe notification realtime qua socket
  useEffect(() => {
    // Lắng nghe notification mới (KHÔNG gọi lại getUnreadCount hay getNotifications)
    const unsubNew = socketService.onNewNotificationV2((notification) => {
      // Chỉ toast và thêm vào state nếu notification chưa được hiển thị
      if (!globalShownNotiIds.has(notification.id)) {
        globalShownNotiIds.add(notification.id);
        addNotificationRealtime(notification); // chỉ thêm vào state
        toast(notification.title || 'Bạn có thông báo mới', {
          description: notification.message,
          style: {
            background: '#ccccc', // Đỏ nhạt
            color: '#00000',
          },
          action: {
            label: 'Xem ngay',
            onClick: () => handleNotificationClickToast(notification),
          },
        });
      }
    });
    // Lắng nghe notification V2 nếu backend có
    // const unsubV2 = socketService.onNewNotificationV2?.((notification) => {
    //   addNotificationRealtime(notification); // chỉ thêm vào state
    // });
    // Lắng nghe sự kiện cập nhật số lượng chưa đọc (nếu backend emit)
    if (socketService.notificationSocket) {
      socketService.notificationSocket.on('unread_count_updated', () => {
        getUnreadCount();
      });
      socketService.notificationSocket.on('notification_read', () => {
        getUnreadCount();
      });
      socketService.notificationSocket.on('notification_deleted', () => {
        getUnreadCount();
      });
    }
    return () => {
      if (unsubNew) unsubNew();
      // if (unsubV2) unsubV2();
      if (socketService.notificationSocket) {
        socketService.notificationSocket.off('unread_count_updated');
        socketService.notificationSocket.off('notification_read');
        socketService.notificationSocket.off('notification_deleted');
      }
    };
  }, [addNotificationRealtime, getUnreadCount, navigate, isAdmin]);

  const highPriorityUnread = unreadCount;

  const handleMarkAsRead = useCallback(
    (id: string, event: React.MouseEvent) => {
      event.stopPropagation();
      markNotificationAsRead(id);
      getUnreadCount(); // Cập nhật badge ngay khi đánh dấu đã đọc
    },
    [markNotificationAsRead, getUnreadCount],
  );

  const handleDeleteNotification = useCallback(
    (id: string, event: React.MouseEvent) => {
      event.stopPropagation();
      // Kiểm tra nếu notification chưa đọc thì trừ unreadCount ngay
      const noti = notifications.find((n: Notification) => n.id === id);
      if (noti && !noti.isRead) {
        // Nếu có thể, cập nhật unreadCount ngay (nếu dùng Redux, dispatch action custom hoặc setState tạm thời)
        // Nếu dùng Redux slice, có thể dispatch action custom ở đây
        // Hoặc gọi getUnreadCount() sau khi xóa
        setTimeout(() => getUnreadCount(), 200); // Gọi lại sau khi xóa để đồng bộ với backend
      }
      removeNotification(id);
    },
    [removeNotification, notifications, getUnreadCount],
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllNotificationsAsRead();
    getUnreadCount(); // Cập nhật badge ngay khi đánh dấu tất cả đã đọc
  }, [markAllNotificationsAsRead, getUnreadCount]);

  const handleClearAll = useCallback(() => {
    // Xóa từng notification (có thể tối ưu bằng API xóa all nếu backend hỗ trợ)
    notifications.forEach((n: Notification) => removeNotification(n.id));
  }, [notifications, removeNotification]);

  // Xử lý click vào notification
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      // Debug: log notification khi click
      console.log('=== CLICK NOTIFICATION DEBUG ===');
      console.log('Full notification:', notification);
      console.log('Notification type:', notification.type);
      console.log('User role:', userRole);
      console.log('Metadata:', notification.metadata);
      console.log('bookingId:', notification.metadata?.bookingId);
      console.log('propertyId:', notification.metadata?.propertyId);

      // Đánh dấu đã đọc
      markNotificationAsRead(notification.id);
      // Ẩn popup
      setIsOpen(false);
      // Điều hướng theo type
      if (notification.type === 'message') {
        navigate('/messages');
      } else if (notification.type === 'booking') {
        // Nếu là admin hoặc staff thì chuyển đến trang chi tiết booking
        if (userRole === 'admin' || userRole === 'staff') {
          // Kiểm tra xem có metadata với bookingId và propertyId không
          if (notification.metadata?.bookingId && notification.metadata?.propertyId) {
            const url = `/admin/bookings/${notification.metadata.propertyId}/${notification.metadata.bookingId}`;
            console.log('✅ Navigating to booking detail:', url);
            navigate(url);
          } else {
            // Fallback về trang quản lý booking nếu không có metadata
            console.log('❌ No metadata found, navigating to /admin/bookings');
            navigate('/admin/bookings');
          }
        } else {
          console.log('User is not admin/staff, navigating to /past-trip');
          navigate('/past-trip');
        }
      } else if (notification.type === 'payment') {
        const recipientType = notification.metadata?.['recipient_type'] as string | undefined;
        if (recipientType === 'guest') {
          navigate('/past-trip');
        } else if (userRole === 'admin' || userRole === 'staff') {
          if (notification.metadata?.bookingId && notification.metadata?.propertyId) {
            const url = `/admin/bookings/${notification.metadata.propertyId}/${notification.metadata.bookingId}`;
            console.log('✅ Navigating to booking detail:', url);
            navigate(url);
          } else {
            console.log('❌ No metadata found, navigating to /admin/bookings');
            navigate('/admin/bookings');
          }
        } else {
          navigate('/past-trip');
        }
      } else if (notification.type === 'review') {
        navigate('/profilepage');
      } else if (notification.type === 'system') {
        navigate('/');
      } else {
        // Dự phòng: các type khác có thể mở modal chi tiết hoặc log
        console.log('Unknown notification type:', notification.type);
      }
    },
    [navigate, markNotificationAsRead, userRole],
  );

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
        
        .notification-scroll {
          max-height: 388px; /* 3 items x 96px/item */
          min-height: 388px;
          overflow-y: auto;
        }
        .notification-item {
          min-height: 98px;
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
            variant='ghost'
            size='icon'
            className='relative rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200'>
            <Bell
              className={`h-8 w-8 text-slate-700 dark:text-slate-300 border-none ${
                unreadCount > 0 ? 'animate-wiggle' : ''
              }`}
            />
            {unreadCount > 0 && (
              <Badge className='absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-600 hover:bg-red-600 text-white text-xs animate-pulse-gentle'>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align='end'
          className='w-[420px] bg-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-0 mt-2 animate-slide-down'
          sideOffset={8}>
          {/* Header */}
          <div
            className={`px-6 py-5 rounded-t-2xl relative overflow-hidden ${
              highPriorityUnread > 0
                ? 'bg-gradient-to-r from-red-50 via-red-100 to-red-50 dark:from-red-900/20 dark:via-red-800/30 dark:to-red-900/20'
                : 'bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700'
            }`}>
            <div className='flex items-center justify-between relative z-10'>
              <div className='flex items-center gap-3'>
                <div
                  className={`p-2 rounded-full transition-all duration-300 ${
                    highPriorityUnread > 0
                      ? 'bg-red-600 red-glow animate-float'
                      : 'bg-slate-900 dark:bg-white shadow-lg'
                  }`}>
                  <Bell
                    className={`h-5 w-5 transition-all duration-300 ${
                      highPriorityUnread > 0 ? 'text-white' : 'text-white dark:text-slate-900'
                    }`}
                  />
                </div>
                <div className='animate-slide-in-left'>
                  <h3 className='text-lg font-bold text-slate-900 dark:text-white'>Thông báo</h3>
                  <p className='text-sm text-slate-600 dark:text-slate-300'>
                    {unreadCount > 0 ? <>{unreadCount} thông báo chưa đọc</> : 'Tất cả đã được đọc'}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                {unreadCount > 0 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleMarkAllAsRead}
                    className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-300 btn-hover ${
                      highPriorityUnread > 0
                        ? 'text-red-700 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30'
                        : 'text-slate-900 hover:text-slate-900 hover:bg-slate-700 dark:text-slate-600 dark:hover:text-slate-300 dark:hover:bg-slate-700'
                    }`}>
                    Đọc tất cả
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg btn-hover icon-spin'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-48 animate-fade-in'>
                    <DropdownMenuItem
                      onClick={handleClearAll}
                      className='text-red-600 hover:text-red-700 focus:text-red-700 hover:bg-red-50 focus:bg-red-50 transition-all duration-200'>
                      <Trash2 className='h-4 w-4 mr-2' />
                      Xóa tất cả
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className='notification-scroll bg-white'>
            {notifications.length === 0 ? (
              <div className='p-12 text-center animate-fade-in'>
                <div className='w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Bell className='h-8 w-8 text-slate-400' />
                </div>
                <h4 className='text-lg font-semibold text-slate-900 dark:text-white mb-2'>Không có thông báo nào</h4>
                <p className='text-slate-500 dark:text-slate-400'>Bạn sẽ nhận được thông báo khi có hoạt động mới</p>
              </div>
            ) : (
              <div className='py-2'>
                {notifications.map((notification: Notification, index: number) => (
                  <div
                    key={notification.id}
                    className='notification-item animate-fade-in'
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handleNotificationClick(notification)}>
                    <div
                      className={`notification-item bg-white px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer relative group border-l-4 ${
                        !notification.isRead
                          ? 'bg-slate-50/80 dark:bg-slate-800/30 border-l-slate-900 dark:border-l-white'
                          : 'border-l-transparent'
                      }`}>
                      <div className='flex items-start gap-4'>
                        {/* Avatar or Icon */}
                        <div className='flex-shrink-0 relative'>
                          {notification.avatar ? (
                            <Avatar className='h-12 w-12 ring-2 ring-slate-200 dark:ring-slate-700 shadow-md'>
                              <AvatarImage src={notification.avatar || '/placeholder.svg'} alt='Avatar' />
                              <AvatarFallback className='bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 text-white dark:text-slate-900 font-semibold'>
                                {notification.title.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className='h-12 w-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center shadow-md'>
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start justify-between mb-2'>
                            <h4
                              className={`text-base font-semibold leading-tight ${
                                !notification.isRead
                                  ? 'text-slate-900 dark:text-white'
                                  : 'text-slate-700 dark:text-slate-300'
                              }`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className='w-2.5 h-2.5 bg-red-600 dark:bg-red-500 rounded-full flex-shrink-0 ml-2 mt-1'></div>
                            )}
                          </div>

                          <p className='text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed line-clamp-2'>
                            {notification.message}
                          </p>

                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400'>
                              <Clock className='h-3 w-3' />
                              <span className='font-medium'>{formatVietnamTime(notification.time)}</span>
                            </div>

                            {/* Action buttons */}
                            <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                              {!notification.isRead && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={(e) => handleMarkAsRead(notification.id, e)}
                                  className='h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg'
                                  title='Đánh dấu đã đọc'>
                                  <Check className='h-4 w-4' />
                                </Button>
                              )}
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={(e) => handleDeleteNotification(notification.id, e)}
                                className='h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-lg'
                                title='Xóa thông báo'>
                                <X className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < notifications.length - 1 && (
                      <div className='mx-6 border-b border-slate-100 dark:border-slate-700'></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className='px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl border-t border-slate-100 dark:border-slate-700'>
              <Button
                variant='ghost'
                className='w-full text-sm font-medium text-slate-900 hover:text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 py-2.5 rounded-xl transition-all duration-200'
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}>
                Xem tất cả thông báo
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
