import { HouseRule } from "@/types/house-rule";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  houseRules: HouseRule[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const statusColor = (active: boolean) =>
  active ? "text-green-600 font-semibold" : "text-orange-500 font-semibold";

const HouseRuleTable = ({
  houseRules,
  onEdit,
  onDelete,
  onToggleStatus,
}: Props) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
    <Table className="min-w-full text-sm md:text-base">
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead className="text-center p-2 whitespace-nowrap">Icon</TableHead>
          <TableHead className="text-center p-2 whitespace-nowrap">Tên</TableHead>
          <TableHead className="text-center p-2 whitespace-nowrap">Mô tả</TableHead>
          <TableHead className="text-center p-2 whitespace-nowrap">Trạng thái</TableHead>
          <TableHead className="text-center p-2 whitespace-nowrap">Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {houseRules.map(r => (
          <TableRow key={r._id} className="hover:bg-gray-50">
            <TableCell className="text-center p-2">
              {r.icon_url ? (
                <img src={r.icon_url} alt="icon" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, display: 'inline-block' }} />
              ) : null}
            </TableCell>
            <TableCell className="px-2 py-2 md:px-4 font-medium max-w-[160px] md:max-w-none truncate" title={r.name}>{r.name}</TableCell>
            <TableCell className="text-center p-2 max-w-[200px] md:max-w-none break-words whitespace-pre-line">{r.description}</TableCell>
            <TableCell className={`text-center p-2 ${statusColor(r.is_active)} relative whitespace-nowrap`}>
              <span className="hidden md:inline">{r.is_active ? "Đang hoạt động" : "Không hoạt động"}</span>
              <span className="inline md:hidden">{r.is_active ? "Hoạt động" : "Ẩn"}</span>
              <label className="ml-2 inline-flex items-center cursor-pointer relative align-middle">
                <input
                  type="checkbox"
                  checked={r.is_active}
                  onChange={() => onToggleStatus(r._id)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                <div className="dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition peer-checked:translate-x-5"></div>
              </label>
            </TableCell>
            <TableCell className="text-center p-2 space-x-1 md:space-x-2">
              <Button size="sm" variant="default" onClick={() => onEdit(r._id)}>
                <Pencil className="w-4 h-4" /> <span className="hidden md:inline">Sửa</span>
              </Button>
              <Button size="sm" variant="default" onClick={() => onDelete(r._id)}>
                <Trash className="w-4 h-4" /> <span className="hidden md:inline">Xóa</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default HouseRuleTable; 