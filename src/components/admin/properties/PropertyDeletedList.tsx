import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchProperties, selectProperties, selectPropertiesLoading, selectPropertiesError, restoreProperty } from "@/store/slices/propertySlice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function PropertyDeletedList() {
  const dispatch = useAppDispatch();
  const properties = useAppSelector(selectProperties);
  const loading = useAppSelector(selectPropertiesLoading);
  const error = useAppSelector(selectPropertiesError);
  const total = useAppSelector(state => state.properties.total);
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    dispatch(fetchProperties({ isDeleted: true, page, limit }));
  }, [dispatch, page]);

  const handleRestore = async (id: string) => {
    const result = await dispatch(restoreProperty(id));
    if (restoreProperty.fulfilled.match(result)) {
      toast.success("Khôi phục thành công!");
      dispatch(fetchProperties({ isDeleted: true, page, limit }));
      setSelectedIds(ids => ids.filter(i => i !== id));
    } else {
      toast.error(result.payload || "Khôi phục thất bại!");
    }
  };

  const handleRestoreSelected = async () => {
    for (const id of selectedIds) {
      await dispatch(restoreProperty(id));
    }
    toast.success("Đã khôi phục các property đã chọn!");
    setSelectedIds([]);
    dispatch(fetchProperties({ isDeleted: true, page, limit }));
  };

  const allSelected = properties.length > 0 && selectedIds.length === properties.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < properties.length;

  // Map trạng thái sang tiếng Việt và màu nền
  const statusMap: Record<string, { label: string; bg: string }> = {
    active: { label: 'Hoạt động', bg: 'bg-green-100 text-green-700' },
    inactive: { label: 'Không hoạt động', bg: 'bg-gray-200 text-gray-700' },
    pending: { label: 'Chờ duyệt', bg: 'bg-yellow-100 text-yellow-700' },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Danh sách các property đã xóa</h1>
        <Button variant="outline" onClick={() => navigate("/admin/properties")}>Quay lại danh sách</Button>
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
                    if (e.target.checked) setSelectedIds(properties.map(p => p.id));
                    else setSelectedIds([]);
                  }}
                />
              </TableHead>
              <TableHead>Ảnh</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày xóa</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map(property => {
              const statusObj = statusMap[property.status] || { label: property.status, bg: 'bg-gray-100 text-gray-700' };
              return (
                <TableRow key={property.id} className="hover:bg-gray-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(property.id)}
                      onChange={e => {
                        if (e.target.checked) setSelectedIds(ids => [...ids, property.id]);
                        else setSelectedIds(ids => ids.filter(id => id !== property.id));
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {property.images && property.images.length > 0 ? (
                      <img src={property.images[0]} alt="thumb" className="w-16 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 flex items-center justify-center rounded text-xs text-gray-500">No Image</div>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">{property.name}</TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell>{property.location?.address || "-"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusObj.bg}`}>{statusObj.label}</span>
                  </TableCell>
                  <TableCell>{property.deletedAt ? new Date(property.deletedAt).toLocaleString() : "-"}</TableCell>
                  <TableCell>
                    <button
                      className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors border border-green-300"
                      onClick={() => handleRestore(property.id)}
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
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 mt-4">
          <button
            className="p-2 rounded border disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            &larr;
          </button>
          <span>Trang {page} / {totalPages}</span>
          <button
            className="p-2 rounded border disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            &rarr;
          </button>
        </div>
      )}
    </div>
  );
} 