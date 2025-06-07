// components/roomdetail/AmenitiesModal.tsx
import React, { useEffect } from "react";
import {
  X,
  Coffee,
  Scissors,
  Droplet,
  Smartphone,
  Activity,
  BatteryCharging,
  MapPin,
  Award,
  Tag,
} from "lucide-react";

// Kiểu dữ liệu tiện ích (amenity)
export interface Amenity {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  name: string;
}

// Danh sách tiện ích mặc định
const defaultGroups: {
  title: string;
  items: Amenity[];
}[] = [
  {
    title: "Phòng tắm",
    items: [
      { icon: Droplet, name: "Máy sấy tóc" },
      { icon: Coffee, name: "Sản phẩm vệ sinh" },
      { icon: Coffee, name: "Dầu gội đầu lavender" },
      { icon: Scissors, name: "Xà phòng tắm lavender" },
      { icon: Droplet, name: "Nước nóng" },
      { icon: Droplet, name: "Sữa tắm" },
    ],
  },
  {
    title: "Phòng ngủ & giặt ủi",
    items: [
      { icon: Activity, name: "Ban công sân thượng" },
      { icon: BatteryCharging, name: "Ổ cắm sạc nhanh" },
      { icon: Smartphone, name: "Smart lock – Tự nhận phòng" },
      { icon: MapPin, name: "Vị trí trung tâm Quận 1" },
      { icon: Award, name: "Siêu chủ nhà" },
      { icon: Tag, name: "Cho phép hút thuốc ngoài ban công" },
    ],
  },
  {
  title: "Phòng tắm",
  items: [
    { icon: Droplet, name: "Máy sấy tóc" },
    { icon: Coffee, name: "Sản phẩm vệ sinh" },
    { icon: Coffee, name: "Dầu gội đầu lavender" },
    { icon: Scissors, name: "Xà phòng tắm lavender" },
    { icon: Droplet, name: "Nước nóng" },
    { icon: Droplet, name: "Sữa tắm" },
    // thêm nhiều dòng bên dưới
    { icon: Droplet, name: "Kem đánh răng" },
    { icon: Droplet, name: "Khăn tắm" },
    { icon: Droplet, name: "Khăn lau mặt" },
    { icon: Droplet, name: "Gương soi" },
    { icon: Droplet, name: "Bồn tắm" },
    { icon: Droplet, name: "Giấy vệ sinh" },
    { icon: Droplet, name: "Máy nước nóng năng lượng mặt trời" },
  ],
}

];

export { defaultGroups };

interface AmenitiesModalProps {
  open: boolean;
  onClose: () => void;
  groups?: {
    title: string;
    items: Amenity[];
  }[];
}

const AmenitiesModal: React.FC<AmenitiesModalProps> = ({
  open,
  onClose,
  groups,
}) => {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!open) return null;

  const sections = groups && groups.length > 0 ? groups : defaultGroups;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 max-w-3xl w-full max-h-[90vh] p-6 relative flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-800"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Tiêu đề */}
        <h2 className="text-2xl font-semibold mb-6">Nơi này có những gì cho bạn</h2>

        {/* Nội dung có thanh cuộn nếu dài */}
        <div className="flex-1 overflow-y-auto pr-2 max-h-full">
          {sections.map((section, si) => (
            <div key={si} className="mb-8">
              <h3 className="text-lg font-medium mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.items.map((amenity, ai) => (
                  <li key={ai} className="flex items-center gap-3">
                    <amenity.icon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-800 flex-1">{amenity.name}</span>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              {si < sections.length - 1 && (
                <hr className="border-t border-gray-200 mt-6" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AmenitiesModal;
