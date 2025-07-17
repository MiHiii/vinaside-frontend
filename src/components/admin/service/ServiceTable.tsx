import { Service } from "@/types/services";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

interface Props {
  services: Service[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onShowDetail: (id: string) => void;
}

const statusColor = (active: boolean) =>
  active ? "text-green-600 font-semibold" : "text-orange-500 font-semibold";

const ServiceTable = ({
  services,
  onEdit,
  onDelete,
  onRestore,
  onToggleStatus,
//   onShowDetail,
}: Props) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
    <table className="min-w-full">
      <thead>
        <tr className="bg-gray-50">
          <th className="text-center p-2">Icon</th>
          <th className="text-center p-2">Tên dịch vụ</th>
          <th className="text-center p-2">Mô tả</th>
          <th className="text-center p-2">Đơn vị</th>
          <th className="text-center p-2">Giá</th>
          <th className="text-center p-2">Trạng thái</th>
          <th className="text-center p-2">Hành động</th>
        </tr>
      </thead>
      <tbody>
        {services.map(s => (
          <tr key={s._id} className="hover:bg-gray-50">
            <td className="text-center p-2">
              {s.icon_url ? (
                <img src={s.icon_url} alt="icon" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, display: 'inline-block' }} />
              ) : null}
            </td>
            <td className="px-4 py-2 font-medium">{s.name}</td>
            <td className="text-center p-2">{s.description}</td>
            <td className="text-center p-2">{s.unit}</td>
            <td className="text-center p-2">{s.default_price.toLocaleString()} đ</td>
            <td className={`text-center p-2 ${statusColor(s.is_active)} relative`}>
              {s.is_active ? "Đang hoạt động" : "Không hoạt động"}
              <label className="ml-2 inline-flex items-center cursor-pointer relative align-middle">
                <input
                  type="checkbox"
                  checked={s.is_active}
                  onChange={() => onToggleStatus(s._id)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                <div className="dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition peer-checked:translate-x-5"></div>
              </label>
            </td>
            <td className="text-center p-2 space-x-2">
              {/* <Button size="sm" variant="outline" onClick={() => onShowDetail(s._id)}>Chi tiết</Button> */}
              <Button size="sm" variant="default" onClick={() => onEdit(s._id)}>
                <Pencil className="w-4 h-4" /> Sửa
              </Button>
              {!s.isDeleted ? (
                <Button size="sm" variant="default" onClick={() => onDelete(s._id)}>
                  <Trash className="w-4 h-4" /> Xóa
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => onRestore(s._id)}>
                  Khôi phục
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ServiceTable; 