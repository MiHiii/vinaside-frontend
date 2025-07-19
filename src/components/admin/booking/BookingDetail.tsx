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
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusVN, getPaymentStatusVN } from "@/helper/status";

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
    <Card className="max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Chi tiết Booking</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={onBack} className="mb-4">
          Quay lại
        </Button>
        {/* Thông tin chung */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <div className="text-xs text-muted-foreground">Mã booking</div>
            <div className="font-semibold">{_id}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Trạng thái</div>
            <Badge className={getStatusVN(status).color}>
              {getStatusVN(status).label}
            </Badge>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              Trạng thái thanh toán
            </div>
            <Badge className={getPaymentStatusVN(payment_status).color}>
              {getPaymentStatusVN(payment_status).label}
            </Badge>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Khách</div>
            <div>
              {typeof guest === "object" && guest !== null
                ? guest.name
                : guest_name}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Email</div>
            <div>
              {typeof guest === "object" && guest !== null
                ? guest.email
                : guest_email}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Sđt</div>
            <div>
              {typeof guest === "object" && guest !== null
                ? guest.phone
                : guest_phone}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Ngày tạo</div>
            <div>{created_at ? new Date(created_at).toLocaleString() : ""}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Ngày cập nhật</div>
            <div>{updated_at ? new Date(updated_at).toLocaleString() : ""}</div>
          </div>
          <div className="md:col-span-3">
            <div className="text-xs text-muted-foreground">
              Yêu cầu đặc biệt
            </div>
            <div
              className={special_requests ? "" : "text-muted-foreground italic"}
            >
              {special_requests ? special_requests : "Không có"}
            </div>
          </div>
        </div>
        {/* Thông tin phòng */}
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-semibold">Property</TableCell>
              <TableCell>
                {typeof property === "object" && property !== null
                  ? property.name || property._id
                  : property}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Listing</TableCell>
              <TableCell>
                {typeof listing === "object" && listing !== null
                  ? listing.title || listing._id
                  : listing}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Ngày check-in</TableCell>
              <TableCell>
                {checkInDate ? new Date(checkInDate).toLocaleDateString() : ""}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Ngày check-out</TableCell>
              <TableCell>
                {check_out_date
                  ? new Date(check_out_date).toLocaleDateString()
                  : ""}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Số khách</TableCell>
              <TableCell>{guests}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Số trẻ em</TableCell>
              <TableCell>{infants}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Số đêm</TableCell>
              <TableCell>{nights}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Giá/đêm</TableCell>
              <TableCell>{price_per_night?.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Tổng giá</TableCell>
              <TableCell>{total_price?.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Phí dịch vụ</TableCell>
              <TableCell>{service_fee?.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Thuế</TableCell>
              <TableCell>{tax_amount?.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Thành tiền</TableCell>
              <TableCell>{final_amount?.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Hoa hồng</TableCell>
              <TableCell>
                {commissionRate ? `${(commissionRate * 100).toFixed(2)}%` : ""}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Tiền trả host</TableCell>
              <TableCell>{finalPayoutAmount?.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
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
