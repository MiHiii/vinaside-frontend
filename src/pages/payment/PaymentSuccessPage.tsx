import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy toàn bộ query params
    const params = Object.fromEntries(searchParams.entries());

    // Kiểm tra xem có phải là callback từ VNPay không
    if (!params.vnp_ResponseCode || !params.vnp_TxnRef) {
      navigate("/");
      return;
    }

    // Lấy bookingId từ vnp_TxnRef
    const bookingId = params.vnp_TxnRef.split("_")[0];

    // Kiểm tra response code từ VNPay
    const responseCode = params.vnp_ResponseCode;
    let errorMessage = "";

    switch (responseCode) {
      case "24": // Người dùng hủy giao dịch
        errorMessage = "Bạn đã hủy giao dịch thanh toán";
        break;
      case "11": // Hết hạn thanh toán
        errorMessage = "Giao dịch đã hết hạn thanh toán";
        break;
      case "00": // Thành công - tiếp tục xử lý
        break;
      default: // Các trường hợp lỗi khác
        errorMessage = "Giao dịch không thành công";
    }

    // Nếu có lỗi, gọi API để cập nhật trạng thái thất bại
    if (errorMessage) {
      // Gọi API để cập nhật trạng thái
      console.log("[FE] Gọi return API với lỗi:", errorMessage, params);
      api
        .get("/bookings/vnpay/return", { params })
        .catch(() => {
          // Ngay cả khi API lỗi, vẫn chuyển hướng người dùng đến trang thất bại
          console.error("Failed to update payment status");
        })
        .finally(() => {
          navigate(
            `/payment/failed?message=${encodeURIComponent(
              errorMessage
            )}&bookingId=${bookingId || ""}`
          );
        });
      return;
    }

    // Nếu response code là "00", gọi API xác nhận thanh toán
    setLoading(true);
    console.log("[FE] Gọi return API xác nhận thanh toán:", params);
    api
      .get("/bookings/vnpay/return", { params })
      .then((response) => {
        console.log("[FE] Kết quả trả về từ BE:", response.data);
        if (!response.data.success) {
          throw new Error(
            response.data.message || "Xác nhận thanh toán thất bại"
          );
        }
      })
      .catch((err) => {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Giao dịch không thành công.";
        navigate(
          `/payment/failed?message=${encodeURIComponent(
            errorMessage
          )}&bookingId=${bookingId || ""}`
        );
      })
      .finally(() => setLoading(false));
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Đang xác nhận thanh toán...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="p-8 max-w-2xl w-full text-center">
        <div className="relative w-full max-w-sm lg:max-w-lg">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              preload="metadata"
            >
              <source
                src="https://stream.media.muscache.com/H0101WTUG2qWbyFhy02jlOggSkpsM9H02VOWN52g02oxhDVM.mp4?v_q=high"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
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
