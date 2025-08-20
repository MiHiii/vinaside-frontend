import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/services/api";
import { AlertCircle, FileText, Banknote } from "lucide-react";

interface EditCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cancellationDetails: {
    cancellationReason?: string;
    accountName?: string;
    bankName?: string;
    accountNumber?: string;
    refundMethod?: string;
    refundNote?: string;
  } | null;
  propertyId: string;
  bookingId: string;
  onSuccess: () => void;
}

const EditCancellationModal: React.FC<EditCancellationModalProps> = ({
  isOpen,
  onClose,
  cancellationDetails,
  propertyId,
  bookingId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cancellationReason: cancellationDetails?.cancellationReason || "",
    accountName: cancellationDetails?.accountName || "",
    bankName: cancellationDetails?.bankName || "",
    accountNumber: cancellationDetails?.accountNumber || "",
    refundMethod: cancellationDetails?.refundMethod || "",
    refundNote: cancellationDetails?.refundNote || "",
  });

  useEffect(() => {
    if (cancellationDetails) {
      setFormData({
        cancellationReason: cancellationDetails.cancellationReason || "",
        accountName: cancellationDetails.accountName || "",
        bankName: cancellationDetails.bankName || "",
        accountNumber: cancellationDetails.accountNumber || "",
        refundMethod: cancellationDetails.refundMethod || "",
        refundNote: cancellationDetails.refundNote || "",
      });
    }
  }, [cancellationDetails]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.patch(
        `/bookings/${propertyId}/${bookingId}/cancellation-details`,
        formData
      );

      toast.success("Cập nhật thông tin hủy phòng thành công!");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật thông tin hủy phòng";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Chỉnh sửa thông tin hủy phòng
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cancellation Reason */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Lý do hủy phòng
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <Label
                  htmlFor="cancellationReason"
                  className="text-base font-semibold text-red-900"
                >
                  Lý do hủy phòng <span className="text-red-500">*</span>
                </Label>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                <Textarea
                  id="cancellationReason"
                  value={formData.cancellationReason}
                  onChange={(e) =>
                    handleInputChange("cancellationReason", e.target.value)
                  }
                  placeholder="Vui lòng nhập chi tiết lý do hủy phòng để chúng tôi có thể cải thiện dịch vụ..."
                  rows={4}
                  className="bg-white border-red-200 focus:border-red-400 focus:ring-red-400 resize-none"
                />
                <p className="text-xs text-red-600 mt-2 font-medium">
                  💡 Thông tin này sẽ giúp chúng tôi cải thiện chất lượng dịch
                  vụ
                </p>
              </div>
            </div>
          </div>

          {/* Refund Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              Thông tin hoàn tiền
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountName">Tên chủ tài khoản</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) =>
                    handleInputChange("accountName", e.target.value)
                  }
                  placeholder="Nhập tên chủ tài khoản"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bankName">Ngân hàng</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) =>
                    handleInputChange("bankName", e.target.value)
                  }
                  placeholder="Nhập tên ngân hàng"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="accountNumber">Số tài khoản</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    handleInputChange("accountNumber", e.target.value)
                  }
                  placeholder="Nhập số tài khoản"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="refundMethod">Phương thức hoàn tiền</Label>
                <Select
                  value={formData.refundMethod}
                  onValueChange={(value) =>
                    handleInputChange("refundMethod", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn phương thức hoàn tiền" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">
                      Chuyển khoản ngân hàng
                    </SelectItem>
                    <SelectItem value="cash">Tiền mặt</SelectItem>
                    <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Refund Note */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Ghi chú hoàn tiền
            </h3>

            <div>
              <Label htmlFor="refundNote">Ghi chú</Label>
              <Textarea
                id="refundNote"
                value={formData.refundNote}
                onChange={(e) =>
                  handleInputChange("refundNote", e.target.value)
                }
                placeholder="Nhập ghi chú về việc hoàn tiền..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCancellationModal;
