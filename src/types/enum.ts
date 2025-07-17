/**
 * Trạng thái của bài đăng (listing)
 */
export enum ListingStatus {
  /** Bản nháp - chưa công khai */
  DRAFT = "DRAFT",

  /** Đã công khai */
  PUBLISHED = "PUBLISHED",

  /** Đã gỡ khỏi danh sách */
  UNLISTED = "UNLISTED",

  /** Lưu trữ - không còn sử dụng */
  ARCHIVED = "ARCHIVED",
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
     REFUNDED = "refunded",
     FAILED = "failed",
   }

   export enum BookingStatus {
     PENDING = "pending",
     CONFIRMED = "confirmed",
     CANCELLED = "cancelled",
     COMPLETED = "completed",
     REJECTED = "rejected",
   }

