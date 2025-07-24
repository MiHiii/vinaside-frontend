import React, { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  fetchAdminBookingDetail,
  updateAdminBookingStatus,
} from "@/store/slices/bookingSlice";
import { RootState } from "@/store";
import type { BookingDetail } from "@/types/booking.interface";
import { useSelector } from "react-redux";
import { BookingStatus } from "@/types/enum";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusVN, getPaymentStatusVN } from "@/helper/status";
import { User, Home, Calendar, CreditCard, FileText } from "lucide-react";

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
  const listing = booking.listingId;
  const guest = booking.guestId;
  const checkInDate = booking.checkInDate;
  const check_out_date = booking.check_out_date;
  const guests = booking.guests;
  const nights = booking.nights;
  const final_amount = booking.final_amount;
  const guest_name = booking.guest_name;
  const guest_email = booking.guest_email;
  const guest_phone = booking.guest_phone;
  const created_at = booking.created_at;
  const updated_at = booking.updated_at;
  const deposit_paid_amount = booking.deposit_paid_amount;
  const deposit_percent = booking.deposit_percent;
  const property = booking.propertyId;

  const paymentId = booking.payment_id || "";
  // Fix: safely handle vnpay_pay_date for Date conversion
  let paymentDate = "Chưa có";
  if (
    booking.vnpay_pay_date &&
    (typeof booking.vnpay_pay_date === "string" ||
      typeof booking.vnpay_pay_date === "number")
  ) {
    paymentDate = new Date(booking.vnpay_pay_date).toLocaleString();
  }

  // Type guard helpers
  function getGuestAvatar(guest: unknown): string | undefined {
    if (
      guest &&
      typeof guest === "object" &&
      "avatar" in guest &&
      typeof (guest as { avatar?: string }).avatar === "string"
    ) {
      return (guest as { avatar?: string }).avatar;
    }
    return undefined;
  }
  function getListingImage(listing: unknown): string | undefined {
    if (
      listing &&
      typeof listing === "object" &&
      "images" in listing &&
      Array.isArray((listing as { images?: string[] }).images)
    ) {
      return (listing as { images?: string[] }).images?.[0];
    }
    return undefined;
  }

  // Add type guard for listing
  function hasListingFields(
    obj: unknown
  ): obj is { _id?: string; title?: string; address?: string } {
    return !!obj && typeof obj === "object";
  }
  // Add type guard for propertyObj
  function hasPropertyName(obj: unknown): obj is { name?: string } {
    return !!obj && typeof obj === "object" && "name" in obj;
  }
  function hasPropertyLocation(obj: unknown): obj is {
    location?: {
      address?: string;
      ward?: string;
      district?: string;
      city?: string;
    };
  } {
    return !!obj && typeof obj === "object" && "location" in obj;
  }

  // Parse propertyId nếu là string JSON
  let propertyObj: unknown = property;
  if (property && typeof property === "string") {
    try {
      // Loại bỏ new ObjectId(...) nếu có, chỉ lấy phần JSON
      const cleaned = property
        .replace(/ObjectId\('([a-fA-F0-9]+)'\)/g, '"$1"')
        .replace(/\n/g, "")
        .replace(/\s+/g, " ");
      propertyObj = JSON.parse(cleaned);
    } catch {
      propertyObj = null;
    }
  }

  return (
    <Card className="my-8 bg-white shadow-lg border rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="text-blue-500" /> Chi tiết Booking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={onBack} className="mb-4">
          Quay lại
        </Button>
        {/* 1. Thông tin đặt chỗ */}
        <section className="mb-6 p-4 bg-white rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="text-blue-500" />
            <span className="font-bold text-base">Thông tin đặt chỗ</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div className="text-muted-foreground">Booking ID</div>
            <div className="px-4 py-2 font-mono">{_id}</div>
            <div className="text-muted-foreground">Trạng thái</div>
            <div className="px-4 py-2">
              <Badge className={getStatusVN(status).color}>
                {getStatusVN(status).label}
              </Badge>
            </div>
            <div className="text-muted-foreground">Ngày đặt</div>
            <div className="px-4 py-2">
              {created_at ? new Date(created_at).toLocaleString() : ""}
            </div>
            <div className="text-muted-foreground">Cập nhật</div>
            <div className="px-4 py-2">
              {updated_at ? new Date(updated_at).toLocaleString() : ""}
            </div>
          </div>
        </section>
        {/* 2. Thông tin người dùng */}
        <section className="mb-6 p-4 bg-white rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <User className="text-green-500" />
            <span className="font-bold text-base">Thông tin người dùng</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div className="text-muted-foreground">Avatar</div>
            <div className="px-4 py-2">
              {getGuestAvatar(guest) ? (
                <img
                  src={getGuestAvatar(guest)}
                  alt="avatar"
                  className="w-14 h-14 rounded-full object-cover border"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                  ?
                </div>
              )}
            </div>
            <div className="text-muted-foreground">User ID</div>
            <div className="px-4 py-2">
              {typeof booking.guestId === "string"
                ? booking.guestId
                : "Chưa có"}
            </div>
            <div className="text-muted-foreground">Họ tên</div>
            <div className="px-4 py-2">
              {typeof guest === "object" && guest !== null
                ? guest.name
                : guest_name}
            </div>
            <div className="text-muted-foreground">Email</div>
            <div className="px-4 py-2">
              {typeof guest === "object" && guest !== null
                ? guest.email
                : guest_email}
            </div>
            <div className="text-muted-foreground">SĐT</div>
            <div className="px-4 py-2">
              {typeof guest === "object" && guest !== null
                ? guest.phone
                : guest_phone}
            </div>
          </div>
        </section>
        {/* 3. Thông tin chỗ ở */}
        <section className="mb-6 p-4 bg-white rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Home className="text-orange-500" />
            <span className="font-bold text-base">Thông tin chỗ ở</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div className="text-muted-foreground">Hình ảnh phòng</div>
            <div>
              {getListingImage(listing) ? (
                <img
                  src={getListingImage(listing)}
                  alt="room"
                  className="w-32 h-24 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-32 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            <div className="text-muted-foreground">Room ID</div>
            <div>
              {hasListingFields(listing) && listing._id
                ? listing._id
                : "Chưa có"}
            </div>
            <div className="text-muted-foreground">Tên chỗ ở</div>
            <div>
              {hasListingFields(listing) && listing.title
                ? listing.title
                : "Chưa có"}
            </div>
            <div className="text-muted-foreground">Địa chỉ</div>
            <div>
              {hasListingFields(listing) && listing.address
                ? listing.address
                : "Chưa có"}
            </div>
            <div className="text-muted-foreground">Tên property</div>
            <div>
              {hasPropertyName(propertyObj) && propertyObj.name
                ? propertyObj.name
                : "Chưa có"}
            </div>
            <div className="text-muted-foreground">Địa chỉ property</div>
            <div>
              {hasPropertyLocation(propertyObj) && propertyObj.location
                ? [
                    propertyObj.location.address,
                    propertyObj.location.ward,
                    propertyObj.location.district,
                    propertyObj.location.city,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : "Chưa có"}
            </div>
          </div>
        </section>
        {/* 4. Thông tin lưu trú */}
        <section className="mb-6 p-4 bg-white rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="text-purple-500" />
            <span className="font-bold text-base">Thông tin lưu trú</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div className="text-muted-foreground">Check-in</div>
            <div className="px-4 py-2">
              {checkInDate ? new Date(checkInDate).toLocaleDateString() : ""}
            </div>
            <div className="text-muted-foreground">Check-out</div>
            <div className="px-4 py-2">
              {check_out_date
                ? new Date(check_out_date).toLocaleDateString()
                : ""}
            </div>
            <div className="text-muted-foreground">Số đêm</div>
            <div className="px-4 py-2">{nights}</div>
            <div className="text-muted-foreground">Số khách</div>
            <div className="px-4 py-2">{guests}</div>
          </div>
        </section>
        {/* 5. Thông tin thanh toán */}
        <section className="mb-6 p-4 bg-white rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="text-pink-500" />
            <span className="font-bold text-base">Thông tin thanh toán</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div className="text-muted-foreground">Payment ID</div>
            <div className="px-4 py-2">
              {typeof paymentId === "string" && paymentId
                ? paymentId
                : "Chưa có"}
            </div>
            <div className="text-muted-foreground">Trạng thái</div>
            <div className="px-4 py-2">
              <Badge className={getPaymentStatusVN(payment_status).color}>
                {getPaymentStatusVN(payment_status).label}
              </Badge>
            </div>
            <div className="text-muted-foreground">Phương thức</div>
            <div className="px-4 py-2">
              {typeof booking.payment_method === "string" &&
              booking.payment_method
                ? booking.payment_method
                : "(Chưa có)"}
            </div>
            <div className="text-muted-foreground">Tổng tiền</div>
            <div className="px-4 py-2">
              {typeof final_amount === "number"
                ? final_amount.toLocaleString()
                : "Chưa có"}
            </div>
            {typeof deposit_paid_amount === "number" &&
              deposit_paid_amount > 0 && (
                <div className="text-muted-foreground">Đã trả trước</div>
              )}
            <div className="px-4 py-2">
              {typeof deposit_paid_amount === "number" &&
                deposit_paid_amount > 0 && (
                  <div className="px-4 py-2">
                    {deposit_paid_amount.toLocaleString()}₫
                  </div>
                )}
            </div>
            {typeof deposit_paid_amount === "number" &&
              deposit_paid_amount === 0 &&
              typeof deposit_percent === "number" && (
                <div className="text-muted-foreground">Đã trả trước</div>
              )}
            <div className="px-4 py-2">
              {typeof deposit_paid_amount === "number" &&
                deposit_paid_amount === 0 &&
                typeof deposit_percent === "number" && (
                  <div className="px-4 py-2">
                    {Math.round(deposit_percent * 100)}%
                  </div>
                )}
            </div>
            <div className="text-muted-foreground">Hoàn tiền</div>
            <div className="px-4 py-2">(Chưa có)</div>
            <div className="text-muted-foreground">Ngày thanh toán</div>
            <div className="px-4 py-2">
              {typeof paymentDate === "string" ? paymentDate : "Chưa có"}
            </div>
          </div>
        </section>
        {/* 6. Nút thao tác */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="secondary"
            title="Xác nhận"
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
            ✅ Xác nhận
          </Button>
          <Button variant="destructive" title="Hủy đặt chỗ">
            ❌ Hủy
          </Button>
          <Button variant="outline" title="Hoàn tiền">
            💵 Hoàn tiền
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex gap-4">
        <Button
          variant="secondary"
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
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingDetail;
