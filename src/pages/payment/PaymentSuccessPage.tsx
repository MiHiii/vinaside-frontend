import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy toàn bộ query params
    const params = Object.fromEntries(searchParams.entries());
    if (Object.keys(params).length > 0) {
      setLoading(true);
      api
        .get("/bookings/vnpay/return", { params })
        .then(() => setError(null))
        .catch((err) => {
          const errorMessage =
            err?.response?.data?.message ||
            err?.message ||
            "Giao dịch không thành công.";
          const bookingId = err?.response?.data?.bookingId;
          navigate(
            `/payment/failed?message=${encodeURIComponent(
              errorMessage
            )}&bookingId=${bookingId || ""}`
          );
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Đang xác nhận thanh toán...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            Thanh toán thất bại!
          </h2>
          <p className="mb-2">{error}</p>
          <button
            className="mt-2 px-6 py-2 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition"
            onClick={() => (window.location.href = "/")}
          >
            Về trang chủ
          </button>
        </div>
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
          <circle cx="12" cy="12" r="12" fill="#22c55e" />
          <path
            d="M7 13l3 3 7-7"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="text-2xl font-bold mb-4 text-green-600">
          Thanh toán thành công!
        </h2>
        <p className="mb-2">
          Cảm ơn bạn đã đặt phòng. Chúng tôi đã gửi xác nhận đến email của bạn.
        </p>
        <p className="text-gray-500 mb-6">
          Chúc bạn có một chuyến đi tuyệt vời!
        </p>
        <button
          className="mt-2 px-6 py-2 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition"
          onClick={() => (window.location.href = "/")}
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
