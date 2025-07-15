import { SafetyFeature } from "@/types/safety-feature";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  safetyFeatures: SafetyFeature[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onToggleDefault: (id: string) => void;
  onShowDetail: (id: string) => void;
}

const statusColor = (active: boolean) =>
  active ? "text-green-600 font-semibold" : "text-orange-500 font-semibold";

const SafetyFeatureTable = ({
  safetyFeatures,
  onEdit,
  onDelete,
  onRestore,
  onToggleStatus,
//   onToggleDefault,
//   onShowDetail,
}: Props) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
    <Table className="min-w-full text-sm md:text-base">
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead className="text-center p-2 whitespace-nowrap">Tên</TableHead>
          <TableHead className="text-center p-2 whitespace-nowrap">Mô tả</TableHead>
          <TableHead className="text-center p-2 whitespace-nowrap">Trạng thái</TableHead>
          {/* <TableHead className="text-center p-2 whitespace-nowrap">Mặc định</TableHead> */}
          <TableHead className="text-center p-2 whitespace-nowrap">Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {safetyFeatures.map(f => (
          <TableRow key={f._id} className="hover:bg-gray-50">
            <TableCell className="px-2 py-2 md:px-4 font-medium max-w-[160px] md:max-w-none truncate" title={f.name}>{f.name}</TableCell>
            <TableCell className="text-center p-2 max-w-[200px] md:max-w-none break-words whitespace-pre-line">{f.description}</TableCell>
            <TableCell className={`text-center p-2 ${statusColor(f.is_active)} relative whitespace-nowrap`}>
              <span className="hidden md:inline">{f.is_active ? "Đang hoạt động" : "Không hoạt động"}</span>
              <span className="inline md:hidden">{f.is_active ? "Hoạt động" : "Ẩn"}</span>
              <label className="ml-2 inline-flex items-center cursor-pointer relative align-middle">
                <input
                  type="checkbox"
                  checked={f.is_active}
                  onChange={() => onToggleStatus(f._id)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                <div className="dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition peer-checked:translate-x-5"></div>
              </label>
            </TableCell>
            {/* <TableCell className="text-center p-2">
              <button onClick={() => onToggleDefault(f._id)} className="focus:outline-none">
                <Star className={`w-5 h-5 mx-auto ${f.default_checked ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
              </button>
            </TableCell> */}
            <TableCell className="text-center p-2 space-x-1 md:space-x-2">
              {/* <Button size="sm" variant="outline" onClick={() => onShowDetail(f._id)}>Chi tiết</Button> */}
              <Button size="sm" variant="default" onClick={() => onEdit(f._id)}>
                <Pencil className="w-4 h-4" /> <span className="hidden md:inline">Sửa</span>
              </Button>
              {!f.isDeleted ? (
                <Button size="sm" variant="default" onClick={() => onDelete(f._id)}>
                  <Trash className="w-4 h-4" /> <span className="hidden md:inline">Xóa</span>
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => onRestore(f._id)}>
                  <span className="hidden md:inline">Khôi phục</span>
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default SafetyFeatureTable; 