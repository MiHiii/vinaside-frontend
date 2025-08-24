import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, User, Home, DollarSign, Clock, RefreshCw } from 'lucide-react';
import { Booking, calendarApi } from '@/services/calendarApi';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { propertyStaffAssignmentApi } from '@/services/propertyStaffAssignmentApi';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  propertyId?: string;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({ isOpen, onClose, date, propertyId }) => {
  const navigate = useNavigate();
  const { isStaff, user } = useUserRole();
  const [dayData, setDayData] = useState<{
    date: string;
    dayOfWeek: string;
    isToday: boolean;
    isWeekend: boolean;
    bookings: Booking[];
    totalBookings: number;
    totalRevenue: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffProperties, setStaffProperties] = useState<any[]>([]);
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

  // Fetch staff properties if needed
  useEffect(() => {
    const fetchStaffProperties = async () => {
      if (isStaff && user?._id) {
        try {
          const response = await propertyStaffAssignmentApi.getPropertiesByStaff(user._id);
          if (response.success && response.data) {
            setStaffProperties(response.data);
          }
        } catch (error) {
          console.error('Failed to fetch staff properties:', error);
        }
      }
    };

    fetchStaffProperties();
  }, [isStaff, user?._id]);

  // Fetch day data when modal opens
  useEffect(() => {
    if (isOpen && date) {
      fetchDayData();
    }
  }, [isOpen, date]);

  const fetchDayData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await calendarApi.getDayBookings(date, { propertyId });
      setDayData(data);
    } catch (err) {
      console.error('Error fetching day data:', err);
      setError('Không thể tải dữ liệu ngày này');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingClick = (booking: Booking) => {
    // Priority 1: Use propertyId from booking data (API now returns this)
    if (booking.propertyId) {
      navigate(`/admin/bookings/${booking.propertyId}/${booking._id}`);
      onClose();
      return;
    }

    // Priority 2: Use propertyId from props if available and valid
    if (propertyId && propertyId !== 'all' && propertyId !== 'unknown') {
      navigate(`/admin/bookings/${propertyId}/${booking._id}`);
      onClose();
      return;
    }

    // Priority 3: Try to get from other booking fields (fallback)
    let finalPropertyId = null;
    if (booking.property_id) {
      finalPropertyId = booking.property_id;
    } else if (booking.property?._id) {
      finalPropertyId = booking.property._id;
    } else if (booking.property?.id) {
      finalPropertyId = booking.property.id;
    } else if (booking.listingId?.propertyId) {
      finalPropertyId = booking.listingId.propertyId;
    } else if (booking.listingId?.property_id) {
      finalPropertyId = booking.listingId.property_id;
    } else if (booking.listingId?.property?._id) {
      finalPropertyId = booking.listingId.property._id;
    } else if (booking.listingId?.property?.id) {
      finalPropertyId = booking.listingId.property.id;
    }

    if (finalPropertyId) {
      navigate(`/admin/bookings/${finalPropertyId}/${booking._id}`);
      onClose();
      return;
    }

    // Priority 4: If user is staff, try to use first staff property
    if (isStaff && staffProperties.length > 0) {
      const firstProperty = staffProperties[0];
      const staffPropertyId = firstProperty.propertyId?._id || firstProperty.propertyId?.id;
      if (staffPropertyId) {
        navigate(`/admin/bookings/${staffPropertyId}/${booking._id}`);
        onClose();
        return;
      }
    }
    navigate(`/admin/bookings`);
    onClose();
  };

  // Loading state
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          size='3xl'
          maxHeight='full'
          overlayBlur={true}
          overlayOpacity='medium'
          showCloseButton={true}
          closeButtonPosition='top-right'
          className='overflow-y-auto bg-white border-0 shadow-2xl rounded-lg'>
          <DialogHeader className='pb-4'>
            <DialogTitle className='text-xl font-semibold text-gray-900'>Chi tiết ngày {formatDate(date)}</DialogTitle>
          </DialogHeader>
          <div className='flex items-center justify-center py-12'>
            <div className='flex items-center gap-2'>
              <RefreshCw className='w-6 h-6 animate-spin' />
              <span>Đang tải dữ liệu...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          size='3xl'
          maxHeight='full'
          overlayBlur={true}
          overlayOpacity='medium'
          showCloseButton={true}
          closeButtonPosition='top-right'
          className='overflow-y-auto bg-white border-0 shadow-2xl rounded-lg'>
          <DialogHeader className='pb-4'>
            <DialogTitle className='text-xl font-semibold text-gray-900'>Chi tiết ngày {formatDate(date)}</DialogTitle>
          </DialogHeader>
          <div className='text-center py-12'>
            <p className='text-red-600 mb-4'>{error}</p>
            <Button onClick={fetchDayData} variant='outline'>
              Thử lại
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // No data state
  if (!dayData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          size='3xl'
          maxHeight='full'
          overlayBlur={true}
          overlayOpacity='medium'
          showCloseButton={true}
          closeButtonPosition='top-right'
          className='overflow-y-auto bg-white border-0 shadow-2xl rounded-lg'>
          <DialogHeader className='pb-4'>
            <DialogTitle className='text-xl font-semibold text-gray-900'>Chi tiết ngày {formatDate(date)}</DialogTitle>
          </DialogHeader>
          <div className='text-center py-12'>
            <p className='text-gray-500'>Không có dữ liệu</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        size='3xl'
        maxHeight='full'
        overlayBlur={true}
        overlayOpacity='medium'
        showCloseButton={true}
        closeButtonPosition='top-right'
        className='overflow-y-auto bg-white border-0 shadow-2xl rounded-lg'>
        <DialogHeader className='pb-4'>
          <DialogTitle className='text-xl font-semibold text-gray-900'>
            Chi tiết ngày {formatDate(dayData.date)}
          </DialogTitle>
        </DialogHeader>

        {/* Summary */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
            <div className='flex items-center gap-2 mb-2'>
              <Calendar className='h-4 w-4 text-gray-600' />
              <span className='text-sm font-medium text-gray-600'>Tổng booking</span>
            </div>
            <p className='text-xl font-bold text-gray-900'>{dayData.totalBookings}</p>
          </div>

          <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
            <div className='flex items-center gap-2 mb-2'>
              <DollarSign className='h-4 w-4 text-gray-600' />
              <span className='text-sm font-medium text-gray-600'>Doanh thu</span>
            </div>
            <p className='text-xl font-bold text-gray-900'>
              {Math.round(dayData.totalRevenue || 0).toLocaleString('vi-VN')}đ
            </p>
          </div>

          <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
            <div className='flex items-center gap-2 mb-2'>
              <Clock className='h-4 w-4 text-gray-600' />
              <span className='text-sm font-medium text-gray-600'>Thứ</span>
            </div>
            <p className='text-xl font-bold text-gray-900'>{dayData.dayOfWeek}</p>
          </div>
        </div>

        {/* Bookings List */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Danh sách booking ({dayData.bookings.length})</h3>
          <div className='grid gap-4'>
            {dayData.bookings.length === 0 ? (
              <div className='text-center py-8'>
                <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>Không có booking nào trong ngày này</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {dayData.bookings.map((booking: Booking) => (
                  <div
                    key={booking._id}
                    className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors'>
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3'>
                      {/* Guest Info */}
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <User className='h-4 w-4 text-gray-600' />
                          <h4 className='font-semibold text-gray-900'>{booking.guest_name}</h4>
                        </div>
                        {booking.guest_email && <div className='text-sm text-gray-500 ml-6'>{booking.guest_email}</div>}
                        {booking.guests && <div className='text-sm text-gray-600 ml-6'>Số khách: {booking.guests}</div>}
                      </div>

                      {/* Property Info */}
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Home className='h-4 w-4 text-gray-600' />
                          <span className='text-sm font-medium text-gray-900'>{booking.property_name}</span>
                        </div>
                        {booking.listing_title && (
                          <div className='text-sm text-gray-600 ml-6'>{booking.listing_title}</div>
                        )}
                        <div className='text-sm text-gray-600 ml-6'>
                          <div>Check-in: {formatDate(booking.checkInDate || booking.check_in)}</div>
                          <div>Check-out: {formatDate(booking.checkOutDate || booking.check_out)}</div>
                        </div>
                      </div>

                      {/* Status & Amount */}
                      <div className='space-y-2'>
                        <div className='text-right'>
                          <p className='font-semibold text-gray-900 text-lg'>
                            {(booking.final_amount || booking.total_amount || 0).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <div className='flex gap-2 justify-end'>
                          <Badge className={getStatusColor(booking.status)}>{getStatusText(booking.status)}</Badge>
                          <Badge className={getPaymentStatusColor(booking.payment_status)}>
                            {getPaymentStatusText(booking.payment_status)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className='flex justify-end gap-2 pt-3 border-t border-gray-200'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='border-gray-300 hover:bg-gray-100'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookingClick(booking);
                        }}>
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
