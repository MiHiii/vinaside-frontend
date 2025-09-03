import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import {
  Send,
  Paperclip,
  Smile,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  MessageCircle,
  Star,
  User,
  Building,
  Calendar,
  Tag,
  Eye,
} from 'lucide-react';

export interface MessageComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: {
    title: string;
    content: string;
    type: 'success' | 'error' | 'warning' | 'info' | 'default';
    priority: 'low' | 'medium' | 'high';
    category: string;
    tags: string[];
    recipient?: string;
  }) => void;
  className?: string;
  initialData?: {
    title?: string;
    content?: string;
    type?: 'success' | 'error' | 'warning' | 'info' | 'default';
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    tags?: string[];
    recipient?: string;
  };
}

const MessageComposer: React.FC<MessageComposerProps> = ({ isOpen, onClose, onSubmit, className, initialData }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    type: initialData?.type || ('default' as const),
    priority: initialData?.priority || ('medium' as const),
    category: initialData?.category || '',
    tags: initialData?.tags || [],
    recipient: initialData?.recipient || '',
  });

  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange(
      'tags',
      formData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        title: '',
        content: '',
        type: 'default',
        priority: 'medium',
        category: '',
        tags: [],
        recipient: '',
      });
      onClose();
    } catch (error) {
      console.error('Error submitting message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className='w-4 h-4 text-green-600' />;
      case 'error':
        return <AlertCircle className='w-4 h-4 text-red-600' />;
      case 'warning':
        return <AlertCircle className='w-4 h-4 text-yellow-600' />;
      case 'info':
        return <Info className='w-4 h-4 text-blue-600' />;
      default:
        return <MessageCircle className='w-4 h-4 text-gray-600' />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className={cn('bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto', className)}>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
              <MessageCircle className='w-5 h-5 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900'>Soạn tin nhắn mới</h2>
              <p className='text-sm text-gray-600'>Tạo và gửi tin nhắn mới</p>
            </div>
          </div>

          <Button variant='ghost' size='sm' onClick={onClose} className='h-8 w-8 p-0 hover:bg-gray-100'>
            <X className='w-4 h-4' />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Basic Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='title' className='text-sm font-semibold text-gray-700'>
                Tiêu đề tin nhắn *
              </Label>
              <Input
                id='title'
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder='Nhập tiêu đề tin nhắn...'
                className='border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='recipient' className='text-sm font-semibold text-gray-700'>
                Người nhận
              </Label>
              <Input
                id='recipient'
                value={formData.recipient}
                onChange={(e) => handleInputChange('recipient', e.target.value)}
                placeholder='Email hoặc tên người nhận...'
                className='border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              />
            </div>
          </div>

          {/* Message Type and Priority */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='space-y-2'>
              <Label className='text-sm font-semibold text-gray-700'>Loại tin nhắn</Label>
              <Select value={formData.type} onValueChange={(value: any) => handleInputChange('type', value)}>
                <SelectTrigger className='border-gray-300 focus:border-blue-500 focus:ring-blue-500'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='default' className='flex items-center gap-2'>
                    <MessageCircle className='w-4 h-4' />
                    Tin nhắn thường
                  </SelectItem>
                  <SelectItem value='info' className='flex items-center gap-2'>
                    <Info className='w-4 h-4' />
                    Thông tin
                  </SelectItem>
                  <SelectItem value='success' className='flex items-center gap-2'>
                    <CheckCircle className='w-4 h-4' />
                    Thành công
                  </SelectItem>
                  <SelectItem value='warning' className='flex items-center gap-2'>
                    <AlertCircle className='w-4 h-4' />
                    Cảnh báo
                  </SelectItem>
                  <SelectItem value='error' className='flex items-center gap-2'>
                    <AlertCircle className='w-4 h-4' />
                    Lỗi
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label className='text-sm font-semibold text-gray-700'>Mức ưu tiên</Label>
              <Select value={formData.priority} onValueChange={(value: any) => handleInputChange('priority', value)}>
                <SelectTrigger className='border-gray-300 focus:border-blue-500 focus:ring-blue-500'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='low' className='flex items-center gap-2'>
                    <CheckCircle className='w-4 h-4' />
                    Thấp
                  </SelectItem>
                  <SelectItem value='medium' className='flex items-center gap-2'>
                    <Calendar className='w-4 h-4' />
                    Trung bình
                  </SelectItem>
                  <SelectItem value='high' className='flex items-center gap-2'>
                    <AlertCircle className='w-4 h-4' />
                    Cao
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='category' className='text-sm font-semibold text-gray-700'>
                Danh mục
              </Label>
              <Input
                id='category'
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder='Nhập danh mục...'
                className='border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              />
            </div>
          </div>

          {/* Message Content */}
          <div className='space-y-2'>
            <Label htmlFor='content' className='text-sm font-semibold text-gray-700'>
              Nội dung tin nhắn *
            </Label>
            <Textarea
              id='content'
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder='Nhập nội dung tin nhắn...'
              rows={6}
              className='border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none'
              required
            />
          </div>

          {/* Tags */}
          <div className='space-y-3'>
            <Label className='text-sm font-semibold text-gray-700'>Tags</Label>
            <div className='flex flex-wrap gap-2'>
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className='inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>
                  <Tag className='w-3 h-3' />
                  {tag}
                  <button
                    type='button'
                    onClick={() => handleRemoveTag(tag)}
                    className='ml-1 hover:bg-blue-200 rounded-full p-0.5'>
                    <X className='w-3 h-3' />
                  </button>
                </span>
              ))}
            </div>
            <div className='flex gap-2'>
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder='Thêm tag mới...'
                className='flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button
                type='button'
                variant='outline'
                onClick={handleAddTag}
                className='border-gray-300 hover:border-blue-500'>
                Thêm
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
            <h4 className='font-semibold text-gray-800 mb-3 flex items-center gap-2'>
              <Eye className='w-4 h-4' />
              Xem trước
            </h4>
            <div className='bg-white rounded-lg p-4 border border-gray-200'>
              <div className='flex items-center gap-3 mb-3'>
                {getTypeIcon(formData.type)}
                <h5 className='font-semibold text-gray-900'>{formData.title || 'Tiêu đề tin nhắn'}</h5>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                    getPriorityColor(formData.priority),
                  )}>
                  {formData.priority === 'high'
                    ? 'Ưu tiên cao'
                    : formData.priority === 'medium'
                    ? 'Ưu tiên trung bình'
                    : 'Ưu tiên thấp'}
                </span>
              </div>
              <p className='text-gray-700 text-sm'>{formData.content || 'Nội dung tin nhắn sẽ hiển thị ở đây...'}</p>
              {formData.tags.length > 0 && (
                <div className='flex flex-wrap gap-1 mt-3'>
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className='inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs'>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className='flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl'>
          <div className='flex items-center gap-4 text-sm text-gray-600'>
            <div className='flex items-center gap-2'>
              <Paperclip className='w-4 h-4' />
              <span>Đính kèm tệp</span>
            </div>
            <div className='flex items-center gap-2'>
              <Smile className='w-4 h-4' />
              <span>Biểu tượng cảm xúc</span>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <Button type='button' variant='outline' onClick={onClose} className='border-gray-300 hover:border-gray-400'>
              Hủy
            </Button>
            <Button
              type='submit'
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'>
              {isSubmitting ? (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                  <span>Đang gửi...</span>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <Send className='w-4 h-4' />
                  <span>Gửi tin nhắn</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageComposer;
