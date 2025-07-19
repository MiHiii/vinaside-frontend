export const getStatusVN = (status: string) => {
  switch (status) {
    case "pending":
      return { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" };
    case "confirmed":
      return { label: "Đã xác nhận", color: "bg-green-100 text-green-800" };
    case "completed":
      return { label: "Hoàn thành", color: "bg-blue-100 text-blue-800" };
    case "cancelled":
      return { label: "Đã huỷ", color: "bg-red-100 text-red-800" };
    case "rejected":
      return { label: "Từ chối", color: "bg-gray-200 text-gray-700" };
    default:
      return { label: status, color: "bg-gray-100 text-gray-700" };
  }
};
export const getPaymentStatusVN = (status: string) => {
  switch (status) {
    case "pending":
      return {
        label: "Chờ thanh toán",
        color: "bg-yellow-100 text-yellow-800",
      };
    case "paid":
      return { label: "Đã thanh toán", color: "bg-green-100 text-green-800" };
    case "refunded":
      return { label: "Đã hoàn tiền", color: "bg-blue-100 text-blue-800" };
    case "failed":
      return { label: "Thanh toán thất bại", color: "bg-red-100 text-red-800" };
    default:
      return { label: status, color: "bg-gray-100 text-gray-700" };
  }
};
