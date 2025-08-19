import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Input } from "./input";
import { Button } from "./button";
import { Card } from "./card";
import { Search, Filter } from "lucide-react";

interface CalendarFilterProps {
  filters: {
    viewType: "month" | "week" | "day" | "today";
    propertyId: string;
    listingId: string;
    status: string;
    paymentStatus: string;
    keyword: string;
    searchType?: "keyword" | "guestName" | "listingTitle" | "propertyName";
  };
  onFiltersChange: (filters: any) => void;
  properties?: Array<{ _id: string; name: string }>;
  listings?: Array<{ _id: string; title: string }>;
}

export const CalendarFilter: React.FC<CalendarFilterProps> = ({
  filters,
  onFiltersChange,
  properties = [],
  listings = [],
}) => {
  const handleFilterChange = (key: string, value: string) => {
    // Convert 'all' to undefined for API compatibility
    const actualValue = value === "all" ? undefined : value;
    onFiltersChange({
      ...filters,
      [key]: actualValue,
    });
  };

  // Local keyword state to apply only when pressing the Search button
  const [pendingKeyword, setPendingKeyword] = React.useState(
    filters.keyword || ""
  );
  React.useEffect(() => {
    setPendingKeyword(filters.keyword || "");
  }, [filters.keyword]);

  return (
    <Card className="mb-6 bg-white border border-gray-200 shadow-sm">
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Bộ lọc</h3>
        </div>

        <div className="flex flex-wrap gap-6 items-center">
          {/* View Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chế độ xem
            </label>
            <Select
              value={filters.viewType}
              onValueChange={(value) => handleFilterChange("viewType", value)}
            >
              <SelectTrigger className="border-gray-300 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-w-2xl bg-white border border-gray-300 rounded-md">
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="week">Tuần</SelectItem>
                <SelectItem value="month">Tháng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Homestay
            </label>
            <Select
              value={filters.propertyId || "all"}
              onValueChange={(value) => handleFilterChange("propertyId", value)}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Tất cả properties" />
              </SelectTrigger>
              <SelectContent className="max-w-2xl bg-white border border-gray-300 rounded-md">
                <SelectItem value="all">Tất cả homestay</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property._id} value={property._id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent className="max-w-2xl bg-white border border-gray-300 rounded-md">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái thanh toán
            </label>
            <Select
              value={filters.paymentStatus || "all"}
              onValueChange={(value) =>
                handleFilterChange("paymentStatus", value)
              }
            >
              <SelectTrigger className="border-gray-300 w-40">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent className="max-w-2xl bg-white border border-gray-300 rounded-md">
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                <SelectItem value="partially_paid">
                  Thanh toán một phần
                </SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="refunding">Đang hoàn tiền</SelectItem>
                <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                <SelectItem value="failed">Thanh toán thất bại</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ khóa
            </label>
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm theo tên khách, phòng, homestay"
                value={pendingKeyword}
                onChange={(e) => setPendingKeyword(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>
          <div className="mt-7 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  keyword: pendingKeyword,
                })
              }
              className="border-gray-300 hover:bg-gray-100"
            >
              Tìm kiếm
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                onFiltersChange({
                  viewType: "monthly",
                  propertyId: "all",
                  listingId: "all",
                  status: "all",
                  paymentStatus: "all",
                  keyword: "",
                  searchType: "keyword",
                })
              }
              className="border-gray-300 hover:bg-gray-100"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
