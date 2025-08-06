/**
 * Trạng thái của bài đăng (listing)
 */
export enum ListingStatus {
  /** Phòng đang hoạt động và hiển thị */
  ACTIVE = "active",

  /** Tạm ngưng hiển thị */
  INACTIVE = "inactive",
}

/**
 * Chính sách hủy đặt phòng
 */
export enum CancelPolicy {
  /** Linh hoạt - hủy gần ngày vẫn được hoàn tiền */
  FLEXIBLE = "FLEXIBLE",

  /** Trung bình - hoàn tiền một phần nếu hủy trễ */
  MODERATE = "MODERATE",

  /** Nghiêm ngặt - không hoàn tiền nếu quá hạn */
  STRICT = "STRICT",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  REFUNDING = "refunding",
  REFUNDED = "refunded",
  FAILED = "failed",
  PARTIALLY_PAID = "partially_paid",
}

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  REJECTED = "rejected",
}
