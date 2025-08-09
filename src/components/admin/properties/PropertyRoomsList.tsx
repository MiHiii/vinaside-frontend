import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Eye, Edit, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { Input } from "@/components/ui/input";

interface PropertyRoomsListProps {
  listings: any[];
  roomStatus: Record<string, string>;
  propertyId?: string;
}

export default function PropertyRoomsList({
  listings,
  roomStatus,
  propertyId,
}: PropertyRoomsListProps) {
  const getBookingStatus = (
    l: any
  ): "available" | "reserved" | "booked" | "occupied" | "unknown" => {
    // Prefer direct status from room-status API
    if (
      l?.status === "available" ||
      l?.status === "reserved" ||
      l?.status === "booked" ||
      l?.status === "occupied"
    ) {
      return l.status;
    }
    // Fallback to map if provided
    const listingId = String(l._id);
    const raw = roomStatus && (roomStatus as any)[listingId];
    const derived =
      raw && typeof raw === "object"
        ? (raw as { status?: string }).status
        : raw;
    if (
      derived === "available" ||
      derived === "reserved" ||
      derived === "booked" ||
      derived === "occupied"
    ) {
      return derived as any;
    }
    return "unknown";
  };

  const renderListingStatusBadge = (l: any) => {
    const ls: string = l.listingStatus || l.status || "active";
    if (ls === "active")
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Hoạt động
        </span>
      );
    if (ls === "inactive")
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Bảo trì
        </span>
      );
    if (ls === "draft")
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
          Nháp
        </span>
      );
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
        Không rõ
      </span>
    );
  };

  const renderBookingStatusBadge = (l: any) => {
    const s = getBookingStatus(l);
    if (s === "available")
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Còn trống
        </span>
      );
    if (s === "reserved")
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
          Giữ chỗ
        </span>
      );
    if (s === "booked")
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
          Đã đặt
        </span>
      );
    if (s === "occupied")
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
          Đang ở
        </span>
      );
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
        Không rõ
      </span>
    );
  };
  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));

  // Filters and pagination state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filter by propertyId first
  const baseListings = useMemo(
    () =>
      listings.filter(
        (l) =>
          l.propertyId === propertyId ||
          (typeof l.propertyId === "object" && l.propertyId?._id === propertyId)
      ),
    [listings, propertyId]
  );

  // Apply search and status filters
  const filteredListings = useMemo(() => {
    let result = baseListings;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((l: any) =>
        String(l.title || "")
          .toLowerCase()
          .includes(q)
      );
    }
    if (status) {
      const isListingStatus = ["active", "inactive", "draft"].includes(status);
      if (isListingStatus) {
        result = result.filter(
          (l: any) => String(l.listingStatus || l.status) === status
        );
      } else if (status === "booked") {
        // booked filter includes both booked and occupied
        result = result.filter((l: any) => {
          const s = getBookingStatus(l);
          return s === "booked" || s === "occupied";
        });
      } else {
        result = result.filter((l: any) => getBookingStatus(l) === status);
      }
    }
    return result;
  }, [baseListings, search, status]);

  // Pagination
  const total = filteredListings.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredListings.slice(start, start + limit);
  }, [filteredListings, currentPage, limit]);

  return (
    <Card className="bg-white border-0 !border-none w-full overflow-x-auto">
      <CardHeader className="border-0 !border-none">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            Danh sách phòng ({total} phòng)
          </CardTitle>
          <PermissionGuard permission="listing.create">
            <Link to="/admin/listings/create">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" /> Thêm Phòng
              </Button>
            </Link>
          </PermissionGuard>
        </div>
        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Tìm theo tiêu đề..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full"
            />
          </div>
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Sửa chữa-Bảo trì</option>
            </select>
          </div>
          <div>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="w-full h-10 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>
          <div className="flex items-center justify-end text-sm text-gray-600">
            Trang {currentPage} / {totalPages}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-auto bg-white rounded-xl border-0 !border-none">
            <thead className="bg-gray-100">
              <tr className="border-0 !border-none">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Ảnh
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Tiêu đề
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Giá/đêm
                </th>
                <th className="py-3 px-4 text-center font-semibold text-gray-700 border-0 !border-none">
                  Phí cuối tuần
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  HomeStay
                </th>
                <th className="py-3 px-4 text-center font-semibold text-gray-700 border-0 !border-none">
                  Trạng thái
                </th>
                <th className="py-3 px-4 text-center font-semibold text-gray-700 border-0 !border-none">
                  Đặt phòng
                </th>
                <th className="py-3 px-4 text-right font-semibold text-gray-700 border-0 !border-none">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedListings.map((listing) => (
                <tr
                  key={listing._id}
                  className="hover:bg-gray-50 transition border-0 !border-none"
                >
                  <td className="py-3 px-4 border-0 !border-none">
                    <Link
                      to={`/admin/listings/${listing._id}`}
                      className="block"
                    >
                      <img
                        src={listing.images?.[0] || "/placeholder.svg"}
                        alt={listing.title}
                        className="w-16 h-12 object-cover rounded hover:opacity-80 transition"
                      />
                    </Link>
                  </td>
                  <td className="py-3 px-4 border-0 !border-none font-semibold">
                    <Link
                      to={`/admin/listings/${listing._id}`}
                      className="hover:underline text-primary"
                    >
                      {listing.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 border-0 !border-none">
                    {listing.price_per_night?.toLocaleString("vi-VN")}₫
                  </td>
                  <td className="py-3 px-4 border-0 !border-none text-center">
                    {listing.has_weekend_surcharge ? (
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                          +{listing.weekend_surcharge_percent || 0}%
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Weekend
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 border-0 !border-none">
                    <div
                      className="max-w-xs truncate text-gray-600 text-sm"
                      title={
                        typeof listing.propertyId === "object" &&
                        listing.propertyId !== null
                          ? listing.propertyId.name
                          : listing.propertyId || ""
                      }
                    >
                      {typeof listing.propertyId === "object" &&
                      listing.propertyId !== null ? (
                        <span className="text-green-700 font-medium">
                          {listing.propertyId.name}
                        </span>
                      ) : (
                        listing.propertyId || ""
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 border-0 !border-none text-center">
                    {renderListingStatusBadge(listing)}
                  </td>
                  <td className="py-3 px-4 border-0 !border-none text-center">
                    {renderBookingStatusBadge(listing)}
                  </td>
                  <td className="py-3 px-4 border-0 !border-none text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/listings/${listing._id}`}
                        title="Xem chi tiết"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-blue-50 hover:text-blue-600 rounded-lg h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link
                        to={`/admin/listings/edit/${listing._id}`}
                        title="Chỉnh sửa"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-green-50 hover:text-green-600 rounded-lg h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <div className="text-sm text-gray-700">
              Trang {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
