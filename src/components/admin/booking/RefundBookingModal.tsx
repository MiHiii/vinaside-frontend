import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/services/api";
import {
  CheckCircle,
  FileText,
  Banknote,
  User,
  Building,
  CreditCard,
  Wallet,
  Info,
  DollarSign,
  Camera,
  Shield,
} from "lucide-react";
import type { Booking } from "@/types/booking.interface";
import RefundImageUpload from "@/components/ui/RefundImageUpload";

interface RefundBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onSuccess: () => void;
}

const RefundBookingModal: React.FC<RefundBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    refundAmount: booking.deposit_paid_amount || 0,
    refundMethod: "bank_transfer",
    refundNote: "",
    accountName: booking.cancellationDetails?.accountName || "",
    bankName: booking.cancellationDetails?.bankName || "",
    accountNumber: booking.cancellationDetails?.accountNumber || "",
  });

  // States for image upload
  const [refundImages, setRefundImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadedImageUrls.length === 0) {
      toast.error("Vui lòng upload ít nhất 1 ảnh minh chứng hoàn tiền!");
      return;
    }

    setLoading(true);

    try {
      // Gọi API hoàn tiền với ảnh minh chứng
      let propertyId = "";

      if (typeof booking.propertyId === "string") {
        propertyId = booking.propertyId;
      } else if (booking.propertyId && typeof booking.propertyId === "object") {
        const property = booking.propertyId as { _id?: string };
        propertyId = property._id || "";
      }

      if (!propertyId) {
        toast.error("Không tìm thấy Property ID!");
        return;
      }

      console.log("Debug - Property ID:", propertyId);
      console.log("Debug - Booking propertyId:", booking.propertyId);

      await api.patch(`/bookings/admin/${propertyId}/${booking._id}/refund`, {
        refundAmount: formData.refundAmount,
        refundMethod: formData.refundMethod,
        refundNote: formData.refundNote,
        accountName: formData.accountName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        refundImageUrls: uploadedImageUrls, // Ảnh minh chứng hoàn tiền
      });

      toast.success(
        "Hoàn tiền booking thành công! Booking đã chuyển sang trạng thái 'Đã hoàn tiền'"
      );
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi hoàn tiền booking";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-green-50 to-emerald-50 border-0 shadow-2xl">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
            Hoàn tiền booking
          </DialogTitle>
          <p className="text-gray-600 text-lg">
            Booking đã được hủy và đang ở trạng thái "Đang hoàn tiền". Vui lòng
            upload ảnh minh chứng và xác nhận hoàn tiền.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Booking Info - Card hiển thị thông tin booking */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-3">
                <Info className="w-6 h-6" />
                Thông tin booking
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Khách hàng:</span>
                  <p className="font-medium text-gray-900">
                    {typeof booking.guest_name === "string"
                      ? booking.guest_name
                      : "Khách hàng"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Check-in:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.checkInDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Check-out:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.check_out_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Số tiền đã thanh toán:</span>
                  <p className="font-medium text-green-600">
                    {(booking.deposit_paid_amount || 0).toLocaleString()} VND
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Amount Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-3">
                <DollarSign className="w-6 h-6" />
                Số tiền hoàn trả
              </h3>
            </div>
            <div className="p-6">
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="refundAmount"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-emerald-600" />
                      Số tiền hoàn lại (VND)
                    </Label>
                    <Input
                      id="refundAmount"
                      type="number"
                      value={formData.refundAmount}
                      onChange={(e) =>
                        handleInputChange(
                          "refundAmount",
                          Number(e.target.value)
                        )
                      }
                      className="mt-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                      min="0"
                      max={booking.deposit_paid_amount || 0}
                    />
                    <p className="text-xs text-emerald-600 mt-1">
                      Tối đa:{" "}
                      {(booking.deposit_paid_amount || 0).toLocaleString()} VND
                    </p>
                  </div>
                  <div>
                    <Label
                      htmlFor="refundMethod"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      Phương thức hoàn tiền
                    </Label>
                    <div className="mt-1 bg-emerald-100 rounded-lg p-3 border border-emerald-200">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium">
                          Chuyển khoản ngân hàng
                        </span>
                      </div>
                      <p className="text-sm text-emerald-600 mt-1">
                        Hoàn tiền qua tài khoản ngân hàng của khách
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Account Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-3">
                <CreditCard className="w-6 h-6" />
                Thông tin tài khoản hoàn tiền
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="accountName"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-blue-600" />
                    Tên chủ tài khoản
                  </Label>
                  <Input
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) =>
                      handleInputChange("accountName", e.target.value)
                    }
                    placeholder="Nguyễn Văn A"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="bankName"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Building className="w-4 h-4 text-blue-600" />
                    Tên ngân hàng
                  </Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) =>
                      handleInputChange("bankName", e.target.value)
                    }
                    placeholder="Vietcombank"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <Label
                    htmlFor="accountNumber"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Số tài khoản
                  </Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      handleInputChange("accountNumber", e.target.value)
                    }
                    placeholder="1234567890"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Refund Note */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-3">
                <FileText className="w-6 h-6" />
                Ghi chú hoàn tiền
                <span className="text-purple-200 text-sm font-normal">
                  (tùy chọn)
                </span>
              </h3>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <Textarea
                  id="refundNote"
                  value={formData.refundNote}
                  onChange={(e) =>
                    handleInputChange("refundNote", e.target.value)
                  }
                  placeholder="Nhập ghi chú về việc hoàn tiền..."
                  rows={4}
                  className="bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400 resize-none"
                />
                <div className="flex items-center gap-2 mt-3 text-purple-600">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    💡 Ghi chú này sẽ được lưu lại để tham khảo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Images Upload - Card bắt buộc */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-3">
                <Camera className="w-6 h-6" />
                Ảnh minh chứng hoàn tiền
                <span className="text-orange-200 text-sm font-normal">
                  (bắt buộc)
                </span>
              </h3>
            </div>
            <div className="p-6">
              <RefundImageUpload
                images={refundImages}
                setImages={setRefundImages}
                uploadedUrls={uploadedImageUrls}
                setUploadedUrls={setUploadedImageUrls}
                maxFiles={5}
                maxSizePerFile={10}
              />
            </div>
          </div>

          {/* Cảnh báo - Card đẹp */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 text-green-800 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h5 className="font-bold text-lg">Xác nhận hoàn tiền</h5>
                <p className="text-green-700 text-sm">
                  Vui lòng kiểm tra kỹ thông tin trước khi xác nhận
                </p>
              </div>
            </div>
            <p className="text-green-700 leading-relaxed">
              Sau khi xác nhận, booking sẽ chuyển từ trạng thái "Đang hoàn tiền"
              sang "Đã hoàn tiền". Các ảnh minh chứng sẽ được hiển thị cho khách
              hàng xem trong lịch sử booking.
            </p>
          </div>
        </form>

        {/* Action Buttons - Footer đẹp */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl">
          <div className="text-sm text-gray-500 font-mono">
            Booking ID: {booking._id}
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 rounded-xl border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || uploadedImageUrls.length === 0}
              className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Xác nhận hoàn tiền</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefundBookingModal;
