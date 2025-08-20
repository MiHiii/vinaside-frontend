import React, { useState } from "react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/services/api";
import {
  AlertCircle,
  XCircle,
  Info,
  Calendar,
  Users,
  DollarSign,
  Building,
  Star,
  Shield,
  CreditCard,
  Wallet,
  Banknote,
} from "lucide-react";

// Không cần interface CancelPolicy nữa, dùng enum như bên khách

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    _id: string;
    checkInDate: string;
    check_out_date: string;
    guests: number;
    final_amount?: number;
    deposit_paid_amount?: number;
    cancel_policy?: string;
    listingId?: {
      title?: string;
      images?: string[];
    } | string;
    propertyId?: {
      name?: string;
    } | string;
  };
  onSuccess: () => void;
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cancellationReason: "",
    accountName: "",
    bankName: "",
    accountNumber: "",
    refundMethod: "bank_transfer",
    refundNote: "",
  });

  // Không cần fetch từ database nữa, dùng logic hardcode như bên khách

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
      // Sử dụng API admin/:id/cancel để hủy booking và lưu thông tin hủy phòng
      await api.patch(
        `/bookings/admin/${booking._id}/cancel`,
        formData
      );

      toast.success("Hủy booking thành công!");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error cancelling booking:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi hủy booking";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyName = () => {
    if (typeof booking.propertyId === "object" && booking.propertyId?.name) {
      return booking.propertyId.name;
    }
    return "Không có thông tin";
  };

  const getListingTitle = () => {
    if (typeof booking.listingId === "object" && booking.listingId?.title) {
      return booking.listingId.title;
    }
    return "Không có thông tin";
  };

  const getListingImage = () => {
    if (typeof booking.listingId === "object" && booking.listingId?.images?.[0]) {
      return booking.listingId.images[0];
    }
    return "/placeholder.svg";
  };

  // Logic tính toán hoàn tiền giống BE
  const calculateRefundAmount = () => {
    const now = new Date();
    const checkInDate = new Date(booking.checkInDate);
    const daysBeforeCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let refundPercent = 0;
    const policy = booking.cancel_policy?.toLowerCase() || "flexible";
    
    switch (policy) {
      case "flexible":
        if (now < checkInDate) refundPercent = 100;
        break;
      case "moderate":
        if (daysBeforeCheckIn > 7) refundPercent = 100;
        else if (daysBeforeCheckIn >= 0) refundPercent = 50;
        break;
      case "strict":
        refundPercent = 0;
        break;
      default:
        if (now < checkInDate) refundPercent = 100;
    }
    
    const refundAmount = Math.round(((booking.deposit_paid_amount || 0) * refundPercent) / 100);
    return { refundPercent, refundAmount, daysBeforeCheckIn };
  };

  const { refundPercent, refundAmount, daysBeforeCheckIn } = calculateRefundAmount();
  const canRefund = refundPercent > 0;

  // Render chính sách hoàn tiền với số tiền hoàn chính xác
  const renderCancelPolicy = () => {
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    
    if (booking.cancel_policy?.toLowerCase() === "flexible") {
      return (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-800 text-lg">Chính sách linh hoạt</p>
            <p className="text-green-700 mb-2">
              {now < checkInDate ? "Hủy trước ngày check-in: Hoàn tiền đầy đủ" : "Đã qua ngày check-in: Không được hoàn tiền"}
            </p>
            {canRefund && (
              <div className="bg-green-100 rounded-lg p-3 border border-green-200">
                <p className="text-green-800 font-semibold">
                  Số tiền được hoàn: <span className="text-lg">{refundAmount.toLocaleString()} VND</span>
                </p>
                <p className="text-green-700 text-sm">Tỷ lệ hoàn: {refundPercent}%</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (booking.cancel_policy?.toLowerCase() === "moderate") {
      return (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-yellow-800 text-lg">Chính sách vừa phải</p>
            <p className="text-yellow-700 mb-2">
              {daysBeforeCheckIn > 7 
                ? `Hủy trước ${daysBeforeCheckIn} ngày: Hoàn tiền đầy đủ`
                : daysBeforeCheckIn >= 0 
                  ? `Hủy trước ${daysBeforeCheckIn} ngày: Hoàn 50% tiền`
                  : "Đã qua ngày check-in: Không được hoàn tiền"
              }
            </p>
            {canRefund && (
              <div className="bg-yellow-100 rounded-lg p-3 border border-yellow-200">
                <p className="text-yellow-800 font-semibold">
                  Số tiền được hoàn: <span className="text-lg">{refundAmount.toLocaleString()} VND</span>
                </p>
                <p className="text-yellow-700 text-sm">Tỷ lệ hoàn: {refundPercent}%</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (booking.cancel_policy?.toLowerCase() === "strict") {
      return (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800 text-lg">Chính sách nghiêm ngặt</p>
            <p className="text-red-700 mb-2">Không được hoàn tiền trong mọi trường hợp.</p>
            <div className="bg-red-100 rounded-lg p-3 border border-red-200">
              <p className="text-red-800 font-semibold">
                Số tiền được hoàn: <span className="text-lg">0 VND</span>
              </p>
              <p className="text-red-700 text-sm">Tỷ lệ hoàn: 0%</p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <Info className="w-6 h-6 text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-700 text-lg">Chính sách mặc định (Flexible)</p>
          <p className="text-gray-700 mb-2">
            {now < checkInDate ? "Hủy trước ngày check-in: Hoàn tiền đầy đủ" : "Đã qua ngày check-in: Không được hoàn tiền"}
          </p>
          {canRefund && (
            <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
              <p className="text-gray-800 font-semibold">
                Số tiền được hoàn: <span className="text-lg">{refundAmount.toLocaleString()} VND</span>
              </p>
              <p className="text-gray-700 text-sm">Tỷ lệ hoàn: {refundPercent}%</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white via-gray-50 to-blue-50 border-0 shadow-2xl">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
            Xác nhận hủy booking
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-lg">
            Vui lòng xem xét kỹ thông tin trước khi xác nhận hủy booking này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Thông tin booking - Card đẹp */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h4 className="font-bold text-white text-lg flex items-center gap-3">
                <Info className="w-6 h-6" />
                Thông tin booking
              </h4>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Property</p>
                      <p className="font-semibold text-gray-900">{getPropertyName()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Phòng</p>
                      <p className="font-semibold text-gray-900">{getListingTitle()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Check-in</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.checkInDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Check-out</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.check_out_date).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Số khách</p>
                      <p className="font-semibold text-gray-900">{booking.guests} người</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Tổng tiền</p>
                      <p className="font-bold text-emerald-600 text-lg">
                        {(booking.final_amount || 0).toLocaleString()} VND
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Đã thanh toán</p>
                      <p className="font-bold text-amber-600 text-lg">
                        {(booking.deposit_paid_amount || 0).toLocaleString()} VND
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hình ảnh phòng - Card đẹp */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h4 className="font-bold text-white text-lg flex items-center gap-3">
                <Star className="w-6 h-6" />
                Hình ảnh phòng
              </h4>
            </div>
            <div className="p-6">
              <div className="flex justify-center">
                <div className="relative group">
                  <img
                    src={getListingImage()}
                    alt={getListingTitle()}
                    className="w-full max-w-lg h-64 object-cover rounded-xl border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  
                </div>
              </div>
            </div>
          </div>

          {/* Chính sách hủy - Card đẹp với data từ DB */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h4 className="font-bold text-white text-lg flex items-center gap-3">
                <Shield className="w-6 h-6" />
                Chính sách hoàn tiền
              </h4>
            </div>
            
            <div className="p-6">
              {renderCancelPolicy()}
            </div>
          </div>

                     {/* Thông tin hoàn tiền tổng hợp */}
           <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
             <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4">
               <h4 className="font-bold text-white text-lg flex items-center gap-3">
                 <DollarSign className="w-6 h-6" />
                 Thông tin hoàn tiền
               </h4>
             </div>
             <div className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                   <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                     <DollarSign className="w-6 h-6 text-emerald-600" />
                   </div>
                   <p className="text-sm text-emerald-600 font-medium">Số tiền đã thanh toán</p>
                   <p className="text-2xl font-bold text-emerald-800">
                     {(booking.deposit_paid_amount || 0).toLocaleString()} VND
                   </p>
                 </div>
                 
                 <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                   <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                     <Shield className="w-6 h-6 text-blue-600" />
                   </div>
                   <p className="text-sm text-blue-600 font-medium">Tỷ lệ hoàn tiền</p>
                   <p className="text-2xl font-bold text-blue-800">
                     {refundPercent}%
                   </p>
                 </div>
                 
                 <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                   <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                     <Wallet className="w-6 h-6 text-green-600" />
                   </div>
                   <p className="text-sm text-green-600 font-medium">Số tiền được hoàn</p>
                   <p className="text-2xl font-bold text-green-800">
                     {refundAmount.toLocaleString()} VND
                   </p>
                 </div>
               </div>
               
               {canRefund && (
                 <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                   <div className="flex items-center gap-3 text-green-800">
                     <Info className="w-5 h-5 text-green-600" />
                     <span className="font-semibold">Thông tin bổ sung:</span>
                   </div>
                   <p className="text-green-700 mt-2">
                     Khách hàng sẽ được hoàn {refundAmount.toLocaleString()} VND 
                     ({refundPercent}% của số tiền đã thanh toán) 
                     {daysBeforeCheckIn > 0 ? ` trong vòng ${daysBeforeCheckIn} ngày tới` : " ngay lập tức"}.
                   </p>
                 </div>
               )}
               
               {!canRefund && (
                 <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
                   <div className="flex items-center gap-3 text-red-800">
                     <AlertCircle className="w-5 h-5 text-red-600" />
                     <span className="font-semibold">Lưu ý:</span>
                   </div>
                   <p className="text-red-700 mt-2">
                     Khách hàng sẽ không được hoàn tiền theo chính sách hiện tại.
                   </p>
                 </div>
               )}
             </div>
           </div>

           {/* Form lý do hủy và thông tin hoàn tiền */}
           <form onSubmit={handleSubmit} className="space-y-6">
            {/* Lý do hủy - Card đẹp */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                <h4 className="font-bold text-white text-lg flex items-center gap-3">
                  <AlertCircle className="w-6 h-6" />
                  Lý do hủy phòng
                  <span className="text-red-200 text-sm font-normal">(bắt buộc)</span>
                </h4>
              </div>
              <div className="p-6">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
                  <Textarea
                    id="cancellationReason"
                    value={formData.cancellationReason}
                    onChange={(e) => handleInputChange("cancellationReason", e.target.value)}
                    placeholder="Vui lòng nhập lý do hủy phòng..."
                    className="bg-white border-red-200 focus:border-red-400 focus:ring-red-400 resize-none text-base"
                    rows={4}
                    required
                  />
                  <div className="flex items-center gap-2 mt-3 text-red-600">
                    <Info className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Thông tin này sẽ được lưu lại để cải thiện dịch vụ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin hoàn tiền - chỉ hiển thị nếu có thể hoàn tiền */}
            {canRefund && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <h4 className="font-bold text-white text-lg flex items-center gap-3">
                    <DollarSign className="w-6 h-6" />
                    Thông tin hoàn tiền
                  </h4>
                </div>
                <div className="p-6">
                  {/* Hiển thị số tiền hoàn nổi bật */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="text-center">
                      <p className="text-green-700 font-medium mb-2">Số tiền sẽ được hoàn cho khách hàng:</p>
                      <p className="text-3xl font-bold text-green-800">
                        {refundAmount.toLocaleString()} VND
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        ({refundPercent}% của {(booking.deposit_paid_amount || 0).toLocaleString()} VND đã thanh toán)
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="accountName" className="text-sm font-semibold text-gray-700">
                        Tên chủ tài khoản
                      </Label>
                      <div className="relative">
                        <Input
                          id="accountName"
                          value={formData.accountName}
                          onChange={(e) => handleInputChange("accountName", e.target.value)}
                          placeholder="Nguyễn Văn A"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="bankName" className="text-sm font-semibold text-gray-700">
                        Tên ngân hàng
                      </Label>
                      <div className="relative">
                        <Input
                          id="bankName"
                          value={formData.bankName}
                          onChange={(e) => handleInputChange("bankName", e.target.value)}
                          placeholder="Vietcombank"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Label htmlFor="accountNumber" className="text-sm font-semibold text-gray-700">
                      Số tài khoản
                    </Label>
                    <div className="relative">
                      <Input
                        id="accountNumber"
                        value={formData.accountNumber}
                        onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                        placeholder="1234567890"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Label htmlFor="refundMethod" className="text-sm font-semibold text-gray-700">
                      Phương thức hoàn tiền
                    </Label>
                    <Select
                      value={formData.refundMethod}
                      onValueChange={(value) => handleInputChange("refundMethod", value)}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer" className="flex items-center gap-2">
                          <Banknote className="w-4 h-4" />
                          Chuyển khoản ngân hàng
                        </SelectItem>
                        <SelectItem value="wallet" className="flex items-center gap-2">
                          <Wallet className="w-4 h-4" />
                          Ví điện tử
                        </SelectItem>
                        <SelectItem value="credit_card" className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Thẻ tín dụng
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Label htmlFor="refundNote" className="text-sm font-semibold text-gray-700">
                      Ghi chú thêm (tùy chọn)
                    </Label>
                    <Textarea
                      id="refundNote"
                      value={formData.refundNote}
                      onChange={(e) => handleInputChange("refundNote", e.target.value)}
                      placeholder="Thông tin bổ sung về việc hoàn tiền..."
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cảnh báo - Card đẹp */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 text-red-800 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h5 className="font-bold text-lg">Cảnh báo quan trọng</h5>
                  <p className="text-red-700 text-sm">
                    Hành động này không thể hoàn tác
                  </p>
                </div>
              </div>
              <p className="text-red-700 leading-relaxed">
                Sau khi xác nhận, booking sẽ bị hủy và khách hàng sẽ được thông báo. 
                Vui lòng đảm bảo rằng bạn đã xem xét kỹ lưỡng trước khi thực hiện.
              </p>
            </div>
          </form>
        </div>

        <DialogFooter className="flex items-center justify-between pt-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl">
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
              disabled={loading || !formData.cancellationReason.trim()}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  <span>Xác nhận hủy booking</span>
                </div>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelBookingModal;
