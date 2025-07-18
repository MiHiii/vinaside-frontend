import React from "react";

interface PriceDetailModalProps {
  open: boolean;
  onClose: () => void;
  pricePerNight: number;
  nights: number;
  discount: number;
  selectedServiceTotal?: number;
}

const PriceDetailModal: React.FC<PriceDetailModalProps> = ({
  open,
  onClose,
  pricePerNight,
  nights,
  discount,
  selectedServiceTotal = 0,
}) => {
  if (!open) return null;

  const base = pricePerNight * nights;
  const serviceFee = Math.round(base * 0.1);
  const tax = Math.round(base * 0.08);
  const total = base + serviceFee + tax + selectedServiceTotal;

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
        <div>{nights} đêm</div>
        <div className="flex justify-between">
          <span>Giá</span>
          <span>₫{base.toLocaleString()}</span>
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
          <span>₫{tax.toLocaleString()}</span>
        </div>
        {selectedServiceTotal > 0 && (
          <div className="flex justify-between">
            <span>Dịch vụ kèm theo</span>
            <span>₫{selectedServiceTotal.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold border-t pt-4 mt-4">
          <span>
            Tổng <span className="underline">VND</span>
          </span>
          <span>₫{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceDetailModal;
