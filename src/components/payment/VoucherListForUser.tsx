import React, { useEffect, useState } from "react";
import { voucherApi } from "@/services/voucherApi";
import { Voucher } from "@/types/voucher";

interface Props {
  onVoucherSelect?: (voucher: Voucher | null) => void;
  totalAmount: number;
}

const VoucherListForUser: React.FC<Props> = ({ onVoucherSelect, totalAmount }) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[Voucher FE] totalAmount truyền vào:", totalAmount);
    setLoading(true);
    voucherApi
      .getValid({ total_amount: totalAmount })
      .then((res) => {
        console.log("[Voucher FE] API /vouchers/valid response:", res.data.data);
        setVouchers(Array.isArray(res.data.data) ? res.data.data : []);
        setError(null);
      })
      .catch(() => {
        setError("Không thể tải voucher khả dụng");
      })
      .finally(() => setLoading(false));
  }, [totalAmount]);

  useEffect(() => {
    if (onVoucherSelect) {
      const selected = vouchers.find(v => v._id === selectedVoucherId) || null;
      onVoucherSelect(selected);
    }
  }, [selectedVoucherId, vouchers, onVoucherSelect]);

  const handleApplyCode = () => {
    if (!inputCode.trim()) return;
    setApplyError(null);
    voucherApi.getByCode(inputCode.trim().toUpperCase())
      .then((res) => {
        const voucher: Voucher = res.data;
        if (!voucher.is_active) {
          setApplyError("Voucher này đã ngừng hoạt động");
          return;
        }
        setSelectedVoucherId(voucher._id);
        setApplyError(null);
      })
      .catch(() => setApplyError("Không tìm thấy voucher với mã này"));
  };

  if (loading) return <div>Đang tải voucher...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="mb-4">
        <div className="font-semibold text-lg mb-2">Chọn Voucher</div>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            className="border rounded px-3 py-2 flex-1 outline-pink-500"
            placeholder="Mã Voucher"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
          />
          <button
            className="bg-pink-500 text-white px-4 py-2 rounded font-semibold hover:bg-pink-600"
            onClick={handleApplyCode}
            disabled={!inputCode.trim()}
          >
            Áp dụng
          </button>
        </div>
        {applyError && <div className="text-red-500 text-sm mt-1">{applyError}</div>}
      </div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-base">Voucher khả dụng</div>
        {selectedVoucherId && (
          <button
            className="text-xs text-pink-600 underline"
            onClick={() => setSelectedVoucherId(null)}
            type="button"
          >
            Bỏ chọn voucher
          </button>
        )}
      </div>
      <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
        {vouchers.length === 0 && <div>Hiện không có voucher nào khả dụng.</div>}
        {vouchers.map((voucher) => {
          const isSelected = selectedVoucherId === voucher._id;
          const isExpired = new Date(voucher.expiration_date) < new Date();
          const notEnough = voucher.min_order_value && totalAmount < voucher.min_order_value;
          return (
            <div
              key={voucher._id}
              className={`flex border-2 rounded-lg p-3 items-center gap-4 relative shadow-sm ${isSelected ? "border-pink-500 bg-pink-50" : "border-gray-200 bg-white"} ${notEnough ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className="flex flex-col items-center justify-center min-w-[70px]">
                <div className="bg-pink-400 text-white font-bold text-xs px-2 py-1 rounded mb-1">VOUCHER</div>
                <div className="text-pink-600 font-bold text-lg">{voucher.discount_percent}%</div>
                <div className="text-xs text-gray-600">Tối đa {voucher.max_uses_per_user || 1} lần/người</div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base text-pink-700">{voucher.code}</div>
                <div className="text-sm text-gray-700 mb-1">Giảm tối đa cho đơn từ ₫{voucher.min_order_value?.toLocaleString() || 0}</div>
                {voucher.description && <div className="text-xs text-gray-500 mb-1">{voucher.description}</div>}
                <div className="text-xs text-gray-500">HSD: {new Date(voucher.expiration_date).toLocaleDateString()}</div>
                {isExpired && <div className="text-xs text-red-500 font-semibold">Voucher đã hết hạn</div>}
                {!voucher.is_active && <div className="text-xs text-gray-400 font-semibold">Ngừng hoạt động</div>}
              </div>
              <input
                type="radio"
                name="select-voucher"
                className="w-5 h-5 accent-pink-500"
                checked={isSelected}
                onChange={() => setSelectedVoucherId(voucher._id)}
                disabled={isExpired || !voucher.is_active || !!notEnough}
              />
              {notEnough && (
                <div className="text-xs text-red-500 font-semibold">
                  Đơn hàng phải từ ₫{voucher.min_order_value?.toLocaleString()} mới dùng được
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VoucherListForUser; 