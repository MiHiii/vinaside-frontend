import React, { useState, useMemo } from "react";
import { useHouseRules } from "@/hooks/useHouseRules";
import HouseRuleTable from "@/components/admin/house-rule/HouseRuleTable";
import HouseRuleFormModal from "@/components/admin/house-rule/HouseRuleFormModal";
import { CreateHouseRuleDto } from "@/types/house-rule";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useDispatch } from 'react-redux';
import { resetUpload } from '@/store/slices/uploadSlice';

const HouseRuleListPage = () => {
  const dispatch = useDispatch();
  const {
    houseRules,
    loading,
    fetchHouseRules,
    createHouseRule,
    updateHouseRule,
    removeHouseRule,
    toggleHouseRuleStatus,
  } = useHouseRules();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  React.useEffect(() => {
    fetchHouseRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = () => {
    setEditId(null);
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    setEditId(id);
    setShowForm(true);
  };

  const handleSubmit = async (data: CreateHouseRuleDto) => {
    if (editId) {
      const result = await updateHouseRule(editId, data);
      if (result.meta && result.meta.requestStatus === "fulfilled") {
        toast.success("Cập nhật quy tắc nhà thành công!");
      }
    } else {
      const result = await createHouseRule(data);
      if (result.meta && result.meta.requestStatus === "fulfilled") {
        toast.success("Tạo quy tắc nhà thành công!");
        dispatch(resetUpload());
      }
    }
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Bạn có chắc chắn muốn xóa quy tắc này không?");
    if (!confirm) return;
    const result = await removeHouseRule(id);
    if (result.meta && result.meta.requestStatus === "fulfilled") {
      toast.success("Xóa quy tắc nhà thành công!");
    }
  };

  const handleToggleStatus = async (id: string) => {
    const result = await toggleHouseRuleStatus(id);
    if (result.meta && result.meta.requestStatus === "fulfilled") {
      toast.success("Thay đổi trạng thái thành công!");
    }
  };

  // Filtered data
  const filteredHouseRules = useMemo(() => {
    return (houseRules ?? []).filter(rule => {
      const matchName = rule.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        status === "all" ? true : status === "active" ? rule.is_active : !rule.is_active;
      return matchName && matchStatus;
    });
  }, [houseRules, search, status]);

  // Statistics
  const total = houseRules.length;
  const active = houseRules.filter(r => r.is_active).length;
  const inactive = houseRules.filter(r => !r.is_active).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản lý quy tắc nhà</h2>
        <Button onClick={handleCreate}>Thêm quy tắc nhà</Button>
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
          <div className="text-gray-500 text-sm">Tổng số quy tắc nhà</div>
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
      {/* Bảng quy tắc nhà */}
      <h3 className="font-semibold mb-2">Danh sách quy tắc nhà</h3>
      <div className="overflow-x-auto">
        <HouseRuleTable
          houseRules={filteredHouseRules}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      </div>
      {showForm && (
        <HouseRuleFormModal
          initialValues={editId ? houseRules.find(r => r._id === editId) : undefined}
          loading={loading}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          isEdit={!!editId}
        />
      )}
    </div>
  );
};

export default HouseRuleListPage; 