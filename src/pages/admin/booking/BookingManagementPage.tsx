import React, { useState } from 'react';
import { BookingHeader } from '@/components/admin/booking/BookingHeader';
import BookingStatistics from '@/components/admin/booking/BookingStatistics';
import BookingList from '@/components/admin/booking/BookingList';
import BookingDetail from '@/components/admin/booking/BookingDetail';

const BookingManagementPage: React.FC = () => {
  const [selectedBooking, setSelectedBooking] = useState<{
    propertyId: string;
    id: string;
  } | null>(null);

  return (
    <div className='min-h-screen py-4 px-2 md:px-2'>
      <div className='max-w-full'>
        {/* Page Header with Tabs */}
        <BookingHeader />
        {/* Nếu muốn dùng BookingDashboard, bỏ comment dòng dưới */}
        {/* <section>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-center">
            <BookingDashboard />
          </div>
        </section> */}

        <section>
          <div className=''>
            {selectedBooking ? (
              <BookingDetail
                propertyId={selectedBooking.propertyId}
                bookingId={selectedBooking.id}
                onBack={() => setSelectedBooking(null)}
              />
            ) : (
              <BookingList />
            )}
          </div>
        </section>

        <section>
          <div className='p-6 flex flex-col justify-center'>
            <BookingStatistics />
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookingManagementPage;
