import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/services/api';
import {
  AlertCircle,
  FileText,
  Banknote,
  User,
  Building,
  CreditCard,
  Wallet,
  Shield,
  Info,
  DollarSign,
} from 'lucide-react';

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
    cancellationReason: cancellationDetails?.cancellationReason || '',
    accountName: cancellationDetails?.accountName || '',
    bankName: cancellationDetails?.bankName || '',
    accountNumber: cancellationDetails?.accountNumber || '',
    refundMethod: cancellationDetails?.refundMethod || '',
    refundNote: cancellationDetails?.refundNote || '',
  });

  useEffect(() => {
    if (cancellationDetails) {
      setFormData({
        cancellationReason: cancellationDetails.cancellationReason || '',
        accountName: cancellationDetails.accountName || '',
        bankName: cancellationDetails.bankName || '',
        accountNumber: cancellationDetails.accountNumber || '',
        refundMethod: cancellationDetails.refundMethod || '',
        refundNote: cancellationDetails.refundNote || '',
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
      await api.patch(`/bookings/${propertyId}/${bookingId}/cancellation-details`, formData);

      toast.success('Cập nhật thông tin hủy phòng thành công!');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật thông tin hủy phòng';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-gray-50 to-blue-50 border-0 shadow-2xl'>
        <DialogHeader className='text-center pb-6'>
          <div className='mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg'>
            <FileText className='w-8 h-8 text-white' />
          </div>
          <DialogTitle className='text-2xl font-bold text-gray-900 mb-2'>Chỉnh sửa thông tin hủy phòng</DialogTitle>
          <p className='text-gray-600 text-lg'>Cập nhật thông tin chi tiết về việc hủy phòng và hoàn tiền</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-8'>
          {/* Cancellation Reason - Card đẹp */}
          <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
            <div className='bg-gradient-to-r from-red-600 to-red-700 px-6 py-4'>
              <h3 className='font-bold text-white text-lg flex items-center gap-3'>
                <AlertCircle className='w-6 h-6' />
                Lý do hủy phòng
                <span className='text-red-200 text-sm font-normal'>(bắt buộc)</span>
              </h3>
            </div>
            <div className='p-6'>
              <div className='bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200'>
                <Textarea
                  id='cancellationReason'
                  value={formData.cancellationReason}
                  onChange={(e) => handleInputChange('cancellationReason', e.target.value)}
                  placeholder='Vui lòng nhập chi tiết lý do hủy phòng để chúng tôi có thể cải thiện dịch vụ...'
                  rows={4}
                  className='bg-white border-red-200 focus:border-red-400 focus:ring-red-400 resize-none text-base'
                  required
                />
                <div className='flex items-center gap-2 mt-3 text-red-600'>
                  <Info className='w-4 h-4' />
                  <span className='text-sm font-medium'>
                    💡 Thông tin này sẽ giúp chúng tôi cải thiện chất lượng dịch vụ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Information - Card đẹp */}
          <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
            <div className='bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4'>
              <h3 className='font-bold text-white text-lg flex items-center gap-3'>
                <DollarSign className='w-6 h-6' />
                Thông tin hoàn tiền
              </h3>
            </div>
            <div className='p-6'>
              {/* Hiển thị thông tin hoàn tiền hiện tại nếu có */}
              {cancellationDetails && (
                <div className='mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200'>
                  <div className='flex items-center gap-3 text-green-800 mb-3'>
                    <Shield className='w-5 h-5 text-green-600' />
                    <span className='font-semibold'>Thông tin hoàn tiền hiện tại:</span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                    {cancellationDetails?.accountName && (
                      <div className='flex items-center gap-2'>
                        <User className='w-4 h-4 text-green-600' />
                        <span className='text-green-700 font-medium'>Tên: {cancellationDetails.accountName}</span>
                      </div>
                    )}
                    {cancellationDetails?.bankName && (
                      <div className='flex items-center gap-2'>
                        <Building className='w-4 h-4 text-green-600' />
                        <span className='text-green-700 font-medium'>Ngân hàng: {cancellationDetails.bankName}</span>
                      </div>
                    )}
                    {cancellationDetails?.accountNumber && (
                      <div className='flex items-center gap-2'>
                        <CreditCard className='w-4 h-4 text-green-600' />
                        <span className='text-green-700 font-medium'>Số TK: {cancellationDetails.accountNumber}</span>
                      </div>
                    )}
                    {cancellationDetails?.refundMethod && (
                      <div className='flex items-center gap-2'>
                        <Wallet className='w-4 h-4 text-green-600' />
                        <span className='text-green-700 font-medium'>
                          Phương thức:{' '}
                          {cancellationDetails.refundMethod === 'bank_transfer'
                            ? 'Chuyển khoản ngân hàng'
                            : cancellationDetails.refundMethod === 'credit_card'
                            ? 'Thẻ tín dụng'
                            : cancellationDetails.refundMethod === 'wallet'
                            ? 'Ví điện tử'
                            : 'Khác'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-3'>
                  <Label htmlFor='accountName' className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                    <User className='w-4 h-4 text-blue-600' />
                    Tên chủ tài khoản
                  </Label>
                  <div className='relative'>
                    <Input
                      id='accountName'
                      value={formData.accountName}
                      onChange={(e) => handleInputChange('accountName', e.target.value)}
                      placeholder='Nguyễn Văn A'
                      className='border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl'
                    />
                  </div>
                </div>

                <div className='space-y-3'>
                  <Label htmlFor='bankName' className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                    <Building className='w-4 h-4 text-blue-600' />
                    Tên ngân hàng
                  </Label>
                  <div className='relative'>
                    <Input
                      id='bankName'
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      placeholder='Vietcombank'
                      className='border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl'
                    />
                  </div>
                </div>

                <div className='space-y-3'>
                  <Label
                    htmlFor='accountNumber'
                    className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                    <CreditCard className='w-4 h-4 text-blue-600' />
                    Số tài khoản
                  </Label>
                  <div className='relative'>
                    <Input
                      id='accountNumber'
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      placeholder='1234567890'
                      className='border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl'
                    />
                  </div>
                </div>

                {/* <div className="space-y-3">
                  <Label htmlFor="refundMethod" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    Phương thức hoàn tiền
                  </Label>
                  <Select
                    value={formData.refundMethod}
                    onValueChange={(value) =>
                      handleInputChange("refundMethod", value)
                    }
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                      <SelectValue placeholder="Chọn phương thức hoàn tiền" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer" className="flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        Chuyển khoản ngân hàng
                      </SelectItem>
                      <SelectItem value="cash" className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Tiền mặt
                      </SelectItem>
                      <SelectItem value="credit_card" className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Thẻ tín dụng
                      </SelectItem>
                      <SelectItem value="other" className="flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        Khác
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
              </div>
            </div>
          </div>

          {/* Refund Note - Card đẹp */}
          <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
            <div className='bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4'>
              <h3 className='font-bold text-white text-lg flex items-center gap-3'>
                <FileText className='w-6 h-6' />
                Ghi chú hoàn tiền
                <span className='text-purple-200 text-sm font-normal'>(tùy chọn)</span>
              </h3>
            </div>
            <div className='p-6'>
              <div className='bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200'>
                <Textarea
                  id='refundNote'
                  value={formData.refundNote}
                  onChange={(e) => handleInputChange('refundNote', e.target.value)}
                  placeholder='Nhập ghi chú về việc hoàn tiền hoặc thông tin bổ sung...'
                  rows={4}
                  className='bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400 resize-none'
                />
                <div className='flex items-center gap-2 mt-3 text-purple-600'>
                  <Info className='w-4 h-4' />
                  <span className='text-sm font-medium'>
                    💡 Ghi chú này sẽ được lưu lại để tham khảo khi xử lý hoàn tiền
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cảnh báo - Card đẹp */}
          <div className='bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 shadow-lg'>
            <div className='flex items-center gap-3 text-amber-800 mb-4'>
              <div className='w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center'>
                <Info className='w-6 h-6 text-amber-600' />
              </div>
              <div>
                <h5 className='font-bold text-lg'>Lưu ý quan trọng</h5>
                <p className='text-amber-700 text-sm'>Thông tin này sẽ được cập nhật vào hệ thống</p>
              </div>
            </div>
            <p className='text-amber-700 leading-relaxed'>
              Sau khi cập nhật, thông tin hủy phòng sẽ được lưu lại và có thể được chỉnh sửa sau này. Vui lòng kiểm tra
              kỹ thông tin trước khi xác nhận.
            </p>
          </div>
        </form>

        {/* Action Buttons - Footer đẹp */}
        <div className='flex items-center justify-between pt-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl'>
          <div className='text-sm text-gray-500 font-mono'>Booking ID: {bookingId}</div>

          <div className='flex items-center gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={loading}
              className='px-6 py-2 rounded-xl border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200'>
              Hủy
            </Button>
            <Button
              type='submit'
              onClick={handleSubmit}
              disabled={loading || !formData.cancellationReason.trim()}
              className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50'>
              {loading ? (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent' />
                  <span>Đang cập nhật...</span>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <FileText className='w-5 h-5' />
                  <span>Cập nhật thông tin</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCancellationModal;
