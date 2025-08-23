import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/useRedux";
import { createStaffRemainingPayment } from "@/store/slices/bookingSlice";
import {
  DollarSign,
  Banknote,
  CheckCircle,
  Calculator,
  Receipt,
} from "lucide-react";

interface Booking {
  final_amount?: number;
  deposit_paid_amount?: number;
  total_price?: number;
  services_total_amount?: number;
  additionalCost?: number;
  additionalCostReason?: string;
  discount_amount?: number;
  voucher_code?: string;
  amount_after_discount?: number;
  subtotal_amount?: number;
  service_fee?: number;
  tax_amount?: number;
  selected_services?: Array<{
    service_name?: string;
    quantity?: number;
    service_price?: number;
    total_price?: number;
  }>;
}

interface StaffPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  propertyId: string;
  bookingId: string;
  onSuccess: () => void;
}

const StaffPaymentModal: React.FC<StaffPaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  propertyId,
  bookingId,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: "cash",
    note: "",
  });
  const [vnpayLoading, setVnpayLoading] = useState(false);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

  // Tính số tiền còn lại cần thanh toán
  const outstandingAmount =
    (booking?.final_amount || 0) - (booking?.deposit_paid_amount || 0);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setVnpayLoading(false);

    try {
      console.log("Submitting payment with data:", {
        propertyId,
        bookingId,
        paymentData: formData,
      });

      const result = await dispatch(
        createStaffRemainingPayment({
          propertyId,
          bookingId,
          paymentData: {
            ...formData,
            note: formData.note || undefined,
          },
        })
      ).unwrap();

      console.log("Payment result:", result); // Debug log
      console.log("Payment result type:", typeof result);
      console.log("Payment result keys:", Object.keys(result || {}));

      // Extract payment data from response structure
      const paymentData =
        result && typeof result === "object" && "data" in result
          ? (result as { data: unknown }).data
          : result;

      const paymentUrl =
        paymentData &&
        typeof paymentData === "object" &&
        "paymentUrl" in paymentData
          ? (paymentData as { paymentUrl: string }).paymentUrl
          : undefined;

      if (formData.paymentMethod === "vnpay" && paymentUrl) {
        console.log("Redirecting to VNPay:", paymentUrl); // Debug log
        setVnpayLoading(true);
        window.location.href = paymentUrl;
        return;
      } else if (formData.paymentMethod === "vnpay" && !paymentUrl) {
        console.log("VNPay selected but no paymentUrl returned:", result); // Debug log
        console.log("Full API response:", JSON.stringify(result, null, 2));
        toast.error("Không nhận được link thanh toán VNPay từ server");
        return;
      }

      toast.success("Đã xác nhận thanh toán thành công!");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Payment error:", error); // Debug log
      console.error("Payment error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi xác nhận thanh toán";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setVnpayLoading(false);
    }
  };

  if (outstandingAmount <= 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Xác nhận thanh toán
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                Booking đã được thanh toán đầy đủ
              </p>
              <p className="text-sm text-green-700">
                Không cần xác nhận thanh toán thêm.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-green-700">
              <DollarSign className="w-7 h-7 text-green-600 animate-bounce" />
              Xác nhận thanh toán
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Payment Method Selection */}
            <div>
              <Label className="text-base font-semibold text-green-700">
                Phương thức thanh toán
              </Label>
              <div className="mt-2 flex gap-4">
                <button
                  type="button"
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all shadow-sm focus:outline-none ${
                    formData.paymentMethod === "cash"
                      ? "bg-green-100 border-green-400 text-green-900 ring-2 ring-green-300"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-green-50"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, paymentMethod: "cash" }))
                  }
                >
                  <Banknote className="w-5 h-5" />
                  Tiền mặt
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all shadow-sm focus:outline-none ${
                    formData.paymentMethod === "vnpay"
                      ? "bg-blue-100 border-blue-400 text-blue-900 ring-2 ring-blue-300"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, paymentMethod: "vnpay" }))
                  }
                >
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  VNPay
                </button>
              </div>
            </div>

            {/* Amount - Hiển thị số tiền cần xác nhận */}
            <div>
              <Label className="text-base font-semibold text-blue-700">
                Số tiền cần xác nhận
              </Label>
              <div className="mt-2 flex flex-col items-center p-5 bg-blue-100 rounded-lg border border-blue-200 shadow-sm">
                <span className="text-3xl font-extrabold text-blue-800 tracking-wide">
                  {outstandingAmount.toLocaleString("vi-VN")}₫
                </span>
                <span className="text-sm text-blue-700 mt-1">
                  Số tiền còn lại cần thanh toán
                </span>
              </div>
            </div>

            {/* Detailed Breakdown Toggle */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <Calculator className="w-4 h-4" />
                {showDetailedBreakdown ? "Ẩn" : "Xem"} chi tiết các khoản tiền
              </Button>
            </div>

            {/* Detailed Breakdown */}
            {showDetailedBreakdown && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Receipt className="w-5 h-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-800">
                    Chi tiết các khoản tiền
                  </h4>
                </div>

                {/* Giá phòng cơ bản */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">
                    Giá phòng cơ bản
                  </span>
                  <span className="text-sm font-medium">
                    {(booking?.total_price || 0).toLocaleString("vi-VN")}₫
                  </span>
                </div>

                {/* Dịch vụ đã chọn */}
                {booking?.selected_services &&
                  booking.selected_services.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600 font-medium">
                          Dịch vụ bổ sung
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          +
                          {(booking?.services_total_amount || 0).toLocaleString(
                            "vi-VN"
                          )}
                          ₫
                        </span>
                      </div>

                      {/* Chi tiết từng dịch vụ */}
                      <div className="ml-4 space-y-1 bg-gray-50 rounded-lg p-3">
                        {booking.selected_services.map((service, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-xs text-gray-600"
                          >
                            <span>
                              • {service.service_name} (x{service.quantity})
                            </span>
                            <span className="font-medium">
                              {(service.total_price || 0).toLocaleString(
                                "vi-VN"
                              )}
                              ₫
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Voucher giảm giá */}
                {booking?.discount_amount && booking.discount_amount > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">
                      Giảm giá{" "}
                      {booking?.voucher_code ? `(${booking.voucher_code})` : ""}
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      -{(booking.discount_amount || 0).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                )}

                {/* Chi phí phát sinh */}
                <div className="flex justify-between items-center py-2">
                  <div>
                    <span className="text-sm text-gray-600">
                      Chi phí phát sinh
                    </span>
                    {booking?.additionalCostReason && (
                      <div className="text-xs text-gray-500 mt-1">
                        ({booking.additionalCostReason})
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-orange-600">
                    {booking?.additionalCost && booking.additionalCost > 0
                      ? "+"
                      : ""}
                    {(booking?.additionalCost || 0).toLocaleString("vi-VN")}₫
                  </span>
                </div>

                {/* Phân cách */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  {/* Tạm tính */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600 font-medium">
                      Tạm tính
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {(
                        booking?.amount_after_discount ||
                        booking?.subtotal_amount ||
                        0
                      ).toLocaleString("vi-VN")}
                      ₫
                    </span>
                  </div>

                  {/* Phí dịch vụ */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">
                      Phí dịch vụ (10%)
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      +{(booking?.service_fee || 0).toLocaleString("vi-VN")}₫
                    </span>
                  </div>

                  {/* Thuế VAT */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Thuế VAT (8%)</span>
                    <span className="text-sm font-medium text-gray-600">
                      +{(booking?.tax_amount || 0).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>

                {/* Tổng cộng */}
                <div className="border-t-2 border-blue-200 pt-3 mt-3 bg-blue-50 -mx-4 px-4 py-3 rounded-b-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-blue-800">
                      Tổng cộng
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {(booking?.final_amount || 0).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>

                {/* Đã thanh toán */}
                <div className="flex justify-between items-center py-2 border-t border-gray-200 bg-green-50 rounded-lg px-3">
                  <span className="text-sm font-semibold text-green-700">
                    Đã thanh toán:
                  </span>
                  <span className="text-sm font-bold text-green-700">
                    {(booking?.deposit_paid_amount || 0).toLocaleString(
                      "vi-VN"
                    )}
                    ₫
                  </span>
                </div>

                {/* Còn lại */}
                <div className="flex justify-between items-center py-2 border-t-2 border-blue-200 bg-blue-50 rounded-lg px-3">
                  <span className="text-sm font-semibold text-blue-700">
                    Còn lại cần thanh toán:
                  </span>
                  <span className="text-lg font-bold text-blue-700">
                    {outstandingAmount.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>
            )}

            {/* Note */}
            <div>
              <Label htmlFor="note" className="text-base font-semibold">
                Ghi chú (tùy chọn)
              </Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => handleInputChange("note", e.target.value)}
                className="mt-2 border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Ghi chú về việc xác nhận thanh toán..."
                rows={3}
              />
            </div>

            {/* Booking Info Summary */}
            {/* <div className="p-4 bg-white rounded-lg border shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" /> Thông tin booking
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <span className="font-medium">Tổng tiền:</span>{" "}
                  {booking?.final_amount?.toLocaleString("vi-VN")}₫
                </p>
                <p>
                  <span className="font-medium">Đã thanh toán:</span>{" "}
                  {(booking?.deposit_paid_amount || 0).toLocaleString("vi-VN")}₫
                </p>
                <p className="col-span-2">
                  <span className="font-medium">Còn lại:</span>{" "}
                  <span className="text-green-600 font-semibold">
                    {outstandingAmount.toLocaleString("vi-VN")}₫
                  </span>
                </p>
              </div>
            </div> */}

            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="min-w-[100px]"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading || vnpayLoading}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold min-w-[180px] shadow-lg hover:from-green-600 hover:to-blue-600 flex items-center justify-center gap-2"
              >
                {loading || vnpayLoading ? (
                  <>
                    <span className="animate-spin">
                      <DollarSign className="w-5 h-5" />
                    </span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Xác nhận đã thanh toán
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StaffPaymentModal;
