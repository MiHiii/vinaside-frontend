import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { getMyBookingHistory } from "@/store/slices/bookingSlice";
import { BookingData } from "@/types/booking";

const STATUS_UPCOMING = ["pending", "confirmed"];
const STATUS_HISTORY = ["cancelled", "completed", "rejected"];

type BookingWithStatus = BookingData & {
  status?: string;
  listingId?: { images?: string[]; title?: string } | string;
};

function isListingObj(
  listing: unknown
): listing is { images?: string[]; title?: string } {
  return (
    listing !== null &&
    typeof listing === "object" &&
    ("images" in listing || "title" in listing)
  );
}

const PastTrip = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { myBookingHistory, loading, error } = useSelector(
    (state: RootState) => state.booking
  );
  const user = useSelector((state: RootState) => state.auth.user);

  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [selectedBooking, setSelectedBooking] =
    useState<BookingWithStatus | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    dispatch(getMyBookingHistory(undefined));
  }, [dispatch]);

  const bookings: BookingWithStatus[] =
    (myBookingHistory as BookingWithStatus[]) || [];
  const now = new Date();

  // Phân loại booking
  const upcomingBookings = bookings.filter(
    (b) =>
      STATUS_UPCOMING.includes(b.status || "") && new Date(b.checkInDate) > now
  );
  const ongoingBookings = bookings.filter(
    (b) =>
      STATUS_UPCOMING.includes(b.status || "") &&
      new Date(b.checkInDate) <= now &&
      new Date(b.checkOutDate) >= now
  );
  const historyBookings = bookings.filter(
    (b) =>
      STATUS_HISTORY.includes(b.status || "") || new Date(b.checkOutDate) < now
  );

  // Xử lý xem chi tiết
  const handleShowDetail = (booking: BookingWithStatus) => {
    setSelectedBooking(booking);
    setShowDetail(true);
  };

  const renderBooking = (booking: BookingWithStatus, showCancel = false) => {
    const listing = booking.listingId;
    const image = isListingObj(listing) ? listing.images?.[0] : undefined;
    const title = isListingObj(listing) ? listing.title : undefined;
    return (
      <li
        key={booking._id}
        className="py-4 flex flex-col md:flex-row md:items-center md:justify-between border-b"
      >
        <div className="flex items-center gap-4">
          <img
            src={image || "https://via.placeholder.com/80x60?text=No+Image"}
            alt={title || "Phòng"}
            className="w-32 h-20 object-cover rounded-md border"
          />
          <div>
            <div className="font-semibold">{title || "Phòng"}</div>
            <div>Mã booking: {booking._id}</div>
            <div>Ngày nhận phòng: {booking.checkInDate?.slice(0, 10)}</div>
            <div>Ngày trả phòng: {booking.checkOutDate?.slice(0, 10)}</div>
            <div>Khách: {booking.guests}</div>
            <div>Tổng tiền: {booking.total_price?.toLocaleString()} VND</div>
            <div>Trạng thái: {booking.status}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-2 md:mt-0">
          <Button onClick={() => handleShowDetail(booking)} variant="outline">
            Xem chi tiết
          </Button>
          {showCancel && <Button variant="destructive">Hủy</Button>}
        </div>
      </li>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Quản lý đặt phòng</h2>
      <div className="flex gap-4 mb-6">
        <Button
          variant={tab === "upcoming" ? "default" : "outline"}
          onClick={() => setTab("upcoming")}
        >
          Booking của tôi
        </Button>
        <Button
          variant={tab === "history" ? "default" : "outline"}
          onClick={() => setTab("history")}
        >
          Lịch sử đặt phòng
        </Button>
      </div>
      {loading ? (
        <div className="text-center py-8">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-red-500 py-8">{error}</div>
      ) : (
        <div className="w-full">
          {tab === "upcoming" && (
            <>
              <h3 className="font-semibold mb-2">Sắp nhận phòng</h3>
              <ul>
                {upcomingBookings.length === 0 &&
                  ongoingBookings.length === 0 && (
                    <div className="text-gray-500">
                      Không có phòng sắp nhận hoặc đang ở.
                    </div>
                  )}
                {upcomingBookings.map((b) => renderBooking(b, true))}
                {ongoingBookings.length > 0 && (
                  <h4 className="mt-4 font-semibold">Đang ở</h4>
                )}
                {ongoingBookings.map((b) => renderBooking(b, false))}
              </ul>
            </>
          )}
          {tab === "history" && (
            <>
              <h3 className="font-semibold mb-2">Lịch sử đặt phòng</h3>
              <ul>
                {historyBookings.length === 0 && (
                  <div className="text-gray-500">
                    Chưa có lịch sử đặt phòng.
                  </div>
                )}
                {historyBookings.map((b) => renderBooking(b, false))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Popup chi tiết booking */}
      {showDetail && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setShowDetail(false)}
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-2">Chi tiết booking</h3>
            {/* Thông tin người dùng */}
            {user && (
              <div className="mb-4 p-3 rounded bg-gray-50 border">
                <div>
                  <span className="font-semibold">Họ tên:</span> {user.name}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {user.email}
                </div>
                <div>
                  <span className="font-semibold">Số điện thoại:</span>{" "}
                  {user.phone}
                </div>
              </div>
            )}
            {isListingObj(selectedBooking.listingId) && (
              <img
                src={
                  selectedBooking.listingId.images?.[0] ||
                  "https://via.placeholder.com/320x200?text=No+Image"
                }
                alt={selectedBooking.listingId.title || "Phòng"}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            <div className="mb-2 font-semibold">
              {isListingObj(selectedBooking.listingId)
                ? selectedBooking.listingId.title
                : "Phòng"}
            </div>
            <div>Mã booking: {selectedBooking._id}</div>
            <div>
              Ngày nhận phòng: {selectedBooking.checkInDate?.slice(0, 10)}
            </div>
            <div>
              Ngày trả phòng: {selectedBooking.checkOutDate?.slice(0, 10)}
            </div>
            <div>Khách: {selectedBooking.guests}</div>
            <div>
              Tổng tiền: {selectedBooking.total_price?.toLocaleString()} VND
            </div>
            <div>Trạng thái: {selectedBooking.status}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PastTrip;
