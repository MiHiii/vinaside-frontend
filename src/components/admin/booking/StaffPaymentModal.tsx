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
import { DollarSign, Banknote, CheckCircle, Info } from "lucide-react";

interface Booking {
  final_amount?: number;
  deposit_paid_amount?: number;
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
        <DialogContent className="sm:max-w-md">
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
      <DialogContent className="max-w-lg p-0 overflow-hidden">
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

            {/* Booking Info */}
            <div className="p-4 bg-white rounded-lg border shadow-sm">
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
            </div>

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
