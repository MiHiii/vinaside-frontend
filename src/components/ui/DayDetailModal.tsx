import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, User, Home, DollarSign, Clock } from 'lucide-react';
import { Booking } from '@/services/calendarApi';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  bookings: Booking[];
  totalBookings: number;
  totalRevenue: number;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  date,
  bookings,
  totalBookings,
  totalRevenue,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800';
      case 'checked_out':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'checked_in':
        return 'Đã check-in';
      case 'checked_out':
        return 'Đã check-out';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'failed':
        return 'Thanh toán thất bại';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return paymentStatus;
    }
  };

  // Helper function to safely format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'N/A';
    }
  };

  const formatDayOfWeek = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return format(date, 'EEEE', { locale: vi });
    } catch (error) {
      console.error('Error formatting day of week:', dateString, error);
      return 'N/A';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto bg-white border border-gray-200 shadow-lg'>
        <DialogHeader className='pb-4'>
          <DialogTitle className='text-xl font-semibold text-gray-900'>Chi tiết ngày {formatDate(date)}</DialogTitle>
        </DialogHeader>

        {/* Summary */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
            <div className='flex items-center gap-2 mb-2'>
              <Calendar className='h-4 w-4 text-gray-600' />
              <span className='text-sm font-medium text-gray-600'>Tổng booking</span>
            </div>
            <p className='text-2xl font-bold text-gray-900'>{totalBookings}</p>
          </div>

          <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
            <div className='flex items-center gap-2 mb-2'>
              <DollarSign className='h-4 w-4 text-gray-600' />
              <span className='text-sm font-medium text-gray-600'>Doanh thu</span>
            </div>
            <p className='text-2xl font-bold text-gray-900'>{(totalRevenue || 0).toLocaleString('vi-VN')}đ</p>
          </div>

          <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
            <div className='flex items-center gap-2 mb-2'>
              <Clock className='h-4 w-4 text-gray-600' />
              <span className='text-sm font-medium text-gray-600'>Thứ</span>
            </div>
            <p className='text-2xl font-bold text-gray-900'>{formatDayOfWeek(date)}</p>
          </div>
        </div>

        {/* Bookings List */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Danh sách booking ({bookings.length})</h3>

          {bookings.length === 0 ? (
            <div className='text-center py-8'>
              <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-500'>Không có booking nào trong ngày này</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <User className='h-4 w-4 text-gray-600' />
                        <h4 className='font-semibold text-gray-900'>{booking.guest_name}</h4>
                      </div>

                      <div className='flex items-center gap-2 mb-2'>
                        <Home className='h-4 w-4 text-gray-600' />
                        <span className='text-sm text-gray-600'>{booking.property_name}</span>
                      </div>

                      <div className='flex items-center gap-4 text-sm text-gray-600'>
                        <span>Check-in: {formatDate(booking.check_in)}</span>
                        <span>Check-out: {formatDate(booking.check_out)}</span>
                      </div>
                    </div>

                    <div className='text-right'>
                      <p className='font-semibold text-gray-900 mb-2'>
                        {(booking.total_amount || 0).toLocaleString('vi-VN')}đ
                      </p>

                      <div className='flex gap-2'>
                        <Badge className={getStatusColor(booking.status)}>{getStatusText(booking.status)}</Badge>
                        <Badge className={getPaymentStatusColor(booking.payment_status)}>
                          {getPaymentStatusText(booking.payment_status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className='flex justify-end gap-2 pt-3 border-t border-gray-200'>
                    <Button variant='outline' size='sm' className='border-gray-300 hover:bg-gray-100'>
                      Xem chi tiết
                    </Button>
                    <Button variant='outline' size='sm' className='border-gray-300 hover:bg-gray-100'>
                      Chỉnh sửa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
          <Button variant='outline' onClick={onClose} className='border-gray-300 hover:bg-gray-100'>
            Đóng
          </Button>
          <Button
            onClick={() => {
              // TODO: Navigate to create booking for this date
              onClose();
            }}
            className='bg-blue-600 hover:bg-blue-700'>
            Tạo booking mới
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
