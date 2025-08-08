import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

interface Booking {
  _id: string;
  check_in: string;
  check_out: string;
  guest_name: string;
  property_name: string;
  status: string;
}

export const CalendarWidget: React.FC = () => {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate week days
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  useEffect(() => {
    fetchWeekBookings();
  }, [currentWeek]);

  const fetchWeekBookings = async () => {
    setLoading(true);
    try {
      // Sử dụng API booking hiện có
      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(weekEnd, 'yyyy-MM-dd');

      const response = await api.get('/bookings', {
        params: {
          startDate,
          endDate,
          limit: 50,
        },
      });

      console.log('📅 Widget API response:', response.data);

      const bookingsData = response.data.data?.bookings || response.data.data || [];
      const transformedBookings: Booking[] = bookingsData.map((booking: any) => ({
        _id: booking._id,
        check_in: booking.checkInDate || booking.check_in,
        check_out: booking.checkOutDate || booking.check_out,
        guest_name: booking.guest_name || booking.guestName,
        property_name: booking.property_name || booking.propertyName,
        status: booking.status,
        total_amount: booking.final_amount || booking.total_price || 0,
        payment_status: booking.payment_status || booking.paymentStatus,
      }));

      setBookings(transformedBookings);
    } catch (error) {
      console.error('❌ Error fetching week bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getBookingsForDay = (date: Date) => {
    return bookings.filter((booking) => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      return date >= checkIn && date < checkOut;
    });
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleViewAll = () => {
    navigate('/admin/bookings/calendar');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className='w-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold text-gray-900'>Lịch Booking Tuần Này</CardTitle>
          <Button
            variant='outline'
            size='sm'
            onClick={handleViewAll}
            className='text-xs border-gray-300 hover:bg-gray-100'>
            <Eye className='h-3 w-3 mr-1' />
            Xem tất cả
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Week Navigation */}
        <div className='flex items-center justify-between mb-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={handlePreviousWeek}
            className='h-6 w-6 p-0 border-gray-300 hover:bg-gray-100'>
            <ChevronLeft className='h-3 w-3' />
          </Button>

          <span className='text-sm font-medium text-gray-700'>
            {format(weekStart, 'dd/MM', { locale: vi })} - {format(weekEnd, 'dd/MM', { locale: vi })}
          </span>

          <Button
            variant='outline'
            size='sm'
            onClick={handleNextWeek}
            className='h-6 w-6 p-0 border-gray-300 hover:bg-gray-100'>
            <ChevronRight className='h-3 w-3' />
          </Button>
        </div>

        {/* Week Calendar */}
        <div className='grid grid-cols-7 gap-1'>
          {/* Day Headers */}
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
            <div key={day} className='text-center text-xs font-medium text-gray-500 py-1'>
              {day}
            </div>
          ))}

          {/* Week Days */}
          {weekDays.map((day) => {
            const dayBookings = getBookingsForDay(day);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toString()}
                className={`
                  min-h-[60px] p-1 border border-gray-200 text-center
                  ${isCurrentDay ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-white'}
                `}>
                <div
                  className={`
                  text-xs font-medium mb-1
                  ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}
                `}>
                  {format(day, 'd')}
                </div>

                {/* Bookings */}
                <div className='space-y-1'>
                  {dayBookings.slice(0, 2).map((booking) => (
                    <div
                      key={booking._id}
                      className={`
                        text-xs p-1 rounded cursor-pointer truncate
                        ${getStatusColor(booking.status)}
                        hover:opacity-80
                      `}
                      title={`${booking.guest_name} - ${booking.property_name}`}>
                      {booking.guest_name}
                    </div>
                  ))}
                  {dayBookings.length > 2 && <div className='text-xs text-gray-500'>+{dayBookings.length - 2}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className='mt-4 pt-4 border-t border-gray-200'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-600'>Tổng booking tuần này:</span>
            <span className='font-medium text-gray-900'>{bookings.length}</span>
          </div>
        </div>

        {loading && (
          <div className='flex justify-center items-center py-2'>
            <div className='text-xs text-gray-500'>Đang tải...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
