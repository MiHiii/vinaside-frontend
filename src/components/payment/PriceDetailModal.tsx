// Định nghĩa kiểu cho props
type PriceDetailModalProps = {
  open: boolean;
  onClose: () => void;
};

const PriceDetailModal: React.FC<PriceDetailModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-5 right-6 text-2xl text-gray-400 hover:text-black"
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold text-center mb-6">Chi tiết giá</h2>
        <div className="space-y-3 text-base">
          <div>2 đêm · 1 – 3 thg 8</div>
          <div className="flex justify-between">
            <span>Giá</span>
            <span>₫700.000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600">Giảm giá cho khách đặt sớm</span>
            <span className="text-green-600">-₫105.000</span>
          </div>
          <div className="text-gray-500 text-sm">
            L&L Nest có ưu đãi giảm giá cho thời gian ở được đặt trước 30 ngày trở lên.
          </div>
          <div className="flex justify-between font-semibold border-t pt-4 mt-4">
            <span>
              Tổng <span className="underline">VND</span>
            </span>
            <span>₫595.000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDetailModal;
