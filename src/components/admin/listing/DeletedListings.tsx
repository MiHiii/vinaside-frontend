import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchListings, selectListings, selectListingsLoading, selectListingsError, restoreListing } from "@/store/slices/listingSlice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function DeletedListings() {
  const dispatch = useAppDispatch();
  const listings = useAppSelector(selectListings);
  const loading = useAppSelector(selectListingsLoading);
  const error = useAppSelector(selectListingsError);
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchListings({ isDeleted: true }));
  }, [dispatch]);

  const handleRestore = async (id: string) => {
    const result = await dispatch(restoreListing(id));
    if (restoreListing.fulfilled.match(result)) {
      toast.success("Khôi phục thành công!");
      dispatch(fetchListings({ isDeleted: true }));
      setSelectedIds(ids => ids.filter(i => i !== id));
    } else {
      toast.error(result.payload || "Khôi phục thất bại!");
    }
  };

  const handleRestoreSelected = async () => {
    for (const id of selectedIds) {
      await dispatch(restoreListing(id));
    }
    toast.success("Đã khôi phục các listing đã chọn!");
    setSelectedIds([]);
    dispatch(fetchListings({ isDeleted: true }));
  };

  const allSelected = listings.length > 0 && selectedIds.length === listings.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < listings.length;

  // Map trạng thái sang tiếng Việt và màu nền
  const statusMap: Record<string, { label: string; bg: string }> = {
    active: { label: 'Hoạt động', bg: 'bg-green-100 text-green-700' },
    inactive: { label: 'Không hoạt động', bg: 'bg-gray-200 text-gray-700' },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Danh sách các listing đã xóa</h1>
        <Button variant="outline" onClick={() => navigate("/admin/listings")}>Quay lại danh sách</Button>
      </div>
      {selectedIds.length > 0 && (
        <div className="mb-2">
          <button
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold"
            onClick={handleRestoreSelected}
          >
            Khôi phục đã chọn ({selectedIds.length})
          </button>
        </div>
      )}
      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="overflow-x-auto rounded-lg shadow border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={e => {
                    if (e.target.checked) setSelectedIds(listings.map(l => l._id));
                    else setSelectedIds([]);
                  }}
                />
              </TableHead>
              <TableHead>Ảnh</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Giá/đêm</TableHead>
              <TableHead>Khách tối đa</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày xóa</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map(listing => {
              const statusObj = statusMap[listing.status] || { label: listing.status, bg: 'bg-gray-100 text-gray-700' };
              return (
                <TableRow key={listing._id} className="hover:bg-gray-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(listing._id)}
                      onChange={e => {
                        if (e.target.checked) setSelectedIds(ids => [...ids, listing._id]);
                        else setSelectedIds(ids => ids.filter(id => id !== listing._id));
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {listing.images && listing.images.length > 0 ? (
                      <img src={listing.images[0]} alt="thumb" className="w-16 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 flex items-center justify-center rounded text-xs text-gray-500">No Image</div>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">{listing.title}</TableCell>
                  <TableCell>{listing.price_per_night?.toLocaleString()} VND</TableCell>
                  <TableCell>{listing.max_guests}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusObj.bg}`}>{statusObj.label}</span>
                  </TableCell>
                  <TableCell>{listing.deletedAt ? new Date(listing.deletedAt).toLocaleString() : "-"}</TableCell>
                  <TableCell>
                    <button
                      className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors border border-green-300"
                      onClick={() => handleRestore(listing._id)}
                    >
                      Khôi phục
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 