import { useEffect, useState, useMemo } from "react";
import { useSafetyFeatures } from "@/hooks/useSafetyFeatures";
import SafetyFeatureTable from "@/components/admin/safety-feature/SafetyFeatureTable";
import SafetyFeatureFormModal from "@/components/admin/safety-feature/SafetyFeatureFormModal";
import SafetyFeatureDetailModal from "@/components/admin/safety-feature/SafetyFeatureDetailModal";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { CreateSafetyFeatureDto } from "@/types/safety-feature";
import { PermissionGuard } from "@/components/common/PermissionGuard";

const SafetyFeatureListPage = () => {
  const {
    safetyFeatures,
    loading,
    error,
    getSafetyFeatures,
    getSafetyFeatureDetail,
    addSafetyFeature,
    editSafetyFeature,
    deleteSafetyFeature,
    restore,
    toggleStatus,
    toggleDefault,
    clearError,
    safetyFeatureDetail,
    clearDetail,
  } = useSafetyFeatures();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showDetailId, setShowDetailId] = useState<string | null>(null);

  useEffect(() => {
    getSafetyFeatures();
  }, [getSafetyFeatures]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    if (editId) getSafetyFeatureDetail(editId);
    else clearDetail();
  }, [editId, getSafetyFeatureDetail, clearDetail]);

  useEffect(() => {
    if (showDetailId) getSafetyFeatureDetail(showDetailId);
    else clearDetail();
  }, [showDetailId, getSafetyFeatureDetail, clearDetail]);

  const filteredFeatures = useMemo(() => {
    return (safetyFeatures ?? []).filter(f => {
      const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        status === "all" ? true : status === "active" ? f.is_active : !f.is_active;
      return matchSearch && matchStatus;
    });
  }, [safetyFeatures, search, status]);

  const total = safetyFeatures.length;
  const active = safetyFeatures.filter(f => f.is_active).length;
  const inactive = safetyFeatures.filter(f => !f.is_active).length;

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Bạn có chắc chắn muốn xóa tính năng này không?");
    if (!confirm) return;
    const result = await deleteSafetyFeature(id);
    if (result.meta && result.meta.requestStatus === "fulfilled") {
      toast.success("Xóa tính năng an toàn thành công!");
    }
  };

  const handleRestore = async (id: string) => {
    const result = await restore(id);
    if (result.meta && result.meta.requestStatus === "fulfilled") {
      toast.success("Khôi phục tính năng an toàn thành công!");
    }
  };

  const handleToggleStatus = async (id: string) => {
    const result = await toggleStatus(id);
    if (result.meta && result.meta.requestStatus === "fulfilled") {
      toast.success("Đổi trạng thái thành công!");
    }
  };

  const handleToggleDefault = async (id: string) => {
    const result = await toggleDefault(id);
    if (result.meta && result.meta.requestStatus === "fulfilled") {
      toast.success("Đổi trạng thái mặc định thành công!");
    }
  };

  const handleFormSubmit = async (data: CreateSafetyFeatureDto) => {
    if (editId) {
      const result = await editSafetyFeature(editId, data);
      if (result.meta && result.meta.requestStatus === "fulfilled") {
        toast.success("Cập nhật tính năng an toàn thành công!");
        setShowForm(false);
        setEditId(null);
      }
    } else {
      const result = await addSafetyFeature(data);
      if (result.meta && result.meta.requestStatus === "fulfilled") {
        toast.success("Tạo tính năng an toàn thành công!");
        setShowForm(false);
        setEditId(null);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản lý chính sách an toàn</h2>
        <PermissionGuard permission='safety_feature.create'>
          <Button onClick={() => { setEditId(null); setShowForm(true); }}>Tạo mới chính sách an toàn</Button>
        </PermissionGuard>
      </div>
      {/* Bộ lọc */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-col md:flex-row gap-4 md:gap-7 items-center w-full">
        <span className="font-medium flex items-center gap-2 text-gray-700 w-full md:w-auto mb-2 md:mb-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17v-3.586a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Bộ lọc
        </span>
        <input
          placeholder="Tìm kiếm theo tên..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-80"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-80"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
        <button
          type="button"
          onClick={() => { setSearch(""); setStatus("all"); }}
          className="border rounded px-3 py-2 w-full md:w-80"
        >
          Làm mới
        </button>
      </div>
      {/* Card thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4 w-full">
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-lg font-bold">{total}</div>
          <div className="text-gray-500 text-sm">Tổng số chính sách</div>
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
      {/* Bảng chính sách an toàn */}
      <h3 className="font-semibold mb-2">Danh sách chính sách an toàn</h3>
      <div className="overflow-x-auto">
        <SafetyFeatureTable
          safetyFeatures={filteredFeatures}
          onEdit={id => { setEditId(id); setShowForm(true); }}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onToggleStatus={handleToggleStatus}
          onToggleDefault={handleToggleDefault}
          onShowDetail={setShowDetailId}
        />
      </div>
      {showForm && (
        <SafetyFeatureFormModal
          initialValues={editId ? safetyFeatureDetail || undefined : undefined}
          loading={loading}
          isEdit={!!editId}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditId(null); }}
        />
      )}
      {showDetailId && safetyFeatureDetail && (
        <SafetyFeatureDetailModal
          safetyFeature={safetyFeatureDetail}
          onClose={() => setShowDetailId(null)}
        />
      )}
    </div>
  );
};

export default SafetyFeatureListPage; 