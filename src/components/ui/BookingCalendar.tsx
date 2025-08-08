import React, { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';
import { calendarApi, CalendarQueryParams, Booking, CalendarData, CalendarDay } from '@/services/calendarApi';
import { DayDetailModal } from './DayDetailModal';

interface BookingCalendarProps {
  viewType?: 'monthly' | 'weekly' | 'daily';
  startDate?: string;
  endDate?: string;
  propertyId?: string;
  listingId?: string;
  onDayClick?: (date: string) => void;
  onBookingClick?: (bookingId: string, propertyId: string) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  viewType = 'monthly',
  propertyId,
  listingId,
  onDayClick,
  onBookingClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetailModalOpen, setDayDetailModalOpen] = useState(false);

  // Generate calendar days based on viewType
  const getCalendarDays = () => {
    if (viewType === 'monthly') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      // Get the first day of the month and the last day of the month
      const firstDayOfMonth = monthStart;
      const lastDayOfMonth = monthEnd;

      // Get the first day of the week that contains the first day of the month
      const firstDayOfWeek = new Date(firstDayOfMonth);
      firstDayOfWeek.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

      // Get the last day of the week that contains the last day of the month
      const lastDayOfWeek = new Date(lastDayOfMonth);
      lastDayOfWeek.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

      return eachDayOfInterval({ start: firstDayOfWeek, end: lastDayOfWeek });
    }
    // TODO: Add weekly and daily view logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  };

  const days = getCalendarDays();

  // Get bookings for current month
  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, propertyId, listingId, viewType]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const params: CalendarQueryParams = {
        viewType,
        propertyId,
        listingId,
        startDate: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(currentDate), 'yyyy-MM-dd'),
      };

      console.log('📅 Calendar fetching with params:', params);
      const data = await calendarApi.getCalendarData(params);
      console.log('📅 Calendar data received:', data);
      setCalendarData(data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBookingsForDay = (date: Date) => {
    if (!calendarData || !calendarData.days) return [];

    const dateString = format(date, 'yyyy-MM-dd');
    const dayData = calendarData.days.find((day: CalendarDay) => day.date === dateString);

    console.log('📅 Getting bookings for date:', dateString, 'Found:', dayData);
    return dayData ? dayData.bookings : [];
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDayClick = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateString);
    setDayDetailModalOpen(true);

    if (onDayClick) {
      onDayClick(dateString);
    }
  };

  const handleBookingClick = (bookingId: string, propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookingClick) {
      onBookingClick(bookingId, propertyId);
    }
  };

  return (
    <Card className='w-full bg-white border border-gray-200 shadow-sm'>
      <div className='p-6'>
        <div className='w-full'>
          {/* Calendar Header */}
          <div className='flex items-center justify-between mb-6'>
            <Button
              variant='outline'
              size='sm'
              onClick={handlePreviousMonth}
              className='border-gray-300 hover:bg-gray-50'>
              <ChevronLeft className='h-4 w-4' />
            </Button>

            <h2 className='text-xl font-semibold text-gray-900'>{format(currentDate, 'MMMM yyyy', { locale: vi })}</h2>

            <Button variant='outline' size='sm' onClick={handleNextMonth} className='border-gray-300 hover:bg-gray-50'>
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className='grid grid-cols-7 gap-1'>
            {/* Day Headers */}
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
              <div
                key={day}
                className='h-10 p-2 text-center text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg'>
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map((day) => {
              const dayBookings = getBookingsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              // Debug log cho ngày đầu tiên
              if (day.getDate() === 1) {
                console.log('📅 First day bookings:', dayBookings);
                console.log('📅 Calendar data available:', !!calendarData);
                console.log('📅 Days in calendar data:', calendarData?.days?.length);
              }

              return (
                <div
                  key={day.toString()}
                  onClick={() => handleDayClick(day)}
                  className={`
                  h-32 w-full p-3 border border-gray-200 cursor-pointer relative rounded-lg
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${isCurrentDay ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                  hover:bg-gray-50 transition-colors
                  ${dayBookings.length > 0 ? 'border-l-4 border-l-green-500' : ''}
                `}>
                  <div className={`text-sm font-medium mb-2 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {format(day, 'd')}
                  </div>

                  {/* Bookings for this day - only show for current month */}
                  {isCurrentMonth && (
                    <div className='space-y-1 max-h-20 overflow-y-auto'>
                      {dayBookings.slice(0, 2).map((booking) => (
                        <div
                          key={booking._id}
                          onClick={(e) => handleBookingClick(booking._id, booking.propertyId, e)}
                          className='text-xs p-1 bg-gray-100 text-gray-800 rounded cursor-pointer hover:bg-gray-200 truncate'
                          title={`${booking.guest_name} - ${booking.property_name}`}>
                          {booking.guest_name}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className='text-xs text-gray-500 text-center'>+{dayBookings.length - 2}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar Summary */}
          <div className='mt-4 pt-4 border-t border-gray-200'>
            <div className='flex items-center justify-between text-sm text-gray-600'>
              <div className='flex items-center gap-4'>
                <span>
                  Tổng booking: <span className='font-medium text-gray-900'>{calendarData?.totalBookings || 0}</span>
                </span>
                <span>
                  Doanh thu:{' '}
                  <span className='font-medium text-gray-900'>
                    {(calendarData?.totalRevenue || 0).toLocaleString('vi-VN')}đ
                  </span>
                </span>
              </div>
              <div className='text-xs text-gray-500'>Click vào ngày để xem chi tiết</div>
            </div>
          </div>

          {loading && (
            <div className='flex justify-center items-center py-4'>
              <div className='text-gray-500'>Đang tải...</div>
            </div>
          )}
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDate && (
        <DayDetailModal
          isOpen={dayDetailModalOpen}
          onClose={() => {
            setDayDetailModalOpen(false);
            setSelectedDate(null);
          }}
          date={selectedDate}
          bookings={getBookingsForDay(new Date(selectedDate))}
          totalBookings={getBookingsForDay(new Date(selectedDate)).length}
          totalRevenue={getBookingsForDay(new Date(selectedDate)).reduce(
            (sum: number, booking: Booking) => sum + booking.total_amount,
            0,
          )}
        />
      )}
    </Card>
  );
};
