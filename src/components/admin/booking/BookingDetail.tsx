import React, { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  fetchAdminBookingDetail,
  updateAdminBookingStatus,
  deleteAdminBooking,
  restoreBooking,
} from "@/store/slices/bookingSlice";
import { RootState } from "@/store";
import type { BookingDetail } from "@/types/booking.interface";
import { useSelector } from "react-redux";
import { BookingStatus } from "@/types/enum";

const BookingDetail: React.FC<{
  propertyId: string;
  bookingId: string;
  onBack: () => void;
}> = ({ propertyId, bookingId, onBack }) => {
  const dispatch = useAppDispatch();
  const { adminBookingDetail, loading, error } = useSelector(
    (state: RootState) => state.booking
  );
  console.log("BookingDetail props:", { propertyId, bookingId });
  console.log("adminBookingDetail:", adminBookingDetail);
  console.log("loading:", loading, "error:", error);

  const booking = adminBookingDetail as unknown as BookingDetail;

  useEffect(() => {
    if (propertyId && bookingId)
      dispatch(fetchAdminBookingDetail({ propertyId, id: bookingId }));
  }, [dispatch, propertyId, bookingId]);

  if (loading) return <p>Đang tải...</p>;
  if (error)
    return (
      <p style={{ color: "red" }}>
        {typeof error === "string" ? error : JSON.stringify(error)}
      </p>
    );
  if (!adminBookingDetail) return <p>Không tìm thấy booking (null)</p>;

  // Lấy các trường cần hiển thị
  const _id = booking._id;
  const status = booking.status;
  const payment_status = booking.payment_status;
  const property = booking.propertyId;
  const listing = booking.listingId;
  const guest = booking.guestId;
  const checkInDate = booking.checkInDate;
  const check_out_date = booking.check_out_date;
  const guests = booking.guests;
  const infants = booking.infants;
  const nights = booking.nights;
  const price_per_night = booking.price_per_night;
  const total_price = booking.total_price;
  const service_fee = booking.service_fee;
  const tax_amount = booking.tax_amount;
  const final_amount = booking.final_amount;
  const commissionRate = booking.commissionRate;
  const finalPayoutAmount = booking.finalPayoutAmount;
  const guest_name = booking.guest_name;
  const guest_email = booking.guest_email;
  const guest_phone = booking.guest_phone;
  const special_requests = booking.special_requests;
  const created_at = booking.created_at;
  const updated_at = booking.updated_at;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <button onClick={onBack} style={{ marginBottom: 16 }}>
        Quay lại
      </button>
      <h3>Chi tiết Booking</h3>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}
      >
        <tbody>
          <tr>
            <td>
              <b>Mã booking</b>
            </td>
            <td>{_id}</td>
          </tr>
          <tr>
            <td>
              <b>Trạng thái</b>
            </td>
            <td>{status}</td>
          </tr>
          <tr>
            <td>
              <b>Trạng thái thanh toán</b>
            </td>
            <td>{payment_status}</td>
          </tr>
          <tr>
            <td>
              <b>Property</b>
            </td>
            <td>
              {typeof property === "object" && property !== null
                ? property.name || property._id
                : property}
            </td>
          </tr>
          <tr>
            <td>
              <b>Listing</b>
            </td>
            <td>
              {typeof listing === "object" && listing !== null
                ? listing.title || listing._id
                : listing}
            </td>
          </tr>
          <tr>
            <td>
              <b>Khách</b>
            </td>
            <td>
              {typeof guest === "object" && guest !== null
                ? guest.name
                : guest_name}
            </td>
          </tr>
          <tr>
            <td>
              <b>Email</b>
            </td>
            <td>
              {typeof guest === "object" && guest !== null
                ? guest.email
                : guest_email}
            </td>
          </tr>
          <tr>
            <td>
              <b>Sđt</b>
            </td>
            <td>
              {typeof guest === "object" && guest !== null
                ? guest.phone
                : guest_phone}
            </td>
          </tr>

          <tr>
            <td>
              <b>Số khách</b>
            </td>
            <td>{guests}</td>
          </tr>
          <tr>
            <td>
              <b>Số trẻ em</b>
            </td>
            <td>{infants}</td>
          </tr>
          <tr>
            <td>
              <b>Số đêm</b>
            </td>
            <td>{nights}</td>
          </tr>
          <tr>
            <td>
              <b>Ngày check-in</b>
            </td>
            <td>
              {checkInDate ? new Date(checkInDate).toLocaleDateString() : ""}
            </td>
          </tr>
          <tr>
            <td>
              <b>Ngày check-out</b>
            </td>
            <td>
              {check_out_date
                ? new Date(check_out_date).toLocaleDateString()
                : ""}
            </td>
          </tr>
          <tr>
            <td>
              <b>Giá/đêm</b>
            </td>
            <td>{price_per_night?.toLocaleString()}</td>
          </tr>
          <tr>
            <td>
              <b>Tổng giá</b>
            </td>
            <td>{total_price?.toLocaleString()}</td>
          </tr>
          <tr>
            <td>
              <b>Phí dịch vụ</b>
            </td>
            <td>{service_fee?.toLocaleString()}</td>
          </tr>
          <tr>
            <td>
              <b>Thuế</b>
            </td>
            <td>{tax_amount?.toLocaleString()}</td>
          </tr>
          <tr>
            <td>
              <b>Thành tiền</b>
            </td>
            <td>{final_amount?.toLocaleString()}</td>
          </tr>
          <tr>
            <td>
              <b>Hoa hồng</b>
            </td>
            <td>
              {commissionRate ? `${(commissionRate * 100).toFixed(2)}%` : ""}
            </td>
          </tr>
          <tr>
            <td>
              <b>Tiền trả host</b>
            </td>
            <td>{finalPayoutAmount?.toLocaleString()}</td>
          </tr>
          <tr>
            <td>
              <b>Yêu cầu đặc biệt</b>
            </td>
            <td>{special_requests}</td>
          </tr>
          <tr>
            <td>
              <b>Ngày tạo</b>
            </td>
            <td>{created_at ? new Date(created_at).toLocaleString() : ""}</td>
          </tr>
          <tr>
            <td>
              <b>Ngày cập nhật</b>
            </td>
            <td>{updated_at ? new Date(updated_at).toLocaleString() : ""}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ display: "flex", gap: 16 }}>
        <button
          onClick={() =>
            dispatch(
              updateAdminBookingStatus({
                propertyId,
                id: _id,
                data: { status: BookingStatus.CONFIRMED },
              })
            )
          }
        >
          Xác nhận
        </button>
        {!booking?.deleted ? (
          <button
            onClick={() =>
              dispatch(deleteAdminBooking({ propertyId, id: _id }))
            }
          >
            Xóa
          </button>
        ) : (
          <button onClick={() => dispatch(restoreBooking(_id))}>
            Khôi phục
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingDetail;
