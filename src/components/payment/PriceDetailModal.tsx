import React from "react";

interface PriceDetailModalProps {
  open: boolean;
  onClose: () => void;
  pricePerNight: number;
  nights: number;
  discount: number;
}

const PriceDetailModal: React.FC<PriceDetailModalProps> = ({
  open,
  onClose,
  pricePerNight,
  nights,
  discount,
}) => {
  if (!open) return null;

  const totalBeforeDiscount = pricePerNight * nights;
  const serviceFee = 16500;
  const totalAfterDiscount = totalBeforeDiscount - discount;
  const totalWithFee = totalAfterDiscount * 1.08 + serviceFee;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-5 right-6 text-2xl text-gray-400 hover:text-black"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-lg font-semibold text-center mb-6">Chi tiết giá</h2>
        <div className="space-y-3 text-base">
          <div>{nights} đêm</div>
          <div className="flex justify-between">
            <span>Giá</span>
            <span>₫{totalBeforeDiscount.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-green-600">Giảm giá</span>
              <span className="text-green-600">
                -₫{discount.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Phí dịch vụ</span>
            <span>₫{serviceFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Thuế (8%)</span>
            <span>₫{(totalAfterDiscount * 0.08).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-4 mt-4">
            <span>
              Tổng <span className="underline">VND</span>
            </span>
            <span>₫{totalWithFee.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDetailModal;
