import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
  // Đã loại bỏ các biến selectedProperty, selectedListing, selectedGuest vì không dùng đến

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
      includeDeleted:
        filters?.includeDeleted === "true"
          ? true
          : filters?.includeDeleted === "false"
          ? false
          : undefined,
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Bộ lọc booking</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <Label htmlFor="propertyId">Property ID</Label>
            <Input
              name="propertyId"
              placeholder="Property ID"
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="listingId">Listing ID</Label>
            <Input
              name="listingId"
              placeholder="Listing ID"
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="guestId">Guest ID</Label>
            <Input
              name="guestId"
              placeholder="Guest ID"
              onChange={handleChange}
            />
          </div>
          <div>
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
          <div>
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
          <div>
            <Label htmlFor="checkInFrom">Check-in từ</Label>
            <Input name="checkInFrom" type="date" onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="checkInTo">Check-in đến</Label>
            <Input name="checkInTo" type="date" onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="includeDeleted">Đã xóa</Label>
            <Select
              onValueChange={(v) => handleSelectChange("includeDeleted", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="false">Chưa xóa</SelectItem>
                <SelectItem value="true">Đã xóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="page">Trang</Label>
            <Input name="page" type="number" min="1" onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="limit">Số lượng/trang</Label>
            <Input name="limit" type="number" min="1" onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="sortBy">Sắp xếp theo</Label>
            <Select onValueChange={(v) => handleSelectChange("sortBy", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Mặc định" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Mặc định</SelectItem>
                <SelectItem value="createdAt">Ngày tạo</SelectItem>
                <SelectItem value="checkInDate">Ngày check-in</SelectItem>
                <SelectItem value="check_out_date">Ngày check-out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sortOrder">Thứ tự</Label>
            <Select onValueChange={(v) => handleSelectChange("sortOrder", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Giảm dần" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Giảm dần</SelectItem>
                <SelectItem value="asc">Tăng dần</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4 flex justify-end">
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
