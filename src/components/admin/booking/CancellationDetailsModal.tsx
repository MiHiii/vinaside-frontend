import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/services/api";
import {
  CreditCard,
  Banknote,
  Wallet,
  User,
  Building,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
} from "lucide-react";

interface CancellationDetails {
  accountName?: string;
  bankName?: string;
  accountNumber?: string;
  cancellationReason?: string;
  refundMethod?: string;
  refundNote?: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface CancellationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  bookingId: string;
  onSuccess?: () => void;
}

const CancellationDetailsModal: React.FC<CancellationDetailsModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  bookingId,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [cancellationDetails, setCancellationDetails] =
    useState<CancellationDetails>({});
  const [formData, setFormData] = useState<CancellationDetails>({});

  // Fetch cancellation details when modal opens
  useEffect(() => {
    if (isOpen && propertyId && bookingId) {
      fetchCancellationDetails();
    }
  }, [isOpen, propertyId, bookingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCancellationDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(
        `/bookings/${propertyId}/${bookingId}/cancellation-details`
      );
      const data = response.data?.data || {};
      setCancellationDetails(data);
      setFormData(data);
    } catch (error: unknown) {
      console.error("Error fetching cancellation details:", error);
      // Don't show error toast if it's just that no details exist yet
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
          };
        };
        if (axiosError.response?.status !== 404) {
          toast.error("Không thể tải thông tin hủy phòng");
        }
      } else {
        toast.error("Không thể tải thông tin hủy phòng");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await api.patch(
        `/bookings/${propertyId}/${bookingId}/cancellation-details`,
        formData
      );
      toast.success("Cập nhật thông tin hủy phòng thành công!");
      await fetchCancellationDetails();
      setIsEditing(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating cancellation details:", error);
      toast.error("Không thể cập nhật thông tin hủy phòng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CancellationDetails,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getRefundMethodIcon = (method?: string) => {
    switch (method?.toLowerCase()) {
      case "bank_transfer":
      case "chuyển khoản":
        return <Banknote className="w-4 h-4" />;
      case "credit_card":
      case "thẻ tín dụng":
        return <CreditCard className="w-4 h-4" />;
      case "wallet":
      case "ví điện tử":
        return <Wallet className="w-4 h-4" />;
      default:
        return <Banknote className="w-4 h-4" />;
    }
  };

  const getRefundMethodLabel = (method?: string) => {
    switch (method?.toLowerCase()) {
      case "bank_transfer":
        return "Chuyển khoản ngân hàng";
      case "credit_card":
        return "Thẻ tín dụng";
      case "wallet":
        return "Ví điện tử";
      default:
        return method || "Chưa xác định";
    }
  };

  const hasCancellationDetails = Object.values(cancellationDetails).some(
    (value) => value
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Thông tin hủy phòng
          </DialogTitle>
          <DialogDescription>
            Quản lý thông tin chi tiết về lý do hủy phòng và thông tin hoàn tiền
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasCancellationDetails ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Đã có thông tin
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-600"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Chưa có thông tin
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                {hasCancellationDetails && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2"
                  >
                    {isEditing ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <Edit className="w-4 h-4" />
                    )}
                    {isEditing ? "Xem" : "Chỉnh sửa"}
                  </Button>
                )}
              </div>
            </div>

            {/* View Mode */}
            {!isEditing && hasCancellationDetails && (
              <div className="space-y-6">
                {/* Cancellation Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Thông tin hủy phòng
                  </h3>

                  {/* Cancellation Reason */}
                  {cancellationDetails.cancellationReason && (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <Label className="text-sm font-medium text-red-900">
                            Lý do hủy phòng
                          </Label>
                          <p className="text-sm text-red-800 mt-1 leading-relaxed">
                            {cancellationDetails.cancellationReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Refund Information */}
                {(cancellationDetails.accountName ||
                  cancellationDetails.bankName ||
                  cancellationDetails.accountNumber ||
                  cancellationDetails.refundMethod) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      Thông tin hoàn tiền
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cancellationDetails.accountName && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <Label className="text-sm font-medium text-gray-700">
                              Tên chủ tài khoản
                            </Label>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {cancellationDetails.accountName}
                          </p>
                        </div>
                      )}

                      {cancellationDetails.bankName && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Building className="w-4 h-4 text-gray-600" />
                            <Label className="text-sm font-medium text-gray-700">
                              Ngân hàng
                            </Label>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {cancellationDetails.bankName}
                          </p>
                        </div>
                      )}

                      {cancellationDetails.accountNumber && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-4 h-4 text-gray-600" />
                            <Label className="text-sm font-medium text-gray-700">
                              Số tài khoản
                            </Label>
                          </div>
                          <p className="text-sm font-mono font-medium text-gray-900">
                            {cancellationDetails.accountNumber}
                          </p>
                        </div>
                      )}

                      {cancellationDetails.refundMethod && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {getRefundMethodIcon(
                              cancellationDetails.refundMethod
                            )}
                            <Label className="text-sm font-medium text-gray-700">
                              Phương thức hoàn tiền
                            </Label>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {getRefundMethodLabel(
                              cancellationDetails.refundMethod
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Refund Note */}
                {cancellationDetails.refundNote && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <Label className="text-sm font-medium text-green-900">
                          Ghi chú hoàn tiền
                        </Label>
                        <p className="text-sm text-green-800 mt-1">
                          {cancellationDetails.refundNote}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Update Info */}
                {cancellationDetails.updatedAt && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>
                        Cập nhật lần cuối:{" "}
                        {new Date(
                          cancellationDetails.updatedAt
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Edit Mode */}
            {isEditing && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Cancellation Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Thông tin hủy phòng
                  </h3>

                  {/* Cancellation Reason */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="cancellationReason"
                      className="text-sm font-medium"
                    >
                      Lý do hủy phòng <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="cancellationReason"
                      placeholder="Vui lòng nhập chi tiết lý do hủy phòng để chúng tôi có thể cải thiện dịch vụ..."
                      value={formData.cancellationReason || ""}
                      onChange={(e) =>
                        handleInputChange("cancellationReason", e.target.value)
                      }
                      className="min-h-[100px] resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      Thông tin này sẽ giúp chúng tôi cải thiện chất lượng dịch
                      vụ
                    </p>
                  </div>
                </div>

                {/* Refund Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    Thông tin hoàn tiền
                  </h3>

                  {/* Account Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountName">Tên chủ tài khoản</Label>
                      <Input
                        id="accountName"
                        placeholder="Nguyễn Văn A"
                        value={formData.accountName || ""}
                        onChange={(e) =>
                          handleInputChange("accountName", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankName">Tên ngân hàng</Label>
                      <Input
                        id="bankName"
                        placeholder="Vietcombank"
                        value={formData.bankName || ""}
                        onChange={(e) =>
                          handleInputChange("bankName", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Số tài khoản</Label>
                      <Input
                        id="accountNumber"
                        placeholder="1234567890"
                        value={formData.accountNumber || ""}
                        onChange={(e) =>
                          handleInputChange("accountNumber", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="refundMethod">
                        Phương thức hoàn tiền
                      </Label>
                      <Select
                        value={formData.refundMethod || ""}
                        onValueChange={(value) =>
                          handleInputChange("refundMethod", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phương thức" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">
                            Chuyển khoản ngân hàng
                          </SelectItem>
                          <SelectItem value="credit_card">
                            Thẻ tín dụng
                          </SelectItem>
                          <SelectItem value="wallet">Ví điện tử</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Refund Note */}
                  <div className="space-y-2">
                    <Label htmlFor="refundNote">Ghi chú hoàn tiền</Label>
                    <Textarea
                      id="refundNote"
                      placeholder="Ghi chú về việc hoàn tiền..."
                      value={formData.refundNote || ""}
                      onChange={(e) =>
                        handleInputChange("refundNote", e.target.value)
                      }
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </form>
            )}

            {/* Empty State */}
            {!isEditing && !hasCancellationDetails && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có thông tin hủy phòng
                </h3>
                <p className="text-gray-500 mb-4">
                  Khách hàng chưa cung cấp thông tin chi tiết về việc hủy phòng.
                </p>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Thêm thông tin
                </Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          {isEditing && (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Đang lưu..." : "Lưu thông tin"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancellationDetailsModal;
