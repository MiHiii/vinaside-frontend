import React from "react";
import { Service } from "@/types/services";
import { X } from "lucide-react";

interface Props {
  service: Service;
  onClose: () => void;
}

const ServiceDetailModal = ({ service, onClose }: Props) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fadeIn p-6 relative">
      <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
      <h3 className="text-xl font-bold mb-4">Chi tiết dịch vụ</h3>
      <div className="space-y-2">
        <div><span className="font-medium">Tên dịch vụ:</span> {service.name}</div>
        <div><span className="font-medium">Mô tả:</span> {service.description || "-"}</div>
        <div><span className="font-medium">Đơn vị:</span> {service.unit}</div>
        <div><span className="font-medium">Giá:</span> {service.default_price.toLocaleString()} đ</div>
        <div><span className="font-medium">Trạng thái:</span> {service.is_active ? "Đang hoạt động" : "Không hoạt động"}</div>
        <div><span className="font-medium">Icon URL:</span> {service.icon_url || "-"}</div>
        <div><span className="font-medium">Ngày tạo:</span> {new Date(service.created_at).toLocaleString()}</div>
        <div><span className="font-medium">Ngày cập nhật:</span> {new Date(service.updated_at).toLocaleString()}</div>
      </div>
    </div>
  </div>
);

export default ServiceDetailModal; 