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
  AlertCircle, 
  FileText, 
  Banknote, 
  User, 
  Building, 
  CreditCard, 
  Wallet,
  Info,
  DollarSign,
  XCircle,
  Shield
} from "lucide-react";
import type { Booking } from "@/types/booking.interface";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
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
    refundMethod: "bank_transfer", // Tự động set là chuyển khoản ngân hàng
    refundNote: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cancellationReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy phòng!");
      return;
    }

    setLoading(true);

         try {
               // Gọi API hủy booking với đầy đủ thông tin
        let propertyId = '';
        
        if (typeof booking.propertyId === 'string') {
          propertyId = booking.propertyId;
        } else if (booking.propertyId && typeof booking.propertyId === 'object') {
          const property = booking.propertyId as { _id?: string };
          propertyId = property._id || '';
        }
          
        if (!propertyId) {
          toast.error("Không tìm thấy Property ID!");
          return;
        }

        console.log('Debug - Property ID:', propertyId);
        console.log('Debug - Booking propertyId:', booking.propertyId);

        await api.patch(
            `/bookings/admin/${propertyId}/${booking._id}/cancel`,
          {
             // Backend cần propertyId trong body để @RequirePropertyStaff decorator
            cancellationReason: formData.cancellationReason,
            accountName: formData.accountName,
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            refundMethod: formData.refundMethod,
            refundNote: formData.refundNote,
          }
        );

      toast.success("Hủy booking thành công!");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi hủy booking";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-red-50 to-orange-50 border-0 shadow-2xl">
                 <DialogHeader className="text-center pb-6">
           <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
            Hủy booking
          </DialogTitle>
          <p className="text-gray-600 text-lg">
            Vui lòng điền thông tin chi tiết về việc hủy phòng và hoàn tiền
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
                   <p className="font-medium text-gray-900">{typeof booking.guest_name === 'string' ? booking.guest_name : 'Khách hàng'}</p>
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

           {/* Cancellation Policy & Refund Info - Card mới */}
           <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
             <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
               <h3 className="font-bold text-white text-lg flex items-center gap-3">
                 <Shield className="w-6 h-6" />
                 Chính sách hủy & Hoàn tiền
               </h3>
             </div>
             <div className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Chính sách hủy */}
                 <div className="space-y-3">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                     <span className="text-sm font-semibold text-gray-700">Chính sách hủy:</span>
                   </div>
                   <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                     {(() => {
                       const policy = booking.cancel_policy?.toLowerCase() || 'flexible';
                       const checkInDate = new Date(booking.checkInDate);
                       const today = new Date();
                       const daysBeforeCheckIn = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                       
                       switch (policy) {
                         case 'flexible':
                           return (
                             <div className="text-emerald-800">
                               <p className="font-semibold text-sm mb-2">🎯 Flexible (Linh hoạt)</p>
                               <p className="text-xs leading-relaxed">
                                 Hủy trước ngày check-in: <span className="font-bold">Hoàn 100%</span><br/>
                                 Hủy trong ngày check-in: <span className="font-bold">Hoàn 100%</span><br/>
                                 <span className="text-emerald-600">📅 Còn {daysBeforeCheckIn} ngày đến check-in</span>
                               </p>
                             </div>
                           );
                         case 'moderate':
                           return (
                             <div className="text-amber-800">
                               <p className="font-semibold text-sm mb-2">⚖️ Moderate (Vừa phải)</p>
                               <p className="text-xs leading-relaxed">
                                 Hủy trước 7 ngày: <span className="font-bold">Hoàn 100%</span><br/>
                                 Hủy trong 7 ngày: <span className="font-bold">Hoàn 50%</span><br/>
                                 Hủy trong ngày check-in: <span className="font-bold">Không hoàn tiền</span><br/>
                                 <span className="text-amber-600">📅 Còn {daysBeforeCheckIn} ngày đến check-in</span>
                               </p>
                             </div>
                           );
                         case 'strict':
                           return (
                             <div className="text-red-800">
                               <p className="font-semibold text-sm mb-2">🚫 Strict (Nghiêm ngặt)</p>
                               <p className="text-xs leading-relaxed">
                                 Hủy trước 7 ngày: <span className="font-bold">Hoàn 50%</span><br/>
                                 Hủy trong 7 ngày: <span className="font-bold">Không hoàn tiền</span><br/>
                                 <span className="text-red-600">📅 Còn {daysBeforeCheckIn} ngày đến check-in</span>
                               </p>
                             </div>
                           );
                         default:
                           return (
                             <div className="text-gray-800">
                               <p className="font-semibold text-sm mb-2">❓ Không xác định</p>
                               <p className="text-xs">Vui lòng liên hệ để biết thêm chi tiết</p>
                             </div>
                           );
                       }
                     })()}
                   </div>
                 </div>

                 {/* Thông tin hoàn tiền dự kiến */}
                 <div className="space-y-3">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                     <span className="text-sm font-semibold text-gray-700">Hoàn tiền dự kiến:</span>
                   </div>
                   <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                     {(() => {
                       const policy = booking.cancel_policy?.toLowerCase() || 'flexible';
                       const checkInDate = new Date(booking.checkInDate);
                       const today = new Date();
                       const daysBeforeCheckIn = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                       const paidAmount = booking.deposit_paid_amount || 0;
                       
                       let refundPercent = 0;
                       let refundAmount = 0;
                       
                       switch (policy) {
                         case 'flexible':
                           refundPercent = 100;
                           break;
                         case 'moderate':
                           if (daysBeforeCheckIn > 7) {
                             refundPercent = 100;
                           } else if (daysBeforeCheckIn >= 0) {
                             refundPercent = 50;
                           } else {
                             refundPercent = 0;
                           }
                           break;
                         case 'strict':
                           if (daysBeforeCheckIn > 7) {
                             refundPercent = 50;
                           } else {
                             refundPercent = 0;
                           }
                           break;
                         default:
                           refundPercent = 0;
                       }
                       
                       refundAmount = Math.round((paidAmount * refundPercent) / 100);
                       
                       return (
                         <div className="text-blue-800">
                           <div className="mb-3">
                             <p className="text-xs text-blue-600 mb-1">Còn {daysBeforeCheckIn} ngày đến check-in</p>
                             <p className="text-xs text-blue-600 mb-1">Số tiền đã thanh toán: <span className="font-bold">{paidAmount.toLocaleString()} VND</span></p>
                           </div>
                           <div className="bg-white rounded-lg p-3 border border-blue-300">
                             <p className="text-sm font-semibold mb-2">Tỷ lệ hoàn tiền: <span className="text-lg text-blue-600">{refundPercent}%</span></p>
                             <p className="text-lg font-bold text-blue-700">
                               Số tiền được hoàn: <span className="text-xl">{refundAmount.toLocaleString()} VND</span>
                             </p>
                           </div>
                         </div>
                       );
                     })()}
                   </div>
                 </div>
               </div>
             </div>
           </div>

          {/* Cancellation Reason - Card đẹp */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-3">
                <AlertCircle className="w-6 h-6" />
                Lý do hủy phòng
                <span className="text-red-200 text-sm font-normal">(bắt buộc)</span>
              </h3>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
                <Textarea
                  id="cancellationReason"
                  value={formData.cancellationReason}
                  onChange={(e) =>
                    handleInputChange("cancellationReason", e.target.value)
                  }
                  placeholder="Vui lòng nhập chi tiết lý do hủy phòng để chúng tôi có thể cải thiện dịch vụ..."
                  rows={4}
                  className="bg-white border-red-200 focus:border-red-400 focus:ring-red-400 resize-none text-base"
                  required
                />
                <div className="flex items-center gap-2 mt-3 text-red-600">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    💡 Thông tin này sẽ giúp chúng tôi cải thiện chất lượng dịch vụ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Information - Card đẹp */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-3">
                <DollarSign className="w-6 h-6" />
                Thông tin hoàn tiền
                <span className="text-blue-200 text-sm font-normal">(tùy chọn)</span>
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="accountName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Tên chủ tài khoản
                  </Label>
                  <div className="relative">
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
                </div>

                <div className="space-y-3">
                  <Label htmlFor="bankName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    Tên ngân hàng
                  </Label>
                  <div className="relative">
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
                </div>

                <div className="space-y-3">
                  <Label htmlFor="accountNumber" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Số tài khoản
                  </Label>
                  <div className="relative">
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

                <div className="space-y-3">
                  <Label htmlFor="refundMethod" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    Phương thức hoàn tiền
                  </Label>
                                     <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                     <div className="flex items-center gap-2 text-blue-800">
                       <Banknote className="w-4 h-4 text-blue-600" />
                       <span className="font-medium">Chuyển khoản ngân hàng</span>
                     </div>
                     <p className="text-sm text-blue-600 mt-1">
                       Thông tin hoàn tiền sẽ được chuyển qua tài khoản ngân hàng
                     </p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Note - Card đẹp */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-3">
                <FileText className="w-6 h-6" />
                Ghi chú hoàn tiền
                <span className="text-purple-200 text-sm font-normal">(tùy chọn)</span>
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
                  placeholder="Nhập ghi chú về việc hoàn tiền hoặc thông tin bổ sung..."
                  rows={4}
                  className="bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400 resize-none"
                />
                <div className="flex items-center gap-2 mt-3 text-purple-600">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    💡 Ghi chú này sẽ được lưu lại để tham khảo khi xử lý hoàn tiền
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cảnh báo - Card đẹp */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 text-amber-800 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h5 className="font-bold text-lg">Lưu ý quan trọng</h5>
                <p className="text-amber-700 text-sm">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>
            <p className="text-amber-700 leading-relaxed">
              Sau khi xác nhận, booking sẽ được hủy và thông tin hoàn tiền sẽ được lưu lại. 
              Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.
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
              disabled={loading || !formData.cancellationReason.trim()}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Đang hủy...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  <span>Xác nhận hủy booking</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancelBookingModal;
