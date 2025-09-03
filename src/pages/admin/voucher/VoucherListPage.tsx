import { useEffect, useState, useMemo } from "react";
import { useVouchers } from "@/hooks/useVouchers";
import VoucherTable from "@/components/admin/voucher/VoucherTable";
import VoucherFormModal from "@/components/admin/voucher/VoucherFormModal";
import VoucherDetailModal from "@/components/admin/voucher/VoucherDetailModal";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { CreateVoucherDto } from "@/types/voucher";
import { PermissionGuard } from "@/components/common/PermissionGuard";

const VoucherListPage = () => {
  const {
    vouchers,
    loading,
    error,
    getVouchers,
    getVoucherDetail,
    addVoucher,
    editVoucher,
    deleteVoucher,
    restore,
    toggleStatus,
    clearError,
    voucherDetail,
    clearDetail,
  } = useVouchers();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showDetailId, setShowDetailId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    getVouchers();
  }, [getVouchers]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Lấy dữ liệu voucher để edit
  useEffect(() => {
    if (editId) getVoucherDetail(editId);
    else clearDetail();
  }, [editId, getVoucherDetail, clearDetail]);

  // Lấy dữ liệu voucher để xem chi tiết
  useEffect(() => {
    if (showDetailId) getVoucherDetail(showDetailId);
    else clearDetail();
  }, [showDetailId, getVoucherDetail, clearDetail]);

  // Filter logic
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchSearch = v.code.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        status === "all"
          ? true
          : status === "active"
          ? v.is_active
          : !v.is_active;
      return matchSearch && matchStatus;
    });
  }, [vouchers, search, status]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalItems = filteredVouchers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 0;
  const paginatedVouchers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVouchers.slice(start, start + itemsPerPage);
  }, [filteredVouchers, currentPage, itemsPerPage]);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const goToPage = (page: number) => {
    if (page < 1 || (totalPages && page > totalPages)) return;
    setCurrentPage(page);
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  // Stats
  const total = vouchers.length;
  const active = vouchers.filter((v) => v.is_active).length;
  const inactive = vouchers.filter((v) => !v.is_active).length;

  const handleFormSubmit = async (data: CreateVoucherDto) => {
    if (editId) {
      const result = await editVoucher(editId, data);
      if (result.meta && result.meta.requestStatus === "fulfilled") {
        setShowForm(false);
        setEditId(null);
      } else if (result.payload) {
        throw { statusCode: 409, message: result.payload };
      }
    } else {
      const result = await addVoucher(data);
      if (result.meta && result.meta.requestStatus === "fulfilled") {
        setShowForm(false);
        setEditId(null);
      } else if (result.payload) {
        throw { statusCode: 409, message: result.payload };
      }
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn xóa voucher này không?"
    );
    if (!confirm) return;
    const result = await deleteVoucher(id);
    if (result.meta && result.meta.requestStatus === "fulfilled") {
      toast.success("Xóa voucher thành công!");
    }
  };

  const handleRestore = async (id: string) => {
    const result = await restore(id);
    if (result.meta && result.meta.requestStatus === "fulfilled") {
      toast.success("Khôi phục voucher thành công!");
    }
  };

  const handleToggleStatus = async (id: string) => {
    const result = await toggleStatus(id);
    if (result.meta && result.meta.requestStatus === "fulfilled") {
      toast.success("Đổi trạng thái voucher thành công!");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản lý Voucher</h2>
        <PermissionGuard permission="voucher.create">
          <Button
            onClick={() => {
              setEditId(null);
              setShowForm(true);
            }}
          >
            Tạo voucher mới
          </Button>
        </PermissionGuard>
      </div>
      {/* Bộ lọc */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-col md:flex-row gap-4 md:gap-7 items-center w-full">
        <span className="font-medium flex items-center gap-2 text-gray-700 w-full md:w-auto mb-2 md:mb-0">
          {/* Heroicon filter */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17v-3.586a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          Bộ lọc
        </span>
        <input
          placeholder="Tìm kiếm theo mã..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-80"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-80"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setStatus("all");
          }}
          className="border rounded px-3 py-2 w-full md:w-80"
        >
          Làm mới
        </button>
      </div>
      {/* Card thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4 w-full">
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-lg font-bold">{total}</div>
          <div className="text-gray-500 text-sm">Tổng số vouchers</div>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-lg font-bold text-green-600">{active}</div>
          <div className="text-gray-500 text-sm">Đang hoạt động</div>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-lg font-bold text-yellow-600">{inactive}</div>
          <div className="text-gray-500 text-sm">Không hoạt động</div>
        </div>
      </div>
      {/* Bảng voucher */}
      <h3 className="font-semibold mb-2">Danh sách vouchers</h3>
      <div className="overflow-x-auto">
        <VoucherTable
          vouchers={paginatedVouchers}
          onEdit={(id) => {
            setEditId(id);
            setShowForm(true);
          }}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onToggleStatus={handleToggleStatus}
          onShowDetail={setShowDetailId}
        />
        {/* Pagination */}
        {totalPages > 0 && totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-200/50 gap-3">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              Hiển thị {startItem} đến {endItem} trong tổng số {totalItems}{" "}
              voucher
              {totalPages > 1 && ` (Trang ${currentPage} / ${totalPages})`}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </Button>

              {Array.from({ length: Math.min(5, totalPages || 0) }, (_, i) => {
                let pageNum: number;
                if ((totalPages || 0) <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= (totalPages || 0) - 2) {
                  pageNum = (totalPages || 0) - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className={`h-8 w-8 p-0 ${
                      currentPage === pageNum
                        ? "bg-gray-800 text-white hover:bg-gray-700 border-gray-800"
                        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
        )}
      </div>
      {showForm && (
        <VoucherFormModal
          initialValues={
            editId && voucherDetail
              ? {
                  ...voucherDetail,
                  expiration_date: voucherDetail.expiration_date
                    ? voucherDetail.expiration_date.slice(0, 10)
                    : "",
                }
              : undefined
          }
          loading={loading}
          isEdit={!!editId}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setEditId(null);
          }}
        />
      )}
      {showDetailId && voucherDetail && (
        <VoucherDetailModal
          voucher={voucherDetail}
          onClose={() => setShowDetailId(null)}
        />
      )}
    </div>
  );
};

export default VoucherListPage;
