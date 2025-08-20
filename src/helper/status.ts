// Define the return type for payment status
export interface PaymentStatusVM {
  label: string;
  color: string;
}

export const getStatusVN = (status: string) => {
  switch (status) {
    case "pending":
      return {
        label: "Chờ xác nhận",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      };
    case "confirmed":
      return {
        label: "Đã xác nhận",
        color: "text-green-600 bg-green-50 border-green-200",
      };
    case "completed":
      return {
        label: "Đã hoàn thành",
        color: "text-blue-600 bg-blue-50 border-blue-200",
      };
    case "cancelled":
      return {
        label: "Đã hủy",
        color: "text-red-600 bg-red-50 border-red-200",
      };
    case "rejected":
      return {
        label: "Bị từ chối",
        color: "text-red-600 bg-red-50 border-red-200",
      };
    default:
      return {
        label: status,
        color: "text-gray-600 bg-gray-50 border-gray-200",
      };
  }
};

export function getPaymentStatusVN(status: string): PaymentStatusVM {
  switch (status) {
    case "pending":
      return {
        label: "Chờ thanh toán",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      };
    case "unpaid":
      return {
        label: "Chưa trả",
        color: "text-red-600 bg-red-50 border-red-200",
      };
    case "paid":
      return {
        label: "Đã thanh toán",
        color: "text-green-600 bg-green-50 border-green-200",
      };
    case "refunding":
      return {
        label: "Đang hoàn tiền",
        color: "text-orange-600 bg-orange-50 border-orange-200",
      };
    case "refunded":
      return {
        label: "Đã hoàn tiền",
        color: "text-blue-600 bg-blue-50 border-blue-200",
      };
    case "failed":
      return {
        label: "Thanh toán thất bại",
        color: "text-red-600 bg-red-50 border-red-200",
      };
    case "partially_paid":
      return {
        label: "Cần thanh toán thêm",
        color: "text-orange-600 bg-orange-50 border-orange-200",
      };
    default:
      return {
        label: status,
        color: "text-gray-600 bg-gray-50 border-gray-200",
      };
  }
}
