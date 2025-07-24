import React, { useState } from "react";
import BookingDashboard from "@/components/admin/booking/BookingDashboard";
import BookingStatistics from "@/components/admin/booking/BookingStatistics";
import BookingList from "@/components/admin/booking/BookingList";
import BookingDetail from "@/components/admin/booking/BookingDetail";

const BookingManagementPage: React.FC = () => {
  const [selectedBooking, setSelectedBooking] = useState<{
    propertyId: string;
    id: string;
  } | null>(null);

  return (
    <div>
      <BookingDashboard />
     
      {selectedBooking ? (
        <BookingDetail
          propertyId={selectedBooking.propertyId}
          bookingId={selectedBooking.id}
          onBack={() => setSelectedBooking(null)}
        />
      ) : (
        <BookingList  />
      )}
       <BookingStatistics />
    </div>
  );
};

export default BookingManagementPage;
