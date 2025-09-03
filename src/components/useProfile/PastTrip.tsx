import React, { useEffect, useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';

import { useDispatch, useSelector } from 'react-redux';

import { RootState, AppDispatch } from '@/store';

import { getMyBookingHistory } from '@/store/slices/bookingSlice';

import { BookingData, isListingObj } from '@/types/booking';

import { BookingStatus, PaymentStatus, CancelPolicy } from '@/types/enum';

import { api } from '@/services/api';

import { SERVICE_CONSTANTS, SERVICE_MESSAGES } from '@/constants/service';

import { toast } from 'sonner';

import {
  Calendar,
  DollarSign,
  FileText,
  Star,
  Redo,

  // MessageCircle,
  X,
  Info,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Package,
  AlertCircle,
  Tag,
} from 'lucide-react';

import { format, subDays } from 'date-fns';

import { postReview } from '@/store/slices/reviewSlice';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

import { Textarea } from '@/components/ui/textarea';

import { Input } from '@/components/ui/input';

import { useNavigate, Link } from 'react-router-dom';

import { Checkbox } from '@/components/ui/checkbox';

import { Label } from '@/components/ui/label';

import MessageHostDialog from '../roomdetail/MessageHostDialog';
import { RefundMethod } from '@/types/cancel-booking.interface';

const STATUS_UPCOMING = [BookingStatus.PENDING, BookingStatus.CONFIRMED];

// Helper function to extract property ID string from booking.propertyId

const getPropertyIdString = (
  propertyId: string | { _id: string; name: string; type?: string } | undefined,
): string | null => {
  if (!propertyId) return null;

  if (typeof propertyId === 'string') {
    return propertyId;
  }

  if (typeof propertyId === 'object' && propertyId._id) {
    return propertyId._id;
  }

  return null;
};

type BookingWithStatus = BookingData;

const canCancelBooking = (booking: BookingWithStatus) => {
  // Không cho phép hủy nếu:

  // - Booking đã bị hủy

  // - Booking đã hoàn thành

  // - Booking bị từ chối

  if (
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.COMPLETED ||
    booking.status === BookingStatus.REJECTED
  ) {
    return false;
  }

  // Chỉ cho phép hủy booking có status PENDING hoặc CONFIRMED

  if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
    return false;
  }

  // Không cho phép hủy nếu đã qua ngày check-in

  if (!booking.checkInDate) {
    return false;
  }

  // Sử dụng múi giờ Việt Nam

  const checkInDate = new Date(booking.checkInDate);

  // Lấy thời gian hiện tại theo múi giờ Việt Nam

  const now = new Date();

  const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

  // Cho phép hủy đến trước giờ check-in (14:00) theo múi giờ Việt Nam

  const checkInDeadline = new Date(checkInDate);

  checkInDeadline.setHours(14, 0, 0, 0); // 14:00 giờ Việt Nam

  if (vietnamTime >= checkInDeadline) {
    return false;
  }

  // Nếu không có cancel_policy, mặc định là moderate

  const policy = booking.cancel_policy || CancelPolicy.MODERATE;

  let canCancel = false;

  // So sánh không phân biệt hoa thường

  const policyUpper = policy.toUpperCase();

  switch (policyUpper) {
    case CancelPolicy.FLEXIBLE: {
      // Flexible: Hủy trước 1 ngày → hoàn 100%

      const oneDayBefore = new Date(checkInDate);

      oneDayBefore.setDate(oneDayBefore.getDate() - 1);

      oneDayBefore.setHours(14, 0, 0, 0); // 14:00 giờ Việt Nam

      canCancel = vietnamTime < oneDayBefore;

      break;
    }

    case CancelPolicy.MODERATE: {
      // Moderate: Hủy trước 5 ngày → hoàn 100%

      const fiveDaysBefore = new Date(checkInDate);

      fiveDaysBefore.setDate(fiveDaysBefore.getDate() - 5);

      fiveDaysBefore.setHours(14, 0, 0, 0); // 14:00 giờ Việt Nam

      canCancel = vietnamTime < fiveDaysBefore;

      break;
    }

    case CancelPolicy.STRICT:
      // Strict: Không cho phép hủy

      canCancel = false;

      break;

    default: {
      // Mặc định xử lý như moderate policy

      const fiveDaysBefore = new Date(checkInDate);

      fiveDaysBefore.setDate(fiveDaysBefore.getDate() - 5);

      fiveDaysBefore.setHours(14, 0, 0, 0); // 14:00 giờ Việt Nam

      canCancel = vietnamTime < fiveDaysBefore;
    }
  }

  return canCancel;
};

// Custom hook lấy bookedDates cho nhiều listingId

function useAllBookedDates(listingIds: string[]) {
  const [bookedDatesByListing, setBookedDatesByListing] = useState<Record<string, Date[]>>({});

  useEffect(() => {
    let isMounted = true;

    async function fetchAll() {
      console.log('🔄 Fetching booked dates for listingIds:', listingIds);

      const results: Record<string, Date[]> = {};

      for (const id of listingIds) {
        try {
          const res = await api.get(`/bookings/booked-dates/${id}`);

          const rawDates = res.data?.data?.bookedDates || [];

          const converted = rawDates.map((d: string) => {
            const [year, month, day] = d.split('-');

            return new Date(Number(year), Number(month) - 1, Number(day));
          });

          results[id] = converted;

          console.log(`📅 Booked dates for listing ${id}:`, {
            rawDates,

            converted: converted.map((d: Date) => d.toISOString().split('T')[0]),
          });
        } catch (error) {
          console.error(
            `❌ Error fetching booked dates for listing ${id}:`,

            error,
          );

          results[id] = [];
        }
      }

      if (isMounted) {
        setBookedDatesByListing(results);

        console.log(
          '✅ Final bookedDatesByListing:',

          Object.keys(results).reduce((acc, key) => {
            acc[key] = results[key].map((d: Date) => d.toISOString().split('T')[0]);

            return acc;
          }, {} as Record<string, string[]>),
        );
      }
    }

    if (listingIds.length > 0) fetchAll();

    return () => {
      isMounted = false;
    };
  }, [listingIds.join(',')]);

  return bookedDatesByListing;
}

