'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { usePropertyStaff } from '@/hooks/usePropertyStaff';
import { MessageCircle, Send, Users, Loader2, XCircle } from 'lucide-react';

interface MessageHostDialogProps {
  hostName?: string;
  className?: string;
  propertyId?: string;
}

export default function MessageHostDialog({ hostName = 'host', className = '', propertyId }: MessageHostDialogProps) {
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [sending, setSending] = useState(false);
  const { staffList, loading, error, sendMessageToStaff } = usePropertyStaff(propertyId);

  // Reset selected staff when propertyId changes
  useEffect(() => {
    setSelectedStaffId('');
  }, [propertyId]);

  // Auto-select first staff member when staff list loads
  useEffect(() => {
    if (staffList.length > 0 && !selectedStaffId) {
      setSelectedStaffId(staffList[0]._id);
    }
  }, [staffList, selectedStaffId]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Vui lòng nhập tin nhắn');
      return;
    }

    // Use selected staff ID or first available staff
    const staffIdToUse = selectedStaffId || (staffList.length > 0 ? staffList[0]._id : '');

    if (!staffIdToUse) {
      toast.error('Không tìm thấy nhân viên để gửi tin nhắn');
      return;
    }

    setSending(true);
    try {
      await sendMessageToStaff(staffIdToUse, message.trim());
      setMessage('');
      setIsMessageOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
      <DialogTrigger asChild>
        <Button
          className={`group relative w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] overflow-hidden ${className}`}>
          <div className='absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
          <div className='relative flex items-center justify-center gap-3'>
            <MessageCircle className='w-5 h-5 transition-transform duration-300 group-hover:rotate-12' />
            <span className='text-[14px]'>Nhắn tin cho nhân viên</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-lg bg-white border-0 shadow-2xl rounded-3xl p-0 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out'>
        <div className='bg-gradient-to-br from-gray-50 to-white p-8'>
          <DialogHeader className='space-y-3 animate-in slide-in-from-top-2 duration-700 delay-100'>
            <div className='flex items-center gap-3'>
              <div className='p-3 bg-gray-900 rounded-2xl'>
                <Users className='w-6 h-6 text-white' />
              </div>
              <div>
                <DialogTitle className='text-xl font-bold text-gray-900'>Nhắn tin cho nhân viên</DialogTitle>
                <p className='text-sm text-gray-600 mt-1'>Liên hệ với đội ngũ hỗ trợ tòa nhà</p>
              </div>
            </div>
          </DialogHeader>

          <div className='space-y-6 pt-6 animate-in slide-in-from-bottom-2 duration-700 delay-200'>
            {/* Loading state */}
            {loading && (
              <div className='text-center py-4'>
                <div className='relative'>
                  <div className='w-12 h-12 bg-gray-100 rounded-full mx-auto flex items-center justify-center'>
                    <Loader2 className='w-6 h-6 text-gray-600 animate-spin' />
                  </div>
                </div>
                <p className='text-sm text-gray-600 mt-2 font-medium'>Đang tải...</p>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className='text-center py-4'>
                <div className='w-12 h-12 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-3'>
                  <XCircle className='w-6 h-6 text-red-500' />
                </div>
                <p className='text-sm text-red-600 font-medium mb-2'>{error}</p>
                <Button variant='outline' size='sm' onClick={() => window.location.reload()} className='text-xs'>
                  Thử lại
                </Button>
              </div>
            )}

            {/* Message Input - Always show if not loading */}
            {!loading && (
              <div className='space-y-6'>
                <div className='space-y-3'>
                  <label className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
                    <MessageCircle className='w-4 h-4' />
                    Tin nhắn:
                  </label>
                  <div className='relative'>
                    <Textarea
                      placeholder='Xin chào, tôi muốn hỏi về phòng này. Bạn có thể cho tôi biết thêm thông tin về...'
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className='min-h-[140px] resize-none border-2 border-gray-200 hover:border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 rounded-xl p-4 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-sm leading-relaxed'
                      maxLength={500}
                    />
                    <div className='absolute bottom-3 right-3 text-xs text-gray-400'>{message.length}/500</div>
                  </div>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={sending || !message.trim() || !!error}
                  className='group relative w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none overflow-hidden'>
                  <div className='absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                  <div className='relative flex items-center justify-center gap-3'>
                    {sending ? (
                      <>
                        <Loader2 className='w-5 h-5 animate-spin' />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <Send className='w-5 h-5 transition-transform duration-300 group-hover:translate-x-1' />
                        <span>Gửi tin nhắn</span>
                      </>
                    )}
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
