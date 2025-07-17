import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import BookingDetail from "@/components/admin/booking/BookingDetail";

const BookingDetailPage: React.FC = () => {
  const { propertyId, bookingId } = useParams<{
    propertyId: string;
    bookingId: string;
  }>();
  const navigate = useNavigate();

  if (!propertyId || !bookingId) {
    return <p>Thiếu thông tin booking!</p>;
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h2>Chi tiết Booking</h2>
      <BookingDetail
        propertyId={propertyId}
        bookingId={bookingId}
        onBack={() => navigate(-1)}
      />
    </div>
  );
};

export default BookingDetailPage;
