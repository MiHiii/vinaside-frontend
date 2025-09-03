import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import MessageCard from './MessageCard';
import {
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  MessageSquare,
  Inbox,
  Archive,
  Trash2,
  Star,
  Mail,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';

export interface Message {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'default';
  title: string;
  content: string;
  timestamp: string;
  author: string;
  avatar?: string;
  isRead: boolean;
  hasAttachment: boolean;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'resolved' | 'closed';
  category?: string;
  tags?: string[];
}

interface MessageListProps {
  messages: Message[];
  className?: string;
  onMessageRead?: (messageId: string) => void;
  onMessageReply?: (messageId: string) => void;
  onMessageDelete?: (messageId: string) => void;
  onMessageArchive?: (messageId: string) => void;
  onMessageStar?: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  className,
  onMessageRead,
  onMessageReply,
  onMessageDelete,
  onMessageArchive,
  onMessageStar,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Filter messages based on search and filters
  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || message.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || message.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || message.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Get unique categories from messages
  const categories = ['all', ...Array.from(new Set(messages.map((m) => m.category).filter(Boolean)))];

  // Count messages by status
  const unreadCount = messages.filter((m) => !m.isRead).length;
  const pendingCount = messages.filter((m) => m.status === 'pending').length;
  const resolvedCount = messages.filter((m) => m.status === 'resolved').length;

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header */}
      <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-6'>
        <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
              <MessageSquare className='w-6 h-6 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Tin nhắn</h1>
              <p className='text-gray-600'>Quản lý và xử lý tin nhắn của bạn</p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className='hidden sm:flex'>
              {viewMode === 'list' ? 'Chế độ lưới' : 'Chế độ danh sách'}
            </Button>
            <Button className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>
              <Plus className='w-4 h-4 mr-2' />
              Tin nhắn mới
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-6'>
          <div className='bg-blue-50 rounded-xl p-4 border border-blue-200'>
            <div className='flex items-center gap-3'>
              <Inbox className='w-8 h-8 text-blue-600' />
              <div>
                <p className='text-2xl font-bold text-blue-900'>{messages.length}</p>
                <p className='text-sm text-blue-700'>Tổng tin nhắn</p>
              </div>
            </div>
          </div>

          <div className='bg-yellow-50 rounded-xl p-4 border border-yellow-200'>
            <div className='flex items-center gap-3'>
              <Mail className='w-8 h-8 text-yellow-600' />
              <div>
                <p className='text-2xl font-bold text-yellow-900'>{unreadCount}</p>
                <p className='text-sm text-yellow-700'>Chưa đọc</p>
              </div>
            </div>
          </div>

          <div className='bg-orange-50 rounded-xl p-4 border border-orange-200'>
            <div className='flex items-center gap-3'>
              <Clock className='w-8 h-8 text-orange-600' />
              <div>
                <p className='text-2xl font-bold text-orange-900'>{pendingCount}</p>
                <p className='text-sm text-orange-700'>Đang xử lý</p>
              </div>
            </div>
          </div>

          <div className='bg-green-50 rounded-xl p-4 border border-green-200'>
            <div className='flex items-center gap-3'>
              <CheckCircle className='w-8 h-8 text-green-600' />
              <div>
                <p className='text-2xl font-bold text-green-900'>{resolvedCount}</p>
                <p className='text-sm text-green-700'>Đã giải quyết</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-6'>
        <div className='flex flex-col lg:flex-row gap-4'>
          {/* Search */}
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <Input
                placeholder='Tìm kiếm tin nhắn...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className='flex flex-wrap gap-2'>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size='sm'
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  selectedCategory === category
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border-gray-300 hover:border-blue-500',
                )}>
                {category === 'all' ? 'Tất cả' : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Additional Filters */}
        <div className='flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-200'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-gray-700'>Ưu tiên:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className='px-3 py-1 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500'>
              <option value='all'>Tất cả</option>
              <option value='high'>Cao</option>
              <option value='medium'>Trung bình</option>
              <option value='low'>Thấp</option>
            </select>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-gray-700'>Trạng thái:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className='px-3 py-1 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500'>
              <option value='all'>Tất cả</option>
              <option value='pending'>Đang xử lý</option>
              <option value='resolved'>Đã giải quyết</option>
              <option value='closed'>Đã đóng</option>
            </select>
          </div>

          <Badge variant='secondary' className='bg-gray-100 text-gray-700'>
            {filteredMessages.length} tin nhắn
          </Badge>
        </div>
      </div>

      {/* Messages Grid/List */}
      <div
        className={cn('grid gap-6', viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
        {filteredMessages.length > 0 ? (
          filteredMessages.map((message) => (
            <MessageCard
              key={message.id}
              type={message.type}
              title={message.title}
              content={message.content}
              timestamp={message.timestamp}
              author={message.author}
              avatar={message.avatar}
              isRead={message.isRead}
              hasAttachment={message.hasAttachment}
              priority={message.priority}
              status={message.status}
              onRead={() => onMessageRead?.(message.id)}
              onReply={() => onMessageReply?.(message.id)}
              onClose={() => onMessageDelete?.(message.id)}
            />
          ))
        ) : (
          <div className='col-span-full text-center py-12'>
            <div className='w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4'>
              <MessageSquare className='w-12 h-12 text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>Không có tin nhắn nào</h3>
            <p className='text-gray-600'>
              {searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all'
                ? 'Thử thay đổi bộ lọc để xem thêm tin nhắn'
                : 'Bạn chưa có tin nhắn nào. Hãy tạo tin nhắn đầu tiên!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
