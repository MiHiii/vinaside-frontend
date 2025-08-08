import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, List } from 'lucide-react';
import { PermissionGuard } from '@/components/common/PermissionGuard';

interface BookingHeaderProps {
  title?: string;
  subtitle?: string;
}

export const BookingHeader: React.FC<BookingHeaderProps> = ({
  title = 'Quản lý Booking',
  subtitle = 'Xem và quản lý tất cả booking',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isCalendarView = location.pathname.includes('/calendar');
  const isListView = location.pathname.includes('/bookings') && !location.pathname.includes('/calendar');

  const handleViewModeChange = (mode: 'calendar' | 'list') => {
    console.log('🔄 View mode changing to:', mode);
    if (mode === 'calendar') {
      console.log('📅 Navigating to /admin/bookings/calendar');
      navigate('/admin/bookings/calendar');
    } else if (mode === 'list') {
      console.log('📋 Navigating to /admin/bookings');
      navigate('/admin/bookings');
    }
  };

  return (
    <div className='mb-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>{title}</h1>
          <p className='text-gray-600 mt-2'>{subtitle}</p>
        </div>

        <div className='flex items-center gap-3'>
          <PermissionGuard permission='booking.view'>
            <Button
              variant={isCalendarView ? 'default' : 'outline'}
              onClick={() => handleViewModeChange('calendar')}
              className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              Lịch
            </Button>
          </PermissionGuard>

          <PermissionGuard permission='booking.view'>
            <Button
              variant={isListView ? 'default' : 'outline'}
              onClick={() => handleViewModeChange('list')}
              className='flex items-center gap-2'>
              <List className='h-4 w-4' />
              Danh sách
            </Button>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
}; 