import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  fetchAdminBookings,
  updateAdminBookingStatus,
  deleteAdminBooking,
  restoreBooking,
} from "@/store/slices/bookingSlice";
import { RootState } from "@/store";
import BookingFilter from "./BookingFilter";
import type { Booking } from "@/types/booking.interface";
import { Link } from "react-router-dom";
import { BookingStatus } from "@/types/enum";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type BookingWithDeleted = Booking & {
  isDeleted?: boolean;
  deleted?: boolean;
  payment_status?: string;
  paymentStatus?: string;
};

type PropertyRef = { _id: string; name?: string } | string;

type BookingListProps = {
  onSelectBooking?: (
    booking: { propertyId: string; id: string } | null
  ) => void;
};

const BookingList: React.FC<BookingListProps> = ({ onSelectBooking }) => {
  const dispatch = useAppDispatch();
  const { adminBookings, loading, error, pagination } = useSelector(
    (state: RootState) =>
      state.booking as {
        adminBookings: BookingWithDeleted[];
        loading: boolean;
        error: unknown;
        pagination?: { limit: number };
      }
  );
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAdminBookings({ ...filters, page }));
  }, [dispatch, filters, page]);

  const handleDelete = async (id: string, propertyId: string) => {
    await dispatch(deleteAdminBooking({ id, propertyId }));
    dispatch(fetchAdminBookings({ ...filters, page }));
  };

  const handleRestore = async (id: string) => {
    await dispatch(restoreBooking(id));
    dispatch(fetchAdminBookings({ ...filters, page }));
  };

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters);
    setPage(1);
  };

  if (loading) return <p>Đang tải...</p>;
  if (error)
    return (
      <p className="text-red-500">
        {typeof error === "string" ? error : JSON.stringify(error)}
      </p>
    );

  return (
    <div>
      <BookingFilter onFilterChange={handleFilterChange} />
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted sticky top-0 z-10">
              <TableHead>Mã</TableHead>
              <TableHead>Tên khách</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(adminBookings) && adminBookings.length > 0 ? (
              adminBookings.map((b: BookingWithDeleted) => {
                const propertyIdObj = b.propertyId as PropertyRef;
                const propertyId =
                  typeof propertyIdObj === "object" && propertyIdObj !== null
                    ? propertyIdObj._id
                    : propertyIdObj;
                const propertyName =
                  typeof propertyIdObj === "object" && propertyIdObj !== null
                    ? propertyIdObj.name
                    : propertyIdObj;
                return (
                  <TableRow
                    key={b._id}
                    className={b.isDeleted ? "opacity-50" : ""}
                  >
                    <TableCell>{b._id}</TableCell>
                    <TableCell>
                      {typeof b.guest_name === "string" ? b.guest_name : ""}
                    </TableCell>
                    <TableCell>{propertyName}</TableCell>
                    <TableCell>
                      {b.checkInDate ? b.checkInDate.slice(0, 10) : ""}
                    </TableCell>
                    <TableCell>
                      {b.checkOutDate ? b.checkOutDate.slice(0, 10) : ""}
                    </TableCell>
                    <TableCell>{b.status}</TableCell>
                    <TableCell>
                      {b.payment_status || b.paymentStatus || ""}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button asChild size="sm" variant="outline">
                        <Link
                          to="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (onSelectBooking) {
                              onSelectBooking({ propertyId, id: b._id });
                            }
                          }}
                        >
                          Chi tiết
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          dispatch(
                            updateAdminBookingStatus({
                              propertyId: propertyId,
                              id: b._id,
                              data: { status: BookingStatus.CONFIRMED },
                            })
                          )
                        }
                      >
                        Xác nhận
                      </Button>
                      {filters.includeDeleted === "true" ? (
                        b.isDeleted && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleRestore(b._id)}
                          >
                            Khôi phục
                          </Button>
                        )
                      ) : filters.includeDeleted === "false" ? (
                        !b.isDeleted && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(b._id, propertyId)}
                          >
                            Xóa
                          </Button>
                        )
                      ) : (
                        <>
                          {!b.isDeleted && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(b._id, propertyId)}
                            >
                              Xóa
                            </Button>
                          )}
                          {b.isDeleted && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleRestore(b._id)}
                            >
                              Khôi phục
                            </Button>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Không có booking
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center items-center gap-4 mt-4">
        <Button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          variant="outline"
        >
          Trang trước
        </Button>
        <span className="font-medium">Trang {page}</span>
        <Button
          disabled={
            adminBookings.length < ((pagination && pagination.limit) || 10)
          }
          onClick={() => setPage(page + 1)}
          variant="outline"
        >
          Trang sau
        </Button>
      </div>
    </div>
  );
};

export default BookingList;
