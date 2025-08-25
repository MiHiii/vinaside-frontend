import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";
import { Voucher } from "@/types/voucher";
import { useNavigate } from "react-router-dom";
import { PermissionGuard } from "@/components/common/PermissionGuard";

interface Props {
  vouchers: Voucher[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onShowDetail: (id: string) => void;
}

const statusColor = (active: boolean) =>
  active ? "text-green-600 font-semibold" : "text-orange-500 font-semibold";

const VoucherTable: React.FC<Props> = ({
  vouchers,
  onEdit,
  onDelete,
  onRestore,
  onToggleStatus,
}: Props) => {
  const navigate = useNavigate();

  const handleRowClick = (id: string, e: React.MouseEvent) => {
    // Kiểm tra xem click có phải từ các nút hay toggle không
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("label") ||
      target.tagName === "INPUT"
    ) {
      return;
    }
    navigate(`/admin/vouchers/${id}/usage`);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-center">Mã voucher</TableHead>
            <TableHead className="text-center">Phần trăm giảm</TableHead>
            <TableHead className="text-center">Hạn dùng</TableHead>
            <TableHead className="text-center">
              Giá trị phòng tối thiểu
            </TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-center">Đã dùng</TableHead>
            <TableHead className="text-center">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vouchers.map((v) => (
            <TableRow
              key={v._id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={(e) => handleRowClick(v._id, e)}
            >
              <TableCell className="px-4 py-2 font-medium hover:text-gray-500">
                {v.code}
              </TableCell>
              <TableCell className="text-center">
                {v.discount_percent}%
              </TableCell>
              <TableCell className="text-center">
                {v.expiration_date.slice(0, 10).split("-").reverse().join("/")}
              </TableCell>
              <TableCell className="text-center">
                {v.min_order_value?.toLocaleString() ?? "-"}
              </TableCell>
              <TableCell
                className={`text-center ${statusColor(v.is_active)} relative`}
                onClick={(e) => e.stopPropagation()}
              >
                {v.is_active ? "Đang hoạt động" : "Không hoạt động"}
                <label className="ml-2 inline-flex items-center cursor-pointer relative align-middle">
                  <input
                    type="checkbox"
                    checked={v.is_active}
                    onChange={() => onToggleStatus(v._id)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition peer-checked:translate-x-5"></div>
                </label>
              </TableCell>
              <TableCell className="text-center">
                {v.uses_count}/{v.max_uses}
              </TableCell>
              <TableCell
                className="text-center space-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                <PermissionGuard permission="voucher.edit">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onEdit(v._id)}
                  >
                    <Pencil className="w-4 h-4" /> Sửa
                  </Button>
                </PermissionGuard>
                {!v.isDeleted ? (
                  <PermissionGuard permission="voucher.delete">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onDelete(v._id)}
                    >
                      <Trash className="w-4 h-4" /> Xóa
                    </Button>
                  </PermissionGuard>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onRestore(v._id)}
                  >
                    Khôi phục
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VoucherTable;
