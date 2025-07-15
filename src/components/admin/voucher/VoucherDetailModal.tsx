import { Button } from "@/components/ui/button";
import { Voucher } from "@/types/voucher";

interface Props {
  voucher: Voucher;
  onClose: () => void;
}

const VoucherDetailModal = ({ voucher, onClose }: Props) => {
  if (!voucher) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-2">Chi tiết voucher</h3>
        <div><b>Mã:</b> {voucher.code}</div>
        <div><b>Phần trăm giảm:</b> {voucher.discount_percent}%</div>
        <div><b>Hạn dùng:</b> {new Date(voucher.expiration_date).toLocaleDateString()}</div>
        <div><b>Giá trị tối thiểu:</b> {voucher.min_order_value !== undefined ? voucher.min_order_value.toLocaleString() : '-'} </div>
        <div><b>Mô tả:</b> {voucher.description}</div>
        <div><b>Trạng thái:</b> {voucher.is_active ? "Đang hoạt động" : "Ngừng"}</div>
        <div><b>Đã dùng:</b> {voucher.uses_count}/{voucher.max_uses}</div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  );
};

export default VoucherDetailModal; 