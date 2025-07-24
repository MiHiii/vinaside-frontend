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
export function getPaymentStatusVN(status: string) {
  switch (status) {
    case 'pending':
      return { label: 'Chờ thanh toán', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    case 'paid':
      return { label: 'Đã thanh toán', color: 'text-green-600 bg-green-50 border-green-200' };
    case 'refunded':
      return { label: 'Đã hoàn tiền', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    case 'failed':
      return { label: 'Thanh toán thất bại', color: 'text-red-600 bg-red-50 border-red-200' };
    case 'partially_paid':
      return { label: 'Đã cọc tiền', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    default:
      return { label: status, color: 'text-gray-600 bg-gray-50 border-gray-200' };
  }
}
