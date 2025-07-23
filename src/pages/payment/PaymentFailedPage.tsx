import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useRedux";
import { fetchPaymentStatus } from "@/store/slices/bookingSlice";

export default function PaymentFailedPage() {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const [canRetry, setCanRetry] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const message =
    searchParams.get("message") ||
    "Giao dịch không thành công. Vui lòng thử lại.";
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!bookingId) {
        setCheckingStatus(false);
        return;
      }

      try {
        const result = await dispatch(
          fetchPaymentStatus({ bookingId })
        ).unwrap();
        // Chỉ cho phép thử lại nếu trạng thái là failed hoặc pending
        setCanRetry(["failed", "pending"].includes(result.paymentStatus));
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái:", error);
        setCanRetry(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkPaymentStatus();
  }, [bookingId, dispatch]);

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Đang kiểm tra trạng thái thanh toán...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <svg
          className="mx-auto mb-4"
          width="64"
          height="64"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="12" fill="#ef4444" />
          <path
            d="M15 9l-6 6M9 9l6 6"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="text-2xl font-bold mb-4 text-red-600">
          Thanh toán thất bại!
        </h2>
        <p className="mb-2 text-gray-700">{message}</p>
        <p className="text-gray-500 mb-6">
          {canRetry
            ? "Bạn có thể thử thanh toán lại hoặc liên hệ bộ phận hỗ trợ nếu cần giúp đỡ."
            : "Booking này không thể thanh toán lại. Vui lòng liên hệ bộ phận hỗ trợ nếu cần giúp đỡ."}
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/"
            className="px-6 py-2 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
          >
            Về trang chủ
          </Link>
          {bookingId && canRetry && (
            <Link
              to={`/payment/${bookingId}`}
              className="px-6 py-2 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition"
            >
              Thử lại
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