const PastTrip = () => {
  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();

  const { myBookingHistory, loading, error } = useSelector((state: RootState) => {
    return state.booking;
  });

  const user = useSelector((state: RootState) => state.auth.user);

  // Lấy tất cả listingId duy nhất từ bookings

  const listingIds = Array.from(
    new Set(
      ((myBookingHistory as BookingWithStatus[]) || [])

        .map((b) => (b.listingId && typeof b.listingId === 'object' && '_id' in b.listingId ? b.listingId._id : null))

        .filter(Boolean),
    ),
  ) as string[];

  const bookedDatesByListing = useAllBookedDates(listingIds);

  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');

  const [selectedBooking, setSelectedBooking] = useState<BookingWithStatus | null>(null);

  const [showDetail, setShowDetail] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);

  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<BookingWithStatus | null>(null);

  const [showReviewModal, setShowReviewModal] = useState(false);

  const [selectedBookingForReview, setSelectedBookingForReview] = useState<BookingWithStatus | null>(null);

  const [reviewRating, setReviewRating] = useState(5);

  const [reviewComment, setReviewComment] = useState('');

  const [reviewLoading, setReviewLoading] = useState(false);

  const [payRemainderLoadingId, setPayRemainderLoadingId] = useState<string | null>(null);

  // State cho thêm dịch vụ

  const [selectedBookingForService, setSelectedBookingForService] = useState<BookingWithStatus | null>(null);

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  const [availableServices, setAvailableServices] = useState<
    Array<{
      _id: string;

      name: string;

      description?: string;

      default_price: number;

      unit: string;

      allow_quantity?: boolean;
    }>
  >([]);

  const [selectedServices, setSelectedServices] = useState<{
    [key: string]: number;
  }>({});

  const [addServiceLoading, setAddServiceLoading] = useState(false);

  const [showCancellationDetailsModal, setShowCancellationDetailsModal] = useState(false);

  const [selectedCancellationBooking, setSelectedCancellationBooking] = useState<BookingWithStatus | null>(null);

  // State cho modal xem ảnh toàn màn
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');

  // State để lưu trữ thông tin booking conflict

  const [bookingConflicts, setBookingConflicts] = useState<Record<string, boolean>>({});

  // Log khi bookingConflicts thay đổi

  useEffect(() => {
    console.log('🔄 bookingConflicts state changed:', bookingConflicts);
  }, [bookingConflicts]);

  useEffect(() => {
    dispatch(getMyBookingHistory(undefined))
      .then(() => {})

      .catch((error) => {
        console.error('API Error:', error);
      });
  }, [dispatch]);

  // Log cancel_policy khi mở modal hủy

  useEffect(() => {
    if (showCancelModal && selectedBookingForCancel) {
      // Log đã được xóa
    }
  }, [showCancelModal, selectedBookingForCancel]);

  const bookings: BookingWithStatus[] = useMemo(
    () => (myBookingHistory as BookingWithStatus[]) || [],

    [myBookingHistory],
  );

  // Log tất cả bookings để debug

  useEffect(() => {
    console.log(
      '📋 All bookings debug:',

      bookings.map((booking) => ({
        id: booking._id,

        status: booking.status,

        payment_status: booking.payment_status,

        checkInDate: booking.checkInDate,

        checkOutDate: booking.check_out_date,

        final_amount: booking.final_amount,

        deposit_paid_amount: booking.deposit_paid_amount,
      })),
    );
  }, [bookings]);

  // Kiểm tra booking conflicts cho các booking pending/failed

  useEffect(() => {
    const checkBookingConflicts = async () => {
      console.log('🚀 Starting booking conflicts check...');

      console.log('📊 Current bookings:', bookings);

      const conflicts: { [key: string]: boolean } = {};

      for (const booking of bookings) {
        console.log(`🔍 Checking booking ${booking._id}:`, {
          status: booking.status,

          payment_status: booking.payment_status,

          checkInDate: booking.checkInDate,

          check_out_date: booking.check_out_date,

          listingId: booking.listingId,
        });

        // Chỉ kiểm tra cho các booking pending hoặc failed payment

        if (booking.payment_status === PaymentStatus.PENDING || booking.payment_status === PaymentStatus.FAILED) {
          console.log(`✅ Booking ${booking._id} qualifies for conflict check`);

          try {
            const listing = booking.listingId;

            const listingId = listing && typeof listing === 'object' && '_id' in listing ? listing._id : listing;

            console.log(`🏠 Listing ID for booking ${booking._id}:`, listingId);

            if (listingId) {
              const apiUrl = `/bookings/check-booking-conflict/${listingId}`;

              const params = {
                checkInDate: booking.checkInDate,

                checkOutDate: booking.check_out_date,

                excludeBookingId: booking._id,
              };

              console.log(`🌐 Making API call for booking ${booking._id}...`);

              console.log(`🔗 API URL: ${apiUrl}`);

              console.log(`📋 API Params:`, params);

              const response = await api.get(apiUrl, { params });

              console.log(
                `📡 API Response for booking ${booking._id}:`,

                response.data,
              );

              conflicts[booking._id] = response.data?.data?.hasConflict || false;

              console.log('🔍 API conflict check result:', {
                bookingId: booking._id,

                hasConflict: conflicts[booking._id],

                responseData: response.data,
              });
            } else {
              console.log(`❌ No listing ID found for booking ${booking._id}`);
            }
          } catch (error) {
            console.error(
              `❌ Error checking conflict for booking ${booking._id}:`,

              error,
            );

            if (error && typeof error === 'object' && 'message' in error) {
              const errorObj = error as {
                message?: string;

                response?: {
                  status?: number;

                  data?: unknown;
                };

                config?: unknown;
              };

              console.error(`❌ Error details:`, {
                message: errorObj.message,

                status: errorObj.response?.status,

                data: errorObj.response?.data,

                config: errorObj.config,
              });
            }

            conflicts[booking._id] = false;
          }
        } else {
          console.log(`⏭️ Skipping booking ${booking._id} - doesn't qualify for conflict check`);
        }
      }

      console.log('📋 Final conflicts object:', conflicts);

      console.log('🔄 Setting bookingConflicts state...');

      setBookingConflicts(conflicts);

      console.log('✅ bookingConflicts state updated');
    };

    if (bookings.length > 0) {
      console.log(
        '🔄 useEffect triggered - checking conflicts for',

        bookings.length,

        'bookings',
      );

      checkBookingConflicts();
    } else {
      console.log('⏭️ No bookings to check conflicts for');
    }
  }, [bookings]);

  // Debug: Log tất cả bookings để kiểm tra

  console.log(
    '📋 All bookings:',

    bookings.map((b) => ({
      id: b._id,

      status: b.status,

      payment_status: b.payment_status,

      checkInDate: b.checkInDate,

      checkOutDate: b.check_out_date,

      final_amount: b.final_amount,

      deposit_paid_amount: b.deposit_paid_amount,
    })),
  );

  // Phân loại booking - Fixed filtering logic

  const upcomingBookings = bookings.filter((b) => {
    const checkInDate = new Date(b.checkInDate);

    const now = new Date(); // Local now for accurate comparison

    const isUpcoming =
      (STATUS_UPCOMING.includes(b.status as BookingStatus) && checkInDate > now) ||
      (b.payment_status === PaymentStatus.PENDING && checkInDate > now) ||
      (b.status === BookingStatus.PENDING && checkInDate > now);

    console.log('Filtering booking:', {
      bookingId: b._id,

      status: b.status,

      payment_status: b.payment_status,

      checkInDate: checkInDate,

      now: now,

      isUpcoming: isUpcoming,

      isStatusUpcoming: STATUS_UPCOMING.includes(b.status as BookingStatus),

      isPaymentPending: b.payment_status === PaymentStatus.PENDING,
    });

    return isUpcoming;
  });

  const ongoingBookings = bookings.filter((b) => {
    const checkInDate = new Date(b.checkInDate);

    const checkOutDate = new Date(b.check_out_date);

    const now = new Date(); // Local now for accurate comparison

    return STATUS_UPCOMING.includes(b.status as BookingStatus) && checkInDate <= now && checkOutDate >= now;
  });

  // Sửa: coi CONFIRMED hoặc PAID đã qua ngày checkout là completed (FE logic)

  const historyBookings = bookings.filter((b) => {
    const checkOutDate = new Date(b.check_out_date);

    const now = new Date(); // Local now for accurate comparison

    const result =
      // Các booking đã hoàn thành (status completed hoặc đã checkout)

      b.status === BookingStatus.COMPLETED ||
      ((b.status === BookingStatus.CONFIRMED || b.payment_status === PaymentStatus.PAID) && checkOutDate < now) ||
      // Các booking đã hủy

      b.status === BookingStatus.CANCELLED ||
      // Các booking bị từ chối

      b.status === BookingStatus.REJECTED ||
      // Các booking thanh toán thất bại (chỉ khi đã qua ngày check-in)

      (b.payment_status === PaymentStatus.FAILED && new Date(b.checkInDate) < now) ||
      // Các booking đã hoàn tiền

      b.payment_status === PaymentStatus.REFUNDED;

    // Loại trừ booking PENDING khỏi history

    if (b.payment_status === PaymentStatus.PENDING || b.status === BookingStatus.PENDING) {
      return false;
    }

    return result;
  });

  // Thêm PaymentStatus.PARTIALLY_PAID vào import

  const handleShowDetail = (booking: BookingWithStatus) => {
    setSelectedBooking(booking);

    setShowDetail(true);
  };

  const handleCancelBooking = (booking: BookingWithStatus) => {
    setSelectedBookingForCancel(booking);

    setShowCancelModal(true);
  };

  const handlePayRemainder = async (bookingId: string) => {
    setPayRemainderLoadingId(bookingId);

    try {
      // Tìm booking để lấy thông tin dịch vụ

      const booking = bookings.find((b) => b._id === bookingId);

      if (!booking) {
        toast.error('Không tìm thấy thông tin booking');

        return;
      }

      // Tính tổng chi phí dịch vụ cần thanh toán

      const servicesTotal =
        booking.selected_services?.reduce((total, service) => {
          const quantity = service.quantity || 1;

          const price = service.service_price || 0;

          return total + quantity * price;
        }, 0) || 0;

      console.log('💰 Sending payment for services:', {
        bookingId,

        servicesTotal,

        selected_services: booking.selected_services,
      });

      const res = await api.post(`/bookings/${bookingId}/payment/remaining`, {
        paymentMethod: 'vnpay',

        amount: servicesTotal, // Truyền số tiền chính xác
      });

      const paymentUrl = res.data?.data?.paymentUrl;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.error('Không lấy được link thanh toán phần còn lại.');
      }
    } catch {
      toast.error('Có lỗi khi tạo thanh toán phần còn lại.');
    } finally {
      setPayRemainderLoadingId(null);
    }
  };

  // Functions cho thêm dịch vụ

  const handleAddService = async (booking: BookingWithStatus) => {
    setSelectedBookingForService(booking);

    setShowAddServiceModal(true);

    setSelectedServices({});

    // Lấy danh sách dịch vụ có sẵn

    try {
      const res = await api.get('/services/active');

      console.log('Available services response:', res.data);

      setAvailableServices(res.data.data || []);
    } catch (error) {
      console.error('Error loading services:', error);

      toast.error('Không thể tải danh sách dịch vụ');
    }
  };

  const handleServiceSelection = (serviceId: string, checked: boolean) => {
    console.log('Service selection:', serviceId, checked);

    if (checked) {
      setSelectedServices((prev) => {
        const newState = { ...prev, [serviceId]: 1 };

        console.log('Updated selected services:', newState);

        return newState;
      });
    } else {
      setSelectedServices((prev) => {
        const newState = { ...prev };

        delete newState[serviceId];

        console.log('Updated selected services:', newState);

        return newState;
      });
    }
  };

  // const handleServiceQuantityChange = (serviceId: string, quantity: number) => {

  //   if (quantity > 0) {

  //     setSelectedServices((prev) => ({ ...prev, [serviceId]: quantity }));

  //   } else {

  //     setSelectedServices((prev) => {

  //       const newState = { ...prev };

  //       delete newState[serviceId];

  //       return newState;

  //     });

  //   }

  // };

  const handleConfirmAddServices = async () => {
    if (!selectedBookingForService || Object.keys(selectedServices).length === 0) {
      toast.error('Vui lòng chọn ít nhất một dịch vụ');

      return;
    }

    // Validate quantities against allow_quantity and limits

    for (const [serviceId, quantity] of Object.entries(selectedServices)) {
      const service = availableServices.find((s) => s._id === serviceId);

      if (!service) continue;

      if (!service.allow_quantity && quantity > 1) {
        toast.error(`Dịch vụ "${service.name}" không cho phép chọn số lượng. Chỉ có thể chọn 1 lần.`);

        return;
      }

      if (quantity > SERVICE_CONSTANTS.MAX_QUANTITY) {
        toast.error(SERVICE_MESSAGES.MAX_QUANTITY_EXCEEDED);

        return;
      }

      if (quantity < SERVICE_CONSTANTS.MIN_QUANTITY) {
        toast.error(SERVICE_MESSAGES.MIN_QUANTITY_REQUIRED);

        return;
      }
    }

    setAddServiceLoading(true);

    try {
      // Tạo danh sách dịch vụ mới được chọn

      const newSelectedServicesArray = Object.entries(selectedServices).map(([serviceId, quantity]) => ({
        serviceId,

        quantity,
      }));

      // Lấy danh sách dịch vụ cũ từ booking

      const existingServicesArray =
        selectedBookingForService.selected_services?.map(
          (service: {
            service_id?: string;

            _id?: string;

            quantity?: number;
          }) => ({
            serviceId: service.service_id || service._id, // Thêm cả service_id và _id

            quantity: service.quantity || 1,
          }),
        ) || [];

      // Kết hợp dịch vụ cũ và mới

      const allServicesArray = [...existingServicesArray, ...newSelectedServicesArray];

      console.log('Sending all services:', allServicesArray);

      // Sử dụng API dành cho guest

      const response = await api.patch(
        `/bookings/my-bookings/${selectedBookingForService._id}`,

        {
          selected_services: allServicesArray,
        },
      );

      console.log('API Response:', response.data);

      toast.success('Thêm dịch vụ thành công!');

      setShowAddServiceModal(false);

      setSelectedServices({});

      // Refresh booking list

      dispatch(getMyBookingHistory(undefined));
    } catch (error: unknown) {
      console.error('Error adding services:', error);

      const errorMessage = error instanceof Error ? error.message : 'Có lỗi khi thêm dịch vụ';

      toast.error(errorMessage);
    } finally {
      setAddServiceLoading(false);
    }
  };

  const handleShowCancellationDetails = (booking: BookingWithStatus) => {
    setSelectedCancellationBooking(booking);

    setShowCancellationDetailsModal(true);
  };

  const handleShowImageModal = (imageUrl: string) => {
    console.log('🔍 Opening image modal with URL:', imageUrl);
    console.log('🔍 Current showImageModal state:', showImageModal);
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
  };

  // Hiển thị thông tin hủy phòng

  const renderCancellationInfo = (booking: BookingWithStatus) => {
    if (booking.status !== BookingStatus.CANCELLED) return null;

    return (
      <div className='mt-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200 shadow-sm overflow-hidden'>
        <div className='p-6'>
          <button onClick={() => handleShowCancellationDetails(booking)} className='w-full text-left group'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors'>
                  <XCircle size={20} className='text-red-600' />
                </div>

                <div>
                  <h4 className='text-lg font-semibold text-red-900 group-hover:text-red-800 transition-colors'>
                    {booking.payment_status === PaymentStatus.REFUNDED
                      ? 'Thông tin hoàn tiền'
                      : 'Thông tin đang hoàn tiền'}
                  </h4>

                  <p className='text-sm text-red-600 font-medium'>
                    {booking.payment_status === PaymentStatus.REFUNDED
                      ? 'Đã hoàn tiền thành công'
                      : 'Đang xử lý hoàn tiền'}{' '}
                    - Nhấn để xem chi tiết
                  </p>
                </div>
              </div>

              <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors'>
                <Info size={16} className='text-red-600' />
              </div>
            </div>
          </button>

          <div className='space-y-4'>
            {booking.cancellation_reason && (
              <div className='bg-white rounded-lg p-4 border border-red-100 shadow-sm'>
                <div className='flex items-start gap-3'>
                  <div className='w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0'>
                    <AlertCircle size={14} className='text-red-600' />
                  </div>

                  <div className='flex-1'>
                    <h5 className='font-medium text-red-900 mb-1'>Lý do hủy phòng</h5>

                    <p className='text-sm text-red-700'>{booking.cancellation_reason}</p>
                  </div>
                </div>
              </div>
            )}

            {booking.cancellationDetails && (
              <div className='bg-white rounded-lg p-4 border border-red-100 shadow-sm'>
                <div className='flex items-start gap-3'>
                  <div className='w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0'>
                    <Info size={14} className='text-red-600' />
                  </div>

                  <div className='flex-1'>
                    <h5 className='font-medium text-red-900 mb-2'>Thông tin hoàn tiền</h5>

                    <div className='space-y-2 text-sm'>
                      {booking.cancellationDetails.accountName && (
                        <div>
                          <span className='font-medium text-red-800'>Tên tài khoản:</span>{' '}
                          {booking.cancellationDetails.accountName}
                        </div>
                      )}

                      {booking.cancellationDetails.bankName && (
                        <div>
                          <span className='font-medium text-red-800'>Ngân hàng:</span>{' '}
                          {booking.cancellationDetails.bankName}
                        </div>
                      )}

                      {booking.cancellationDetails.accountNumber && (
                        <div>
                          <span className='font-medium text-red-800'>Số tài khoản:</span>{' '}
                          {booking.cancellationDetails.accountNumber}
                        </div>
                      )}

                      {booking.cancellationDetails.refundMethod && (
                        <div>
                          <span className='font-medium text-red-800'>Phương thức hoàn tiền:</span>{' '}
                          {booking.cancellationDetails.refundMethod === RefundMethod.BANK_TRANSFER
                            ? 'Chuyển khoản ngân hàng'
                            : booking.cancellationDetails.refundMethod === RefundMethod.CREDIT_CARD
                            ? 'Thẻ tín dụng'
                            : booking.cancellationDetails.refundMethod === RefundMethod.WALLET
                            ? 'Ví điện tử'
                            : 'Khác'}
                        </div>
                      )}

                      {booking.cancellationDetails.refundNote && (
                        <div>
                          <span className='font-medium text-red-800'>Ghi chú:</span>{' '}
                          {booking.cancellationDetails.refundNote}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hiển thị ảnh minh chứng hoàn tiền nếu có */}
            {booking.cancellationDetails?.refundImageUrls && booking.cancellationDetails.refundImageUrls.length > 0 && (
              <>
                {/* Debug: Log URLs */}
                {console.log('🔍 Refund image URLs:', booking.cancellationDetails.refundImageUrls)}
                {console.log(
                  '🔍 CDN URL pattern check:',
                  booking.cancellationDetails.refundImageUrls.map((url) =>
                    url.includes('digitaloceanspaces.com') ? '✅ Valid CDN URL' : '❌ Invalid CDN URL',
                  ),
                )}

                <div className='bg-white rounded-lg p-4 border border-red-100 shadow-sm'>
                  <div className='flex items-start gap-3'>
                    <div className='w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0'>
                      <Info size={14} className='text-red-600' />
                    </div>
                    <div className='flex-1'>
                      <h5 className='font-medium text-red-900 mb-3'>Ảnh minh chứng hoàn tiền</h5>
                      <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                        {booking.cancellationDetails.refundImageUrls.map((imageUrl, index) => (
                          <div key={index} className='relative group'>
                            <img
                              src={imageUrl}
                              alt={`Minh chứng hoàn tiền ${index + 1}`}
                              crossOrigin='anonymous'
                              className='w-full h-auto max-h-24 object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity bg-white'
                              style={{
                                display: 'block',
                                backgroundColor: 'white',
                                minHeight: '60px',
                                maxHeight: '96px',
                              }}
                              onClick={() => {
                                // Mở ảnh trong modal toàn màn
                                handleShowImageModal(imageUrl);
                              }}
                              onError={(e) => {
                                console.error(`Failed to load refund image ${index + 1}:`, imageUrl);
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                              onLoad={(e) => {
                                console.log(`Successfully loaded refund image ${index + 1}:`, imageUrl);
                                // Đảm bảo ảnh hiển thị đúng
                                const img = e.target as HTMLImageElement;
                                img.style.display = 'block';
                                img.style.backgroundColor = 'white';
                                console.log(`Image ${index + 1} dimensions:`, {
                                  width: img.naturalWidth,
                                  height: img.naturalHeight,
                                  display: img.style.display,
                                  backgroundColor: img.style.backgroundColor,
                                });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <p className='text-xs text-red-600 mt-2'>💡 Nhấn vào ảnh để xem chi tiết</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBooking = (booking: BookingWithStatus) => {
    // Lấy object listing trực tiếp từ booking.listingId
    const listing: { _id?: string; images?: string[]; title?: string } | string = booking.listingId;

    let image = '/placeholder.svg';
    let title = 'Phòng không có tiêu đề';

    if (listing && typeof listing === 'object') {
      image = listing.images?.[0] || '/placeholder.svg';
      title = listing.title || 'Phòng không có tiêu đề';
    }

    // Xác định trạng thái hiển thị
    let statusDisplay = '';
    let statusColor = '';
    let showPaymentButton = false;
    let showPayRemainderButton = false;

    // Kiểm tra ngày đã được đặt (di chuyển lên trước để sử dụng trong logic FAILED)
    let isBooked = false;
    let bookedDates: Date[] = [];

    if (listing && typeof listing === 'object' && '_id' in listing && listing._id) {
      bookedDates = bookedDatesByListing[listing._id] || [];

      const checkIn = new Date(booking.checkInDate);

      const checkOut = new Date(booking.check_out_date);

      // Debug: Log thông tin để kiểm tra

      console.log('🔍 Checking if booking is booked:', {
        bookingId: booking._id,

        listingId: listing._id,

        checkInDate: booking.checkInDate,

        checkOutDate: booking.check_out_date,

        bookedDates: bookedDates.map((d) => d.toISOString().split('T')[0]),

        checkIn: checkIn.toISOString().split('T')[0],

        checkOut: checkOut.toISOString().split('T')[0],

        status: booking.status,

        payment_status: booking.payment_status,

        totalBookedDates: bookedDates.length,
      });

      // Kiểm tra xem có ngày nào trong bookedDates trùng với khoảng thời gian của booking hiện tại không

      // Chỉ áp dụng cho các trường hợp chưa thanh toán hoặc thanh toán thất bại

      const shouldCheckIsBooked =
        booking.payment_status === PaymentStatus.PENDING || booking.payment_status === PaymentStatus.FAILED;

      console.log('🔍 shouldCheckIsBooked calculation:', {
        bookingId: booking._id,

        payment_status: booking.payment_status,

        shouldCheckIsBooked,

        condition1: booking.payment_status === PaymentStatus.PENDING,

        condition2: booking.payment_status === PaymentStatus.FAILED,
      });

      console.log('🔍 shouldCheckIsBooked decision:', {
        bookingId: booking._id,

        payment_status: booking.payment_status,

        shouldCheckIsBooked,

        totalBookedDates: bookedDates.length,
      });

      if (shouldCheckIsBooked) {
        // Sử dụng state bookingConflicts đã được tính toán trước đó

        isBooked = bookingConflicts[booking._id] || false;

        console.log('🔍 Using bookingConflicts state:', {
          bookingId: booking._id,

          payment_status: booking.payment_status,

          shouldCheckIsBooked,

          isBooked,

          checkInDate: checkIn.toISOString().split('T')[0],

          checkOutDate: checkOut.toISOString().split('T')[0],

          bookingConflictsState: bookingConflicts,

          currentBookingConflict: bookingConflicts[booking._id],
        });
      } else {
        // Nếu đã thanh toán thành công, không cần kiểm tra isBooked

        isBooked = false;

        console.log('✅ Booking already paid, skipping isBooked check:', {
          bookingId: booking._id,

          payment_status: booking.payment_status,

          shouldCheckIsBooked,

          isBooked,
        });
      }

      console.log('isBooked result (excluding current booking):', isBooked);
    }

    // Tính toán số tiền còn lại cần thanh toán

    const finalAmount = booking.final_amount || 0;

    const depositPaidAmount = booking.deposit_paid_amount || 0;

    // Tính tổng chi phí dịch vụ đã thêm

    const servicesTotal =
      booking.selected_services?.reduce((total, service) => {
        const quantity = service.quantity || 1;

        const price = service.service_price || 0;

        return total + quantity * price;
      }, 0) || 0;

    // Số tiền còn lại = Tổng tiền cuối cùng - Số tiền đã thanh toán

    // Nếu có dịch vụ đã thêm, đảm bảo tính toán chính xác

    const outstandingAmount = finalAmount - depositPaidAmount;

    console.log('💰 Payment calculation:', {
      bookingId: booking._id,

      finalAmount,

      depositPaidAmount,

      outstandingAmount,

      servicesTotal,

      selected_services: booking.selected_services,

      payment_status: booking.payment_status,

      status: booking.status,
    });

    // Xử lý logic trạng thái theo thứ tự ưu tiên

    // ƯU TIÊN: Kiểm tra isBooked trước tiên

    if (isBooked) {
      console.log('🔍 Processing BOOKED case (highest priority):', {
        bookingId: booking._id,

        isBooked,

        status: booking.status,

        payment_status: booking.payment_status,

        checkInDate: booking.checkInDate,

        checkOutDate: booking.check_out_date,
      });

      statusDisplay = 'Booking này đã được đặt';

      statusColor = 'text-red-600';

      showPaymentButton = false; // Không cho phép thanh toán vì đã có người đặt

      console.log('✅ Booking is already taken by someone else:', {
        bookingId: booking._id,

        isBooked,

        checkInDate: booking.checkInDate,

        checkOutDate: booking.check_out_date,
      });
    } else if (booking.payment_status === PaymentStatus.FAILED) {
      console.log('🔍 Processing FAILED case:', {
        bookingId: booking._id,

        isBooked,

        status: booking.status,

        payment_status: booking.payment_status,

        outstandingAmount,

        finalAmount,

        depositPaidAmount,

        listingId: listing && typeof listing === 'object' && '_id' in listing ? listing._id : listing,

        hasBookedDates: bookedDates.length > 0,
      });

      statusDisplay = 'Thanh toán thất bại';

      statusColor = 'text-red-600';

      showPaymentButton = true; // Cho phép thử lại thanh toán

      console.log('✅ FAILED booking - allowing retry payment');
    } else if (booking.payment_status === PaymentStatus.PENDING) {
      console.log('🔍 Processing PENDING payment_status case:', {
        bookingId: booking._id,

        isBooked,

        status: booking.status,

        payment_status: booking.payment_status,
      });

      statusDisplay = 'Chờ thanh toán';

      statusColor = 'text-orange-600';

      showPaymentButton = true; // Cho phép thanh toán

      console.log(
        '✅ PENDING payment_status booking - showing payment button:',

        {
          bookingId: booking._id,

          isBooked,

          checkInDate: booking.checkInDate,

          checkOutDate: booking.check_out_date,
        },
      );
    } else if (booking.payment_status === PaymentStatus.PAID) {
      console.log('🔍 Processing PAID case:', {
        bookingId: booking._id,

        status: booking.status,

        payment_status: booking.payment_status,

        outstandingAmount,

        finalAmount,

        depositPaidAmount,
      });

      if (booking.status === BookingStatus.PENDING) {
        statusDisplay = 'Đã thanh toán - Chờ xác nhận';

        statusColor = 'text-blue-600';

        showPaymentButton = false;

        console.log('✅ PAID booking with PENDING status - waiting for confirmation');
      } else if (booking.status === BookingStatus.CONFIRMED) {
        statusDisplay = 'Đã xác nhận';

        statusColor = 'text-green-600';

        showPaymentButton = false;

        console.log('✅ PAID booking with CONFIRMED status');
      } else if (booking.status === BookingStatus.COMPLETED) {
        statusDisplay = 'Đã hoàn thành';

        statusColor = 'text-green-600';

        showPaymentButton = false;

        console.log('✅ PAID booking with COMPLETED status');
      } else {
        statusDisplay = 'Đã thanh toán';

        statusColor = 'text-green-600';

        showPaymentButton = false;

        console.log('✅ PAID booking with other status:', booking.status);
      }
    } else if (booking.payment_status === PaymentStatus.PARTIALLY_PAID) {
      console.log('🔍 Processing PARTIALLY_PAID case:', {
        bookingId: booking._id,

        status: booking.status,

        payment_status: booking.payment_status,

        outstandingAmount,

        finalAmount,

        depositPaidAmount,
      });

      if (outstandingAmount > 0) {
        // Nếu có dịch vụ đã thêm, hiển thị thông tin chi tiết hơn

        if (booking.selected_services && booking.selected_services.length > 0) {
          statusDisplay = `Đã thanh toán ${depositPaidAmount.toLocaleString()}₫ - Còn lại ${outstandingAmount.toLocaleString()}₫`;
        } else {
          statusDisplay = `Đã thanh toán ${depositPaidAmount.toLocaleString()}₫ - Còn lại ${outstandingAmount.toLocaleString()}₫`;
        }

        statusColor = 'text-orange-600';

        showPaymentButton = false;

        showPayRemainderButton = true;

        console.log('✅ PARTIALLY_PAID booking - showing pay remainder button');
      } else {
        statusDisplay = 'Đã thanh toán';

        statusColor = 'text-green-600';

        showPaymentButton = false;

        console.log('✅ PARTIALLY_PAID booking - fully paid');
      }
    } else {
      console.log('🔍 Processing OTHER payment_status case:', {
        bookingId: booking._id,

        status: booking.status,

        payment_status: booking.payment_status,

        outstandingAmount,

        finalAmount,

        depositPaidAmount,
      });

      // Xử lý các trường hợp khác

      if (booking.status === BookingStatus.CANCELLED) {
        statusDisplay = 'Đã hủy';

        statusColor = 'text-red-600';

        showPaymentButton = false;

        console.log('✅ CANCELLED booking');
      } else if (booking.status === BookingStatus.REJECTED) {
        statusDisplay = 'Bị từ chối';

        statusColor = 'text-red-600';

        showPaymentButton = false;

        console.log('✅ REJECTED booking');
      } else {
        statusDisplay = 'Không xác định';

        statusColor = 'text-gray-600';

        showPaymentButton = false;

        console.log('🔍 UNKNOWN status booking - checking details:', {
          bookingId: booking._id,

          status: booking.status,

          payment_status: booking.payment_status,

          isBooked: isBooked,
        });
      }
    }

    // Debug: Log thông tin để kiểm tra

    console.log('🎯 Final booking result:', {
      bookingId: booking._id,

      status: booking.status,

      payment_status: booking.payment_status,

      outstandingAmount,

      finalAmount,

      depositPaidAmount,

      showPaymentButton,

      isBooked,

      statusDisplay,

      statusColor,

      checkInDate: booking.checkInDate,

      checkOutDate: booking.check_out_date,

      hasAdditionalServices: booking.selected_services && booking.selected_services.length > 0,

      selected_services: booking.selected_services,
    });

    return (
      <div key={booking._id} className='bg-white rounded-xl shadow-sm p-6 mb-6'>
        <div className='flex flex-col md:flex-row gap-6'>
          {/* Ảnh */}

          <div className='w-full md:w-1/3 h-48 relative overflow-hidden'>
            {listing && typeof listing === 'object' && listing._id ? (
              <Link to={`/list/${listing._id}`}>
                <img
                  src={image}
                  alt={title}
                  className='w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer'
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </Link>
            ) : (
              <img
                src={image}
                alt={title}
                className='w-full h-full object-cover rounded-lg'
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            )}
          </div>

          {/* Thông tin */}

          <div className='flex-1'>
            <div className='flex justify-between items-start mb-2'>
              {listing && typeof listing === 'object' && listing._id ? (
                <Link to={`/list/${listing._id}`}>
                  <h3 className='text-xl font-semibold hover:text-blue-600 transition-colors cursor-pointer'>
                    {title}
                  </h3>
                </Link>
              ) : (
                <h3 className='text-xl font-semibold'>{title}</h3>
              )}

              {(() => {
                const statusInfo = getStatusDisplay(
                  booking.status || '',

                  booking.payment_status,

                  new Date(booking.check_out_date),
                );

                return <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span>;
              })()}
            </div>

            <div className='space-y-2 text-gray-600'>
              <div className='flex items-center gap-2'>
                <Calendar size={18} />

                <span>
                  {new Date(booking.checkInDate).toLocaleDateString('vi-VN')} –{' '}
                  {new Date(booking.check_out_date).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div className='space-y-2'>
                {/* Giá phòng cơ bản */}

                <div className='flex items-center gap-2'>
                  <DollarSign size={18} />

                  <span>Giá phòng: {(booking.total_price || 0).toLocaleString()}₫</span>
                </div>

                {/* Dịch vụ đã thêm */}

                {booking.selected_services && booking.selected_services.length > 0 && (
                  <div className='flex items-center gap-2 ml-6'>
                    <span className='text-sm text-blue-600'>• Dịch vụ đã thêm: {servicesTotal.toLocaleString()}₫</span>
                  </div>
                )}

                {/* Tổng tiền cuối cùng */}

                <div className='flex items-center gap-2 pt-1 border-t border-gray-200'>
                  <DollarSign size={18} className='text-green-600' />

                  <span className='font-semibold text-green-600'>
                    Tổng tiền: {booking.final_amount?.toLocaleString()}₫
                  </span>
                </div>
              </div>

              {/* Hiển thị thông tin thanh toán */}

              {outstandingAmount > 0 && (
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <DollarSign size={16} className='text-green-600' />

                    <span className='text-green-600 text-sm'>
                      Đã thanh toán: {(booking.deposit_paid_amount || 0).toLocaleString()}₫
                    </span>
                  </div>

                  {/* Hiển thị chi phí phát sinh nếu có */}

                  {(booking.additionalCost ?? 0) > 0 && (
                    <div className='flex items-center gap-2'>
                      <DollarSign size={16} className='text-red-600' />

                      <span className='text-red-600 font-medium'>
                        Chi phí phát sinh: {(booking.additionalCost ?? 0).toLocaleString()}₫
                        {booking.additionalCostReason && (
                          <span className='text-red-500 text-sm ml-2'>({booking.additionalCostReason})</span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Hiển thị số tiền còn lại cần thanh toán */}

                  <div className='flex items-center gap-2'>
                    <DollarSign size={16} className='text-orange-600' />

                    <span className='text-orange-600 font-medium'>
                      Còn lại cần thanh toán: {outstandingAmount.toLocaleString()}₫
                    </span>
                  </div>

                  {/* Thông tin bổ sung cho từng trường hợp */}

                  {booking.payment_status === PaymentStatus.PARTIALLY_PAID &&
                    booking.selected_services &&
                    booking.selected_services.length > 0 && (
                      <div className='flex items-center gap-2'>
                        <Info size={14} className='text-blue-600' />

                        <span className='text-blue-600 text-sm'>
                          Thanh toán thêm cho dịch vụ mới (Tổng: {outstandingAmount.toLocaleString()}₫)
                        </span>
                      </div>
                    )}

                  {booking.payment_status === PaymentStatus.PARTIALLY_PAID &&
                    (!booking.selected_services || booking.selected_services.length === 0) && (
                      <div className='flex items-center gap-2'>
                        <Info size={14} className='text-blue-600' />

                        <span className='text-blue-600 text-sm'>Thanh toán 50% còn lại của booking</span>
                      </div>
                    )}
                </div>
              )}

              {/* Hiển thị danh sách dịch vụ đã thêm */}

              {booking.selected_services && booking.selected_services.length > 0 && (
                <div className='mt-2 p-3 bg-blue-50 rounded-lg'>
                  <div className='text-sm font-medium text-blue-800 mb-2 flex justify-between items-center'>
                    <span>Dịch vụ đã thêm:</span>

                    <span className='text-blue-600 font-semibold'>Tổng: {servicesTotal.toLocaleString()}₫</span>
                  </div>

                  <div className='space-y-1'>
                    {booking.selected_services.map(
                      (
                        service: {
                          service_name?: string;

                          quantity?: number;

                          service_price?: number;
                        },

                        index: number,
                      ) => (
                        <div key={index} className='text-sm text-blue-700 flex justify-between'>
                          <span>• {service.service_name || 'Dịch vụ'}</span>

                          <span>
                            {service.quantity || 1}x {(service.service_price || 0).toLocaleString()}₫
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Các nút chức năng */}

            <div className='flex flex-wrap gap-3 mt-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleShowDetail(booking)}
                className='flex items-center gap-2'>
                <FileText size={16} />
                Xem chi tiết đặt chỗ
              </Button>

              {showPaymentButton && !isBooked && (
                <Button
                  variant='default'
                  size='sm'
                  className='flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white'
                  onClick={async () => {
                    // Kiểm tra nếu cả status và payment_status đều là PENDING

                    if (booking.status === BookingStatus.PENDING && booking.payment_status === PaymentStatus.PENDING) {
                      // Tạo thanh toán VNPay trực tiếp cho booking mới

                      try {
                        const response = await api.post(
                          `/bookings/${booking._id}/payment`,

                          {
                            paymentMethod: 'vnpay',

                            paymentType: 'full',
                          },
                        );

                        const paymentUrl = response.data?.data?.paymentUrl;

                        if (paymentUrl) {
                          // Chuyển thẳng đến trang VNPay

                          window.location.href = paymentUrl;
                        } else {
                          toast.error('Không lấy được link thanh toán VNPay');
                        }
                      } catch (error: unknown) {
                        console.error('Error creating VNPay payment:', error);

                        toast.error('Có lỗi khi tạo thanh toán VNPay. Vui lòng thử lại.');
                      }

                      return;
                    }

                    // Xử lý trường hợp thanh toán thất bại

                    if (booking.payment_status === PaymentStatus.FAILED) {
                      // Tạo thanh toán VNPay trực tiếp cho booking thất bại

                      try {
                        const response = await api.post(
                          `/bookings/${booking._id}/payment`,

                          {
                            paymentMethod: 'vnpay',

                            paymentType: 'full',
                          },
                        );

                        const paymentUrl = response.data?.data?.paymentUrl;

                        if (paymentUrl) {
                          // Chuyển thẳng đến trang VNPay

                          window.location.href = paymentUrl;
                        } else {
                          toast.error('Không lấy được link thanh toán VNPay');
                        }
                      } catch (error: unknown) {
                        console.error('Error creating VNPay payment:', error);

                        toast.error('Có lỗi khi tạo thanh toán VNPay. Vui lòng thử lại.');
                      }

                      return;
                    }

                    // Xử lý trường hợp chưa thanh toán (PENDING)

                    if (booking.payment_status === PaymentStatus.PENDING && booking.status !== BookingStatus.PENDING) {
                      // Tạo thanh toán VNPay trực tiếp cho booking chưa thanh toán

                      try {
                        const response = await api.post(
                          `/bookings/${booking._id}/payment`,

                          {
                            paymentMethod: 'vnpay',

                            paymentType: 'full',
                          },
                        );

                        const paymentUrl = response.data?.data?.paymentUrl;

                        if (paymentUrl) {
                          // Chuyển thẳng đến trang VNPay

                          window.location.href = paymentUrl;
                        } else {
                          toast.error('Không lấy được link thanh toán VNPay');
                        }
                      } catch (error: unknown) {
                        console.error('Error creating VNPay payment:', error);

                        toast.error('Có lỗi khi tạo thanh toán VNPay. Vui lòng thử lại.');
                      }

                      return;
                    }

                    // Xử lý các trường hợp thanh toán phần còn lại (đã có đặt cọc hoặc dịch vụ)

                    try {
                      // Kiểm tra lại trạng thái booking trước khi thanh toán

                      const statusCheck = await api.get(`/bookings/${booking._id}/payment/status`);

                      const currentPaymentStatus =
                        statusCheck.data?.data?.paymentStatus || statusCheck.data?.paymentStatus;

                      // Nếu booking đã được thanh toán bởi người khác và không còn tiền cần thanh toán

                      if (
                        (currentPaymentStatus === 'paid' && outstandingAmount <= 0) ||
                        (currentPaymentStatus === 'partially_paid' && outstandingAmount <= 0)
                      ) {
                        toast.error(
                          'Booking này đã được thanh toán. Vui lòng làm mới trang để xem trạng thái mới nhất.',
                        );

                        // Refresh lại dữ liệu

                        dispatch(getMyBookingHistory(undefined));

                        return;
                      }

                      // Nếu booking đã bị hủy hoặc không còn hợp lệ

                      if (currentPaymentStatus === 'cancelled' || currentPaymentStatus === 'refunded') {
                        toast.error('Booking này không còn hợp lệ để thanh toán.');

                        dispatch(getMyBookingHistory(undefined));

                        return;
                      }

                      // Tạo thanh toán VNPay trực tiếp cho phần còn lại

                      const response = await api.post(
                        `/bookings/${booking._id}/payment`,

                        {
                          paymentMethod: 'vnpay',

                          paymentType: 'remaining',

                          amount: outstandingAmount,
                        },
                      );

                      const paymentUrl = response.data?.data?.paymentUrl;

                      if (paymentUrl) {
                        // Chuyển thẳng đến trang VNPay

                        window.location.href = paymentUrl;
                      } else {
                        toast.error('Không lấy được link thanh toán VNPay');
                      }
                    } catch (error: unknown) {
                      console.error('Error creating VNPay payment:', error);

                      // Xử lý lỗi cụ thể

                      if (typeof error === 'object' && error !== null && 'response' in error) {
                        const errorResponse = error as {
                          response?: { data?: { error?: string } };
                        };

                        if (
                          errorResponse.response?.data?.error?.includes(
                            'Chỉ cho phép thanh toán phần còn lại khi đã đặt cọc hoặc có thêm dịch vụ',
                          )
                        ) {
                          // Nếu lỗi này, tạo thanh toán VNPay trực tiếp

                          try {
                            const response = await api.post(
                              `/bookings/${booking._id}/payment`,

                              {
                                paymentMethod: 'vnpay',

                                paymentType: 'full',
                              },
                            );

                            const paymentUrl = response.data?.data?.paymentUrl;

                            if (paymentUrl) {
                              // Chuyển thẳng đến trang VNPay

                              window.location.href = paymentUrl;
                            } else {
                              toast.error('Không lấy được link thanh toán VNPay');
                            }
                          } catch (retryError) {
                            console.error(
                              'Error creating VNPay payment on retry:',

                              retryError,
                            );

                            toast.error('Có lỗi khi tạo thanh toán VNPay. Vui lòng thử lại.');
                          }
                        }
                      } else {
                        toast.error('Có lỗi khi tạo thanh toán VNPay. Vui lòng thử lại.');
                      }
                    }
                  }}>
                  <DollarSign size={16} />

                  {booking.payment_status === PaymentStatus.PENDING && booking.status === BookingStatus.PENDING
                    ? 'Thanh toán VNPay'
                    : booking.payment_status === PaymentStatus.FAILED
                    ? 'Thử lại VNPay'
                    : booking.payment_status === PaymentStatus.PENDING
                    ? 'Thanh toán VNPay'
                    : outstandingAmount > 0
                    ? `Thanh toán ${outstandingAmount.toLocaleString()}₫`
                    : 'Thanh toán VNPay'}
                </Button>
              )}

              {showPayRemainderButton && (
                <Button
                  variant='default'
                  size='sm'
                  className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white'
                  onClick={() => handlePayRemainder(booking._id)}
                  disabled={payRemainderLoadingId === booking._id}>
                  <DollarSign size={16} />

                  {payRemainderLoadingId === booking._id
                    ? 'Đang xử lý...'
                    : `Trả nốt ${outstandingAmount.toLocaleString()}₫`}
                </Button>
              )}

              {showPaymentButton && isBooked && (
                <div className='text-red-500 font-medium text-sm'>⚠️ Phòng đã được đặt cho ngày này</div>
              )}

              {booking.status === BookingStatus.COMPLETED && (
                <Button
                  variant='outline'
                  size='sm'
                  className='flex items-center gap-2'
                  onClick={() => {
                    setSelectedBookingForReview(booking);

                    setShowReviewModal(true);

                    setReviewRating(5);

                    setReviewComment('');
                  }}>
                  <Star size={16} />
                  Viết đánh giá
                </Button>
              )}

              {(booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) && (
                <Button
                  variant='outline'
                  size='sm'
                  className='flex items-center gap-2'
                  onClick={() => {
                    if (booking.listingId && typeof booking.listingId === 'object' && '_id' in booking.listingId) {
                      navigate(`/list/${booking.listingId._id}`);
                    }
                  }}>
                  <Redo size={16} />
                  Đặt lại chỗ này
                </Button>
              )}

              {STATUS_UPCOMING.includes(booking.status as BookingStatus) && (
                <>
                  {canCancelBooking(booking) &&
                    (booking.payment_status === PaymentStatus.PAID ||
                      booking.payment_status === PaymentStatus.PARTIALLY_PAID) && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50'
                        onClick={() => handleCancelBooking(booking)}>
                        <X size={16} />
                        Hủy đặt phòng
                      </Button>
                    )}

                  {(() => {
                    const propertyIdString = getPropertyIdString(booking.propertyId);

                    return (
                      propertyIdString && (
                        <MessageHostDialog
                          propertyId={propertyIdString}
                          hostName='nhân viên'
                          className='w-auto flex items-center gap-2 text-[12px]'
                        />
                      )
                    );
                  })()}
                </>
              )}

              {/* Nút thêm dịch vụ - hiển thị cho tất cả booking đã thanh toán */}

              {(booking.payment_status === PaymentStatus.PAID ||
                booking.payment_status === PaymentStatus.PARTIALLY_PAID) &&
                tab !== 'history' && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50'
                    onClick={() => handleAddService(booking)}>
                    <Plus size={16} />
                    Thêm dịch vụ
                  </Button>
                )}
            </div>
          </div>
        </div>

        {/* Hiển thị thông tin hủy phòng nếu booking đã bị hủy */}

        {renderCancellationInfo(booking)}
      </div>
    );
  };

  // Hàm chuyển trạng thái sang tiếng Việt và màu sắc

  const getStatusDisplay = (
    status: string,

    paymentStatus?: string,

    checkOutDate?: Date,
  ) => {
    const now = new Date(); // Local now for accurate comparison

    // Nếu status là CONFIRMED hoặc PAID và đã qua ngày checkout, coi là hoàn thành

    if (
      (status === BookingStatus.CONFIRMED || paymentStatus === PaymentStatus.PAID) &&
      checkOutDate &&
      checkOutDate < now
    ) {
      return {
        text: 'Đã hoàn thành',

        color: 'text-green-600 bg-green-50 border-green-200',
      };
    }

    // Kiểm tra trạng thái thanh toán kết hợp với trạng thái booking

    if (status === BookingStatus.CONFIRMED) {
      // Nếu đã xác nhận nhưng chưa thanh toán hoặc thanh toán thất bại

      if (
        paymentStatus === PaymentStatus.PENDING ||
        paymentStatus === PaymentStatus.FAILED ||
        paymentStatus === PaymentStatus.PARTIALLY_PAID
      ) {
        return {
          text: 'Đang chờ thanh toán',

          color: 'text-orange-600 bg-orange-50 border-orange-200',
        };
      }

      // Nếu đã xác nhận và đã thanh toán

      if (paymentStatus === PaymentStatus.PAID) {
        return {
          text: 'Đã xác nhận',

          color: 'text-green-600 bg-green-50 border-green-200',
        };
      }
    }

    switch (status) {
      case BookingStatus.COMPLETED:
        return {
          text: 'Đã hoàn thành',

          color: 'text-green-600 bg-green-50 border-green-200',
        };

      case BookingStatus.CANCELLED:
        // Kiểm tra payment_status để hiển thị đúng trạng thái hoàn tiền
        if (paymentStatus === PaymentStatus.REFUNDED) {
          return {
            text: 'Đã hoàn tiền',
            color: 'text-green-600 bg-green-50 border-green-200',
          };
        } else if (paymentStatus === PaymentStatus.REFUNDING) {
          return {
            text: 'Đang hoàn tiền',
            color: 'text-orange-600 bg-orange-50 border-orange-200',
          };
        } else {
          return {
            text: 'Đã hủy',
            color: 'text-red-600 bg-red-50 border-red-200',
          };
        }

      case BookingStatus.REJECTED:
        return {
          text: 'Bị từ chối',

          color: 'text-red-600 bg-red-50 border-red-200',
        };

      case BookingStatus.CONFIRMED:
        return {
          text: 'Đã xác nhận',

          color: 'text-green-600 bg-green-50 border-green-200',
        };

      case BookingStatus.PENDING:
        return {
          text: 'Đang chờ',

          color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
        };

      default:
        return {
          text: status,

          color: 'text-gray-600 bg-gray-50 border-gray-200',
        };
    }
  };

  return (
    <div className='max-w-5xl mx-auto p-6'>
      <div className='flex items-center justify-between mb-5'>
        <h2 className='text-2xl font-bold'>Chuyến đi của tôi</h2>

        <div className='flex'>
          <button
            className={`justify-start text-base font-medium text-center px-10 py-2 h-10 rounded-md shadow-none transition ${
              tab === 'upcoming' ? 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]' : 'bg-transparent'
            } hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))]`}
            onClick={() => {
              if (tab !== 'upcoming') {
                setTab('upcoming');
              }
            }}>
            Sắp tới
          </button>

          <button
            className={`justify-start text-base font-medium text-center px-10 py-2 h-10 rounded-md shadow-none transition ${
              tab === 'history' ? 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]' : 'bg-transparent'
            } hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))]`}
            onClick={() => {
              if (tab !== 'history') {
                setTab('history');
              }
            }}>
            Trước đây
          </button>
        </div>
      </div>

      {loading ? (
        <div className='text-center py-8'>Đang tải...</div>
      ) : error ? (
        <div className='text-red-500 py-8'>{error}</div>
      ) : (
        <div>
          {tab === 'upcoming' && (
            <>
              {upcomingBookings.length === 0 && ongoingBookings.length === 0 ? (
                <div className='text-center text-gray-500 py-8'>Bạn chưa có chuyến đi nào sắp tới</div>
              ) : (
                <>
                  {upcomingBookings.map((b) => renderBooking(b))}

                  {ongoingBookings.map((b) => renderBooking(b))}
                </>
              )}
            </>
          )}

          {tab === 'history' && (
            <>
              {historyBookings.length === 0 ? (
                <div className='text-center text-gray-500 py-8'>Bạn chưa có chuyến đi nào trước đây</div>
              ) : (
                historyBookings.map((b) => renderBooking(b))
              )}
            </>
          )}
        </div>
      )}

      {/* Modal chi tiết */}

      {showDetail && selectedBooking && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg'>
            <div className='flex justify-between items-center mb-4 border-b border-gray-200 pb-2'>
              <div className='flex items-center gap-2'>
                <FileText size={22} className='text-blue-600' />

                <h3 className='text-xl font-bold'>Chi tiết đặt chỗ</h3>
              </div>

              <button
                onClick={() => setShowDetail(false)}
                className='text-gray-500 hover:text-gray-700 text-2xl font-bold px-2'
                title='Đóng'>
                ✕
              </button>
            </div>

            {isListingObj(selectedBooking.listingId) && (
              <img
                src={selectedBooking.listingId.images?.[0] || '/placeholder.svg'}
                alt={selectedBooking.listingId.title}
                className='w-full h-64 object-cover rounded-lg mb-4 border border-gray-200'
              />
            )}

            <div className='space-y-6'>
              <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                <h4 className='font-semibold mb-3 flex items-center gap-2'>
                  <Info size={18} className='text-blue-500' />
                  Thông tin đặt phòng
                </h4>

                <div className='space-y-2 text-gray-700 text-base'>
                  <div className='flex items-center gap-2'>
                    <Calendar size={16} className='text-gray-400' />
                    <span className='font-medium'>Ngày nhận phòng:</span>{' '}
                    {new Date(selectedBooking.checkInDate).toLocaleDateString('vi-VN')}
                  </div>

                  <div className='flex items-center gap-2'>
                    <Calendar size={16} className='text-gray-400' />
                    <span className='font-medium'>Ngày trả phòng:</span>{' '}
                    {new Date(selectedBooking.check_out_date).toLocaleDateString('vi-VN')}
                  </div>

                  <div className='flex items-center gap-2'>
                    <Users size={16} className='text-gray-400' />
                    <span className='font-medium'>Số khách:</span> {selectedBooking.guests} người
                  </div>

                  <div className='flex items-center gap-2'>
                    <Info size={16} className='text-gray-400' />

                    <span className='font-medium'>Trạng thái:</span>

                    <span
                      className={`inline-block px-2 py-1 rounded border text-sm font-semibold ml-2 ${
                        getStatusDisplay(
                          selectedBooking.status || '',

                          selectedBooking.payment_status,

                          new Date(selectedBooking.check_out_date),
                        ).color
                      }`}>
                      {
                        getStatusDisplay(
                          selectedBooking.status || '',

                          selectedBooking.payment_status,

                          new Date(selectedBooking.check_out_date),
                        ).text
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin dịch vụ đã sử dụng */}
              {selectedBooking.selected_services.length > 0 && (
                <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                  <h4 className='font-semibold mb-3 flex items-center gap-2 text-blue-800'>
                    <Package size={18} className='text-blue-600' />
                    Dịch vụ đã sử dụng
                  </h4>
                  <div className='space-y-2'>
                    {selectedBooking.selected_services.map((service: any, index: number) => (
                      <div key={index} className='flex justify-between items-center text-sm'>
                        <span className='text-blue-700'>
                          • {service.service_name || 'Dịch vụ'} x{service.quantity || 1}
                        </span>
                        <span className='font-medium text-blue-800'>
                          {((service.service_price || 0) * (service.quantity || 1)).toLocaleString()}₫
                        </span>
                      </div>
                    ))}
                    <div className='border-t border-blue-300 pt-2 mt-2'>
                      <div className='flex justify-between items-center font-semibold text-blue-900'>
                        <span>Tổng phí dịch vụ:</span>
                        <span>
                          {selectedBooking.selected_services
                            .reduce(
                              (total: number, service: any) =>
                                total + (service.service_price || 0) * (service.quantity || 1),
                              0,
                            )
                            .toLocaleString()}
                          ₫
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin voucher */}
              {selectedBooking.voucher_discount_amount > 0 && (
                <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
                  <h4 className='font-semibold mb-3 flex items-center gap-2 text-green-800'>
                    <Tag size={18} className='text-green-600' />
                    Thông tin Voucher
                  </h4>
                  <div className='space-y-2 text-green-700'>
                    <div className='flex justify-between items-center'>
                      <span>Mã voucher:</span>
                      <span className='font-medium'>{selectedBooking.voucher_code || 'N/A'}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span>Giảm giá:</span>
                      <span className='font-medium'>-{selectedBooking.voucher_discount_amount.toLocaleString()}₫</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Chi tiết hóa đơn */}
              <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                <h4 className='font-semibold mb-3 flex items-center gap-2'>
                  <DollarSign size={18} className='text-green-500' />
                  Chi tiết hóa đơn
                </h4>
                <div className='space-y-3'>
                  {/* Giá phòng cơ bản */}
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-700'>Giá phòng cơ bản:</span>
                    <span className='font-medium'>{(selectedBooking.total_price || 0).toLocaleString()}₫</span>
                  </div>

                  {/* Phí dịch vụ */}
                  {selectedBooking.selected_services.length > 0 && (
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-700'>Phí dịch vụ:</span>
                      <span className='font-medium'>
                        {selectedBooking.selected_services
                          .reduce(
                            (total: number, service: any) =>
                              total + (service.service_price || 0) * (service.quantity || 1),
                            0,
                          )
                          .toLocaleString()}
                        ₫
                      </span>
                    </div>
                  )}

                  {/* Phí dịch vụ (10%) */}
                  <div className='flex justify-between items-center text-gray-600'>
                    <span>Phí dịch vụ (10%):</span>
                    <span className='font-medium'>{((selectedBooking.total_price || 0) * 0.1).toLocaleString()}₫</span>
                  </div>

                  {/* Thuế VAT (8%) */}
                  <div className='flex justify-between items-center text-gray-600'>
                    <span>Thuế VAT (8%):</span>
                    <span className='font-medium'>{((selectedBooking.total_price || 0) * 0.08).toLocaleString()}₫</span>
                  </div>

                  {/* Giảm giá voucher */}
                  {selectedBooking.voucher_discount_amount > 0 && (
                    <div className='flex justify-between items-center text-green-600'>
                      <span>Giảm giá voucher:</span>
                      <span className='font-medium'>-{selectedBooking.voucher_discount_amount.toLocaleString()}₫</span>
                    </div>
                  )}

                  {/* Tổng tiền */}
                  <div className='border-t border-gray-300 pt-3 mt-3'>
                    <div className='flex justify-between items-center font-bold text-lg text-gray-900'>
                      <span>Tổng tiền:</span>
                      <span>{(selectedBooking.final_amount || 0).toLocaleString()}₫</span>
                    </div>
                  </div>
                </div>
              </div>

              {user && (
                <div className='bg-gray-50 p-4 rounded-lg border'>
                  <h4 className='font-semibold mb-3 flex items-center gap-2'>
                    <Users size={18} className='text-green-500' />
                    Thông tin người đặt
                  </h4>

                  <div className='space-y-2 text-gray-700 text-base'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>Họ tên:</span> {user.name}
                    </div>

                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>Email:</span> {user.email}
                    </div>

                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>Số điện thoại:</span> {user.phone}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCancelModal && selectedBookingForCancel && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4 border-b pb-2'>
              <h3 className='text-xl font-bold flex items-center gap-2'>
                <X size={20} className='text-red-500' />
                Hủy đặt phòng
              </h3>

              <Button variant='ghost' size='sm' onClick={() => setShowCancelModal(false)} className='h-8 w-8 p-0'>
                <X className='h-4 w-4' />
              </Button>
            </div>

            <div className='space-y-6'>
              {/* Thông tin booking */}

              <div className='bg-gray-50 p-4 rounded-lg border'>
                <h4 className='font-semibold mb-3 flex items-center gap-2'>
                  <Info size={18} className='text-blue-500' />
                  Thông tin đặt phòng
                </h4>

                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='font-medium text-gray-600'>Ngày check-in:</span>

                    <p className='font-medium'>
                      {new Date(selectedBookingForCancel.checkInDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div>
                    <span className='font-medium text-gray-600'>Ngày check-out:</span>

                    <p className='font-medium'>
                      {new Date(selectedBookingForCancel.check_out_date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div>
                    <span className='font-medium text-gray-600'>Tổng tiền:</span>

                    <p className='font-medium'>{(selectedBookingForCancel.final_amount || 0).toLocaleString()}₫</p>
                  </div>

                  <div>
                    <span className='font-medium text-gray-600'>Đã thanh toán:</span>

                    <p className='font-medium'>
                      {(selectedBookingForCancel.deposit_paid_amount || 0).toLocaleString()}₫
                    </p>
                  </div>
                </div>
              </div>

              {/* Chính sách hủy */}

              <div className='bg-gray-50 p-4 rounded-lg border'>
                <h4 className='font-semibold mb-3 flex items-center gap-2'>
                  <Info size={18} className='text-blue-500' />
                  Chính sách hoàn tiền:
                </h4>

                {selectedBookingForCancel?.cancel_policy?.toLowerCase() === 'flexible' && (
                  <div className='flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mb-1'>
                    <CheckCircle size={18} className='text-green-500' />

                    <span>
                      Hủy trước{' '}
                      {format(
                        subDays(
                          new Date(selectedBookingForCancel.checkInDate),

                          1,
                        ),

                        'dd/MM/yyyy',
                      )}{' '}
                      14:00 : Hoàn tiền đầy đủ.
                    </span>
                  </div>
                )}

                {selectedBookingForCancel?.cancel_policy?.toLowerCase() === 'moderate' && (
                  <div className='flex items-center gap-2 text-yellow-800 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mb-1'>
                    <CheckCircle size={18} className='text-yellow-500' />

                    <span>
                      Hủy trước{' '}
                      {format(
                        subDays(
                          new Date(selectedBookingForCancel.checkInDate),

                          5,
                        ),

                        'dd/MM/yyyy',
                      )}{' '}
                      14:00: hoàn tiền đầy đủ.
                    </span>
                  </div>
                )}

                {selectedBookingForCancel?.cancel_policy?.toLowerCase() === 'strict' && (
                  <div className='flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-1'>
                    <XCircle size={18} className='text-red-500' />

                    <span>Không được hoàn tiền trong mọi trường hợp.</span>
                  </div>
                )}

                {!selectedBookingForCancel?.cancel_policy && (
                  <div className='flex items-center gap-2 text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-2'>
                    <Info size={18} className='text-gray-400' />

                    <span>Không có thông tin chính sách hoàn tiền.</span>
                  </div>
                )}
              </div>

              {/* Form lý do hủy và thông tin hoàn tiền */}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  try {
                    const formData = new FormData(e.currentTarget);

                    const cancellationData = {
                      cancellationReason: formData.get('cancellationReason') as string,

                      accountName: formData.get('accountName') as string,

                      bankName: formData.get('bankName') as string,

                      accountNumber: formData.get('accountNumber') as string,

                      refundMethod: formData.get('refundMethod') as string,

                      refundNote: formData.get('refundNote') as string,
                    };

                    await api.patch(
                      `/bookings/my-bookings/${selectedBookingForCancel._id}/cancel`,

                      cancellationData,
                    );

                    toast.success('Hủy đặt phòng thành công');

                    dispatch(getMyBookingHistory(undefined));

                    setShowCancelModal(false);
                  } catch (error: unknown) {
                    console.error('Error cancelling booking:', error);

                    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi hủy đặt phòng';

                    toast.error(errorMessage);
                  }
                }}
                className='space-y-4'>
                <div className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <div className='w-6 h-6 bg-red-100 rounded-full flex items-center justify-center'>
                        <AlertCircle className='w-4 h-4 text-red-600' />
                      </div>

                      <Label htmlFor='cancellationReason' className='text-base font-semibold text-red-900'>
                        Lý do hủy phòng <span className='text-gray-500 text-sm'>(tùy chọn)</span>
                      </Label>
                    </div>

                    <div className='bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200'>
                      <Textarea
                        id='cancellationReason'
                        name='cancellationReason'
                        placeholder='Vui lòng cho chúng tôi biết lý do hủy phòng để chúng tôi có thể cải thiện dịch vụ...'
                        className='bg-white border-red-200 focus:border-red-400 focus:ring-red-400 resize-none'
                        rows={4}
                      />

                      <p className='text-xs text-red-600 mt-2 font-medium'>
                        💡 Thông tin này sẽ giúp chúng tôi cải thiện chất lượng dịch vụ
                      </p>
                    </div>
                  </div>

                  {/* Thông tin hoàn tiền - chỉ hiển thị nếu có thể hoàn tiền */}

                  {selectedBookingForCancel?.cancel_policy?.toLowerCase() !== 'strict' && (
                    <>
                      <div className='border-t pt-4'>
                        <h5 className='font-medium mb-3 text-gray-700'>Thông tin hoàn tiền</h5>

                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <Label htmlFor='accountName' className='text-sm font-medium'>
                              Tên chủ tài khoản
                            </Label>

                            <Input id='accountName' name='accountName' placeholder='Nguyễn Văn A' className='mt-1' />
                          </div>

                          <div>
                            <Label htmlFor='bankName' className='text-sm font-medium'>
                              Tên ngân hàng
                            </Label>

                            <Input id='bankName' name='bankName' placeholder='Vietcombank' className='mt-1' />
                          </div>
                        </div>

                        <div className='mt-4'>
                          <Label htmlFor='accountNumber' className='text-sm font-medium'>
                            Số tài khoản
                          </Label>

                          <Input id='accountNumber' name='accountNumber' placeholder='1234567890' className='mt-1' />
                        </div>

                        <div className='mt-4'>
                          <Label htmlFor='refundMethod' className='text-sm font-medium'>
                            Phương thức hoàn tiền
                          </Label>

                          <div className='mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md'>
                            <div className='flex items-center gap-2'>
                              <div className='w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center'>
                                <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                              </div>

                              <span className='text-gray-700 font-medium'>Chuyển khoản ngân hàng</span>
                            </div>
                          </div>

                          <input type='hidden' id='refundMethod' name='refundMethod' value='bank_transfer' />
                        </div>

                        <div className='mt-4'>
                          <Label htmlFor='refundNote' className='text-sm font-medium'>
                            Ghi chú thêm (tùy chọn)
                          </Label>

                          <Textarea
                            id='refundNote'
                            name='refundNote'
                            placeholder='Thông tin bổ sung về việc hoàn tiền...'
                            className='mt-1'
                            rows={2}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className='flex justify-end gap-3 pt-4 border-t'>
                  <Button type='button' variant='outline' onClick={() => setShowCancelModal(false)}>
                    Hủy
                  </Button>

                  <Button type='submit' className='bg-red-600 hover:bg-red-700 text-white'>
                    Xác nhận hủy phòng
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal đánh giá/bình luận dùng shadcn/ui */}

      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className='bg-white shadow-xl border border-gray-200 rounded-2xl'>
          <DialogHeader>
            <DialogTitle>
              {selectedBookingForReview &&
              selectedBookingForReview.listingId &&
              typeof selectedBookingForReview.listingId === 'object' &&
              'title' in selectedBookingForReview.listingId
                ? `Đánh giá/Bình luận phòng "${selectedBookingForReview.listingId.title}"`
                : 'Đánh giá/Bình luận phòng'}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={async (e) => {
              e.preventDefault();

              setReviewLoading(true);

              try {
                await dispatch(
                  postReview({
                    roomId:
                      selectedBookingForReview &&
                      selectedBookingForReview.listingId &&
                      typeof selectedBookingForReview.listingId === 'object' &&
                      '_id' in selectedBookingForReview.listingId
                        ? (selectedBookingForReview.listingId._id as string)
                        : '',

                    rating: reviewRating,

                    comment: reviewComment,
                  }),
                ).unwrap();

                toast.success(
                  <span className='flex items-center gap-2 text-green-600'>
                    <CheckCircle size={20} className='text-green-500' />
                    Đánh giá thành công!
                  </span>,
                );

                setShowReviewModal(false);
              } catch {
                toast.error('Gửi đánh giá/bình luận thất bại!');
              } finally {
                setReviewLoading(false);
              }
            }}
            className='space-y-4'>
            <div className='flex items-center gap-2 mb-2'>
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  type='button'
                  variant='ghost'
                  onClick={() => setReviewRating(star)}
                  className={star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}>
                  <Star fill={star <= reviewRating ? '#facc15' : 'none'} />
                </Button>
              ))}

              <span className='ml-2 text-sm text-gray-500'>{reviewRating} sao</span>
            </div>

            <Textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder='Hãy chia sẻ trải nghiệm hoặc bình luận của bạn...'
              required
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setShowReviewModal(false)}>
                Hủy
              </Button>

              <Button type='submit' disabled={reviewLoading}>
                {reviewLoading ? <Loader2 className='animate-spin' size={18} /> : 'Gửi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal thêm dịch vụ */}

      <Dialog open={showAddServiceModal} onOpenChange={setShowAddServiceModal}>
        <DialogContent className='bg-white shadow-xl border border-gray-200 rounded-2xl max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Package size={20} />
              Thêm dịch vụ cho booking
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4 max-h-96 overflow-y-auto'>
            {availableServices.length === 0 ? (
              <div className='text-center py-8'>
                <Loader2 size={24} className='animate-spin mx-auto mb-2' />

                <p>Đang tải danh sách dịch vụ...</p>
              </div>
            ) : (
              availableServices.map((service) => {
                // Kiểm tra xem dịch vụ này đã được đăng ký trước đó chưa

                const existingService = selectedBookingForService?.selected_services?.find(
                  (registeredService: {
                    service_id?: string;

                    _id?: string;

                    service_name?: string;
                  }) =>
                    registeredService.service_id === service._id ||
                    registeredService._id === service._id ||
                    registeredService.service_name === service.name,
                );

                const isAlreadyRegistered = !!existingService;

                return (
                  <div
                    key={service._id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      selectedServices[service._id]
                        ? 'bg-blue-50 border-blue-300'
                        : isAlreadyRegistered
                        ? 'bg-gray-100 border-gray-300 opacity-75'
                        : 'hover:bg-gray-50 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!isAlreadyRegistered) {
                        console.log('Service item clicked:', service._id);

                        const currentChecked = !!selectedServices[service._id];

                        handleServiceSelection(service._id, !currentChecked);
                      }
                    }}>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <Checkbox
                          id={service._id}
                          checked={!!selectedServices[service._id] || isAlreadyRegistered}
                          disabled={isAlreadyRegistered}
                          onCheckedChange={(checked) => {
                            if (!isAlreadyRegistered) {
                              console.log(
                                'Checkbox clicked for service:',

                                service._id,

                                'checked:',

                                checked,
                              );

                              handleServiceSelection(
                                service._id,

                                checked as boolean,
                              );
                            }
                          }}
                          onClick={(e) => {
                            if (!isAlreadyRegistered) {
                              console.log(
                                'Checkbox clicked directly:',

                                service._id,
                              );

                              e.stopPropagation();
                            }
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                        />

                        <div>
                          <Label
                            htmlFor={service._id}
                            className={`font-medium ${
                              isAlreadyRegistered ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'
                            }`}>
                            {service.name}

                            {isAlreadyRegistered && (
                              <span className='ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded'>
                                Đã đăng ký
                              </span>
                            )}
                          </Label>

                          <p className={`text-sm ${isAlreadyRegistered ? 'text-gray-400' : 'text-gray-600'}`}>
                            {service.description}
                          </p>

                          <p className='text-sm font-medium text-blue-600'>
                            {service.default_price?.toLocaleString()}₫ / {service.unit}
                          </p>

                          {service.allow_quantity && (
                            <div className='flex items-center gap-2 mt-2'>
                              <span className='text-xs text-gray-500'>• Có thể chọn số lượng</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity selector cho dịch vụ có allow_quantity */}

                      {service.allow_quantity && selectedServices[service._id] && (
                        <div className='flex items-center gap-2 ml-4'>
                          <div className='flex items-center border border-gray-300 rounded-lg overflow-hidden'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={(e) => {
                                e.stopPropagation();

                                setSelectedServices((prev) => {
                                  const current = prev[service._id] || 1;

                                  const next = Math.max(
                                    SERVICE_CONSTANTS.MIN_QUANTITY,

                                    current - 1,
                                  );

                                  return { ...prev, [service._id]: next };
                                });
                              }}
                              disabled={(selectedServices[service._id] || 1) <= SERVICE_CONSTANTS.MIN_QUANTITY}
                              className='w-8 h-8 p-0 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-300'>
                              -
                            </Button>

                            <span className='min-w-[40px] text-center text-sm font-medium bg-white px-3 py-1'>
                              {selectedServices[service._id] || 1}
                            </span>

                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={(e) => {
                                e.stopPropagation();

                                setSelectedServices((prev) => {
                                  const current = prev[service._id] || 1;

                                  if (current >= SERVICE_CONSTANTS.MAX_QUANTITY) {
                                    toast.error(SERVICE_MESSAGES.MAX_QUANTITY_EXCEEDED);

                                    return prev;
                                  }

                                  const next = current + 1;

                                  return { ...prev, [service._id]: next };
                                });
                              }}
                              disabled={(selectedServices[service._id] || 1) >= SERVICE_CONSTANTS.MAX_QUANTITY}
                              className='w-8 h-8 p-0 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-300'>
                              +
                            </Button>
                          </div>

                          {(selectedServices[service._id] || 1) >= SERVICE_CONSTANTS.MAX_QUANTITY && (
                            <span className='text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded'>
                              ⚠️ {SERVICE_MESSAGES.QUANTITY_LIMIT_HINT}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setShowAddServiceModal(false)}>
              Hủy
            </Button>

            <Button
              type='button'
              onClick={handleConfirmAddServices}
              disabled={addServiceLoading || Object.keys(selectedServices).length === 0}
              className='bg-blue-600 text-white hover:bg-blue-700'>
              {addServiceLoading ? (
                <>
                  <Loader2 size={16} className='mr-2 animate-spin' />
                  Đang thêm...
                </>
              ) : (
                'Thêm dịch vụ'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal hiển thị thông tin hủy phòng chi tiết */}

      <Dialog open={showCancellationDetailsModal} onOpenChange={setShowCancellationDetailsModal}>
        <DialogContent className='bg-white max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-red-800'>
              <XCircle size={20} className='text-red-600' />

              {selectedCancellationBooking?.payment_status === PaymentStatus.REFUNDED
                ? 'Chi tiết thông tin hoàn tiền'
                : 'Chi tiết thông tin hủy phòng'}
            </DialogTitle>
          </DialogHeader>

          {selectedCancellationBooking && (
            <div className='space-y-6'>
              {/* Thông tin booking */}

              <div className='p-4 bg-gray-50 rounded-lg'>
                <h4 className='font-semibold text-gray-800 mb-3'>Thông tin đặt phòng</h4>

                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='font-medium text-gray-600'>Phòng:</span>

                    <p className='text-gray-800'>
                      {typeof selectedCancellationBooking.listingId === 'object' &&
                      selectedCancellationBooking.listingId?.title
                        ? selectedCancellationBooking.listingId.title
                        : 'Không có thông tin'}
                    </p>
                  </div>

                  <div>
                    <span className='font-medium text-gray-600'>Ngày đặt:</span>

                    <p className='text-gray-800'>
                      {new Date(selectedCancellationBooking.checkInDate).toLocaleDateString('vi-VN')} -{' '}
                      {new Date(selectedCancellationBooking.check_out_date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div>
                    <span className='font-medium text-gray-600'>Tổng tiền:</span>

                    <p className='text-gray-800 font-semibold'>
                      {selectedCancellationBooking.final_amount?.toLocaleString()}₫
                    </p>
                  </div>

                  <div>
                    <span className='font-medium text-gray-600'>Trạng thái:</span>

                    <p className='text-red-600 font-semibold'>Đã hủy</p>
                  </div>
                </div>
              </div>

              {/* Thông tin hủy phòng */}

              <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                <h4 className='font-semibold text-red-800 mb-4 flex items-center gap-2'>
                  <XCircle size={18} className='text-red-600' />
                  Thông tin hủy phòng
                </h4>

                <div className='space-y-4'>
                  {selectedCancellationBooking.cancellation_reason && (
                    <div>
                      <span className='font-medium text-gray-700 block mb-1'>Lý do hủy:</span>

                      <p className='text-gray-800 bg-white p-3 rounded border'>
                        {selectedCancellationBooking.cancellation_reason}
                      </p>
                    </div>
                  )}

                  {selectedCancellationBooking.cancelled_at && (
                    <div>
                      <span className='font-medium text-gray-700 block mb-1'>Thời gian hủy:</span>

                      <p className='text-gray-800 bg-white p-3 rounded border'>
                        {new Date(selectedCancellationBooking.cancelled_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  )}

                  {selectedCancellationBooking.cancellationDetails && (
                    <div className='p-4 bg-white rounded border'>
                      <h5 className='font-semibold text-gray-800 mb-3 flex items-center gap-2'>
                        <Info size={16} className='text-blue-600' />
                        Thông tin hoàn tiền
                      </h5>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {selectedCancellationBooking.cancellationDetails.accountName && (
                          <div>
                            <span className='font-medium text-gray-600 block mb-1'>Tên chủ tài khoản:</span>

                            <p className='text-gray-800 bg-gray-50 p-2 rounded'>
                              {selectedCancellationBooking.cancellationDetails.accountName}
                            </p>
                          </div>
                        )}

                        {selectedCancellationBooking.cancellationDetails.bankName && (
                          <div>
                            <span className='font-medium text-gray-600 block mb-1'>Ngân hàng:</span>

                            <p className='text-gray-800 bg-gray-50 p-2 rounded'>
                              {selectedCancellationBooking.cancellationDetails.bankName}
                            </p>
                          </div>
                        )}

                        {selectedCancellationBooking.cancellationDetails.accountNumber && (
                          <div>
                            <span className='font-medium text-gray-600 block mb-1'>Số tài khoản:</span>

                            <p className='text-gray-800 bg-gray-50 p-2 rounded font-mono'>
                              {selectedCancellationBooking.cancellationDetails.accountNumber}
                            </p>
                          </div>
                        )}

                        {selectedCancellationBooking.cancellationDetails.refundMethod && (
                          <div>
                            <span className='font-medium text-gray-600 block mb-1'>Phương thức hoàn tiền:</span>

                            <p className='text-gray-800 bg-gray-50 p-2 rounded'>
                              {selectedCancellationBooking.cancellationDetails.refundMethod === 'bank_transfer' &&
                                'Chuyển khoản ngân hàng'}

                              {selectedCancellationBooking.cancellationDetails.refundMethod === 'wallet' &&
                                'Ví điện tử'}

                              {selectedCancellationBooking.cancellationDetails.refundMethod === 'credit_card' &&
                                'Thẻ tín dụng'}
                            </p>
                          </div>
                        )}

                        {selectedCancellationBooking.cancellationDetails.refundNote && (
                          <div className='md:col-span-2'>
                            <span className='font-medium text-gray-600 block mb-1'>Ghi chú:</span>

                            <p className='text-gray-800 bg-gray-50 p-3 rounded'>
                              {selectedCancellationBooking.cancellationDetails.refundNote}
                            </p>
                          </div>
                        )}

                        {/* Hiển thị ảnh minh chứng hoàn tiền */}
                        {selectedCancellationBooking.cancellationDetails?.refundImageUrls &&
                          selectedCancellationBooking.cancellationDetails.refundImageUrls.length > 0 && (
                            <div className='md:col-span-2'>
                              <span className='font-medium text-gray-600 block mb-3'>Ảnh minh chứng hoàn tiền:</span>
                              <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                                {selectedCancellationBooking.cancellationDetails.refundImageUrls.map(
                                  (imageUrl, index) => (
                                    <div key={index} className='relative group'>
                                      <img
                                        src={imageUrl}
                                        alt={`Minh chứng hoàn tiền ${index + 1}`}
                                        crossOrigin='anonymous'
                                        className='w-full h-auto max-h-32 object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity bg-white'
                                        style={{
                                          display: 'block',
                                          backgroundColor: 'white',
                                          minHeight: '80px',
                                          maxHeight: '128px',
                                        }}
                                        onClick={() => {
                                          handleShowImageModal(imageUrl);
                                        }}
                                        onError={(e) => {
                                          console.error(`Failed to load refund image ${index + 1}:`, imageUrl);
                                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                                        }}
                                        onLoad={(e) => {
                                          console.log(`Successfully loaded refund image ${index + 1}:`, imageUrl);
                                          // Đảm bảo ảnh hiển thị đúng
                                          const img = e.target as HTMLImageElement;
                                          img.style.display = 'block';
                                          img.style.backgroundColor = 'white';
                                          console.log(`Modal Image ${index + 1} dimensions:`, {
                                            width: img.naturalWidth,
                                            height: img.naturalHeight,
                                            display: img.style.display,
                                            backgroundColor: img.style.backgroundColor,
                                          });
                                        }}
                                      />
                                    </div>
                                  ),
                                )}
                              </div>
                              <p className='text-xs text-gray-500 mt-2'>💡 Nhấn vào ảnh để xem chi tiết</p>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setShowCancellationDetailsModal(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal xem ảnh toàn màn */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className='bg-black/95 max-w-none w-[95vw] h-[95vh] p-0 border-0 [&>button]:hidden overflow-hidden'>
          <div className='relative w-full h-full flex items-center justify-center overflow-hidden'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                console.log('🔍 Closing image modal');
                setShowImageModal(false);
              }}
              className='absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full'>
              <X className='h-6 w-6' />
            </Button>

            {selectedImageUrl && (
              <div className='w-full h-full flex items-center justify-center p-4 overflow-hidden'>
                <img
                  src={selectedImageUrl}
                  alt='Ảnh minh chứng hoàn tiền'
                  crossOrigin='anonymous'
                  className='max-w-full max-h-full object-contain rounded-lg shadow-2xl'
                  style={{
                    display: 'block',
                    backgroundColor: 'white',
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                  onError={(e) => {
                    console.error('Failed to load fullscreen image:', selectedImageUrl);
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    console.log('Fullscreen image loaded successfully:', {
                      url: selectedImageUrl,
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                    });
                  }}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PastTrip;
