import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchProperties,
  selectProperties,
} from "@/store/slices/propertySlice";
import { fetchListings, selectListings } from "@/store/slices/listingSlice";
import { fetchUsers, selectUsers } from "@/store/slices/userSlice";

interface BookingFilterProps {
  onFilterChange: (filters: {
    propertyId?: string;
    listingId?: string;
    guestId?: string;
    status?: string;
    paymentStatus?: string;
    checkInFrom?: string;
    checkInTo?: string;
    includeDeleted?: boolean;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => void;
}

const BookingFilter: React.FC<BookingFilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);
  const dispatch = useAppDispatch();
  const properties = useAppSelector(selectProperties);
  const listings = useAppSelector(selectListings) as {
    id?: string;
    _id?: string;
    name?: string;
    title?: string;
  }[];
  const guests = useAppSelector(selectUsers) as {
    id?: string;
    _id?: string;
    name?: string;
  }[];

  useEffect(() => {
    dispatch(fetchProperties({}));
    dispatch(fetchListings({}));
    dispatch(fetchUsers({})); // Nếu fetchUsers cần tham số, truyền object rỗng
  }, [dispatch]);

  const handleSelectChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Loại bỏ các trường filter có giá trị "all" hoặc "default"
    const cleanFilters = { ...filters };
    ["status", "paymentStatus", "includeDeleted", "sortBy"].forEach((key) => {
      if (cleanFilters[key] === "all" || cleanFilters[key] === "default") {
        delete cleanFilters[key];
      }
    });
    onFilterChange({
      ...cleanFilters,
      propertyId: filters.propertyId,
      listingId: filters.listingId,
      guestId: filters.guestId,
      paymentStatus: filters.paymentStatus
        ? filters.paymentStatus.toLowerCase()
        : undefined,
      includeDeleted:
        filters?.includeDeleted === "true"
          ? true
          : filters?.includeDeleted === "false"
          ? false
          : undefined,
    });
  };

  return (
    <Card className="mb-4 mt-10">
      <CardHeader>
        <CardTitle>Bộ lọc booking</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hàng 1: 5 input nhỏ */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="propertyId">Tài sản</Label>
              <Select
                onValueChange={(id) => handleSelectChange("propertyId", id)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tài sản" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="listingId">Listing</Label>
              <Select
                onValueChange={(id) => handleSelectChange("listingId", id)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn listing" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(listings) &&
                    listings.map((listing) => (
                      <SelectItem
                        key={String(listing.id || listing._id)}
                        value={String(listing.id || listing._id)}
                      >
                        {listing.name || listing.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="guestId">Khách</Label>
              <Select onValueChange={(id) => handleSelectChange("guestId", id)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khách" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(guests) &&
                    guests.map((guest) => (
                      <SelectItem
                        key={String(guest.id || guest._id)}
                        value={String(guest.id || guest._id)}
                      >
                        {guest.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select onValueChange={(v) => handleSelectChange("status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="paymentStatus">Trạng thái thanh toán</Label>
              <Select
                onValueChange={(v) => handleSelectChange("paymentStatus", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ thanh toán</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                  <SelectItem value="failed">Thanh toán thất bại</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Hàng 2: 2 input ngày */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="checkInFrom">Check-in từ</Label>
              <Popover open={openFrom} onOpenChange={setOpenFrom}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.checkInFrom ? (
                      format(new Date(filters.checkInFrom), "dd/MM/yyyy")
                    ) : (
                      <span className="text-gray-400">Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      filters.checkInFrom
                        ? new Date(filters.checkInFrom)
                        : undefined
                    }
                    onSelect={(date) => {
                      setOpenFrom(false);
                      setFilters((prev) => ({
                        ...prev,
                        checkInFrom: date ? format(date, "yyyy-MM-dd") : "",
                      }));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="checkInTo">Check-in đến</Label>
              <Popover open={openTo} onOpenChange={setOpenTo}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.checkInTo ? (
                      format(new Date(filters.checkInTo), "dd/MM/yyyy")
                    ) : (
                      <span className="text-gray-400">Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      filters.checkInTo
                        ? new Date(filters.checkInTo)
                        : undefined
                    }
                    onSelect={(date) => {
                      setOpenTo(false);
                      setFilters((prev) => ({
                        ...prev,
                        checkInTo: date ? format(date, "yyyy-MM-dd") : "",
                      }));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="w-full md:w-auto">
              Lọc
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingFilter;
