import React, { useEffect } from "react";
import {  useSelector } from "react-redux";
import { fetchBookingStatisticsOverview } from "@/store/slices/bookingSlice";
import { RootState } from "@/store";
import { useAppDispatch } from "@/hooks/useRedux";

const BookingDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { statisticsOverview, loading, error } = useSelector(
    (state: RootState) => state.booking
  );

  useEffect(() => {
    dispatch(fetchBookingStatisticsOverview());
  }, [dispatch]);

  if (loading) return <p>Đang tải...</p>;
  if (error)
    return (
      <p style={{ color: "red" }}>
        {typeof error === "string" ? error : JSON.stringify(error)}
      </p>
    );
  if (!statisticsOverview) return <p>Không có dữ liệu thống kê</p>;

  return (
    <div>
      <h2>Dashboard Booking</h2>
      <div style={{ display: "flex", gap: 24 }}>
        <div>
          <b>Tổng số booking:</b> {statisticsOverview.totalBookings}
        </div>
        <div>
          <b>Doanh thu:</b> {statisticsOverview.totalRevenue}
        </div>
        <div>
          <b>Tổng khách:</b> {statisticsOverview.totalGuests}
        </div>
        {/* Bổ sung các số liệu khác nếu backend trả về */}
      </div>
    </div>
  );
};

export default BookingDashboard;
