import React from "react";
import { SafetyFeature } from "@/types/safety-feature";
import { X } from "lucide-react";

interface Props {
  safetyFeature: SafetyFeature;
  onClose: () => void;
}

const SafetyFeatureDetailModal = ({ safetyFeature, onClose }: Props) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fadeIn p-6 relative">
      <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
      <h3 className="text-xl font-bold mb-4">Chi tiết tính năng an toàn</h3>
      <div className="space-y-2">
        <div><span className="font-medium">Tên:</span> {safetyFeature.name}</div>
        <div><span className="font-medium">Mô tả:</span> {safetyFeature.description || "-"}</div>
        <div><span className="font-medium">Icon:</span> {safetyFeature.icon_url ? <img src={safetyFeature.icon_url} alt="icon" className="inline w-8 h-8 align-middle" /> : "-"}</div>
        <div><span className="font-medium">Trạng thái:</span> {safetyFeature.is_active ? "Đang hoạt động" : "Không hoạt động"}</div>
        <div><span className="font-medium">Mặc định:</span> {safetyFeature.default_checked ? "Có" : "Không"}</div>
        <div><span className="font-medium">Ngày tạo:</span> {new Date(safetyFeature.created_at).toLocaleString()}</div>
        <div><span className="font-medium">Ngày cập nhật:</span> {new Date(safetyFeature.updated_at).toLocaleString()}</div>
      </div>
    </div>
  </div>
);

export default SafetyFeatureDetailModal; 