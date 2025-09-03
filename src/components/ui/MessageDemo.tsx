import React, { useState } from 'react';
import MessageCard from './MessageCard';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import { Button } from './button';
import { Message } from './MessageList';

const MessageDemo: React.FC = () => {
  const [showComposer, setShowComposer] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'success',
      title: 'Đặt phòng thành công',
      content:
        'Chúc mừng! Bạn đã đặt phòng thành công tại Homestay Sunshine. Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn. Vui lòng kiểm tra email để biết thêm chi tiết.',
      timestamp: '2024-01-15 14:30',
      author: 'Hệ thống',
      isRead: false,
      hasAttachment: true,
      priority: 'high',
      status: 'pending',
      category: 'Đặt phòng',
    },
    {
      id: '2',
      type: 'info',
      title: 'Thông báo về dịch vụ mới',
      content:
        'Chúng tôi vừa ra mắt dịch vụ dọn phòng hàng ngày miễn phí cho tất cả khách hàng. Dịch vụ này sẽ giúp phòng của bạn luôn sạch sẽ và thoải mái trong suốt thời gian lưu trú.',
      timestamp: '2024-01-14 09:15',
      author: 'Quản lý Homestay',
      isRead: true,
      hasAttachment: false,
      priority: 'medium',
      status: 'resolved',
      category: 'Dịch vụ',
    },
    {
      id: '3',
      type: 'warning',
      title: 'Nhắc nhở thanh toán',
      content:
        'Bạn có khoản thanh toán còn lại cho đặt phòng #BK001. Vui lòng hoàn tất thanh toán trong vòng 24 giờ để đảm bảo đặt phòng của bạn không bị hủy.',
      timestamp: '2024-01-13 16:45',
      author: 'Bộ phận Tài chính',
      isRead: false,
      hasAttachment: false,
      priority: 'high',
      status: 'pending',
      category: 'Thanh toán',
    },
    {
      id: '4',
      type: 'error',
      title: 'Lỗi đăng nhập',
      content:
        'Chúng tôi phát hiện có nhiều lần đăng nhập không thành công từ tài khoản của bạn. Vui lòng kiểm tra lại thông tin đăng nhập hoặc liên hệ hỗ trợ nếu cần thiết.',
      timestamp: '2024-01-12 11:20',
      author: 'Bộ phận Bảo mật',
      isRead: true,
      hasAttachment: false,
      priority: 'high',
      status: 'resolved',
      category: 'Bảo mật',
    },
    {
      id: '5',
      type: 'default',
      title: 'Chào mừng bạn đến với Homestay',
      content:
        'Cảm ơn bạn đã chọn Homestay Sunshine cho kỳ nghỉ sắp tới. Chúng tôi cam kết mang đến cho bạn trải nghiệm lưu trú tuyệt vời nhất với dịch vụ chất lượng và sự quan tâm chu đáo.',
      timestamp: '2024-01-11 08:00',
      author: 'Đội ngũ Chăm sóc khách hàng',
      isRead: true,
      hasAttachment: false,
      priority: 'low',
      status: 'closed',
      category: 'Chào mừng',
    },
  ]);

  const handleMessageRead = (messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isRead: true } : msg)));
  };

  const handleMessageReply = (messageId: string) => {
    console.log('Reply to message:', messageId);
    // Implement reply functionality
  };

  const handleMessageDelete = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  const handleMessageArchive = (messageId: string) => {
    console.log('Archive message:', messageId);
    // Implement archive functionality
  };

  const handleMessageStar = (messageId: string) => {
    console.log('Star message:', messageId);
    // Implement star functionality
  };

  const handleComposerSubmit = (messageData: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: messageData.type,
      title: messageData.title,
      content: messageData.content,
      timestamp: new Date().toLocaleString('vi-VN'),
      author: 'Bạn',
      isRead: false,
      hasAttachment: false,
      priority: messageData.priority,
      status: 'pending',
      category: messageData.category || 'Khác',
      tags: messageData.tags,
    };

    setMessages((prev) => [newMessage, ...prev]);
    setShowComposer(false);
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>Giao diện Message System</h1>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Hệ thống quản lý tin nhắn với giao diện đẹp, responsive và đầy đủ tính năng
          </p>
        </div>

        {/* Demo Controls */}
        <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <h2 className='text-xl font-semibold text-gray-900'>Điều khiển Demo</h2>
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <span className='w-3 h-3 bg-green-500 rounded-full'></span>
                <span>{messages.filter((m) => !m.isRead).length} chưa đọc</span>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Button
                variant='outline'
                onClick={() => setMessages([])}
                className='border-red-300 text-red-600 hover:bg-red-50'>
                Xóa tất cả
              </Button>
              <Button
                onClick={() => setShowComposer(true)}
                className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>
                Tạo tin nhắn mới
              </Button>
            </div>
          </div>
        </div>

        {/* Message List */}
        <MessageList
          messages={messages}
          onMessageRead={handleMessageRead}
          onMessageReply={handleMessageReply}
          onMessageDelete={handleMessageDelete}
          onMessageArchive={handleMessageArchive}
          onMessageStar={handleMessageStar}
        />

        {/* Message Composer */}
        <MessageComposer isOpen={showComposer} onClose={() => setShowComposer(false)} onSubmit={handleComposerSubmit} />

        {/* Individual Message Card Demo */}
        <div className='mt-12'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6 text-center'>Demo Message Card Đơn lẻ</h2>
          <div className='max-w-2xl mx-auto'>
            <MessageCard
              type='success'
              title='Đặt phòng thành công - Demo Card'
              content='Đây là một ví dụ về MessageCard đơn lẻ với giao diện đẹp và responsive. Card này có thể được sử dụng độc lập hoặc trong danh sách.'
              timestamp='2024-01-15 15:30'
              author='Demo User'
              isRead={false}
              hasAttachment={true}
              priority='high'
              status='pending'
              onRead={() => console.log('Message read')}
              onReply={() => console.log('Reply clicked')}
              onClose={() => console.log('Close clicked')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDemo;
