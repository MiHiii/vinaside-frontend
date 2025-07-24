import React, { useState } from "react";
import BookingStatistics from "@/components/admin/booking/BookingStatistics";
import BookingList from "@/components/admin/booking/BookingList";
import BookingDetail from "@/components/admin/booking/BookingDetail";

const BookingManagementPage: React.FC = () => {
  const [selectedBooking, setSelectedBooking] = useState<{
    propertyId: string;
    id: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Quản lý Booking</h1>
          <p className="text-gray-500 text-base md:text-lg">Theo dõi, thống kê và quản lý các booking một cách trực quan, hiện đại.</p>
        </header>

        {/* Nếu muốn dùng BookingDashboard, bỏ comment dòng dưới */}
        {/* <section>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-center">
            <BookingDashboard />
          </div>
        </section> */}

        <section>
          <div className="bg-white rounded-2xl shadow p-6">
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
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-center">
            <BookingStatistics />
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookingManagementPage;
