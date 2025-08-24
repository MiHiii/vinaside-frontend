import { startOfToday, addDays, isBefore, isEqual, format } from 'date-fns';

export type YMD = string; // 'yyyy-MM-dd'

/**
 * Xây dựng các guard functions cho booking calendar
 * Logic:
 * - Check-in: không được rơi vào bookedDates
 * - Check-out: được phép rơi vào bookedDates nếu toàn bộ đêm trong khoảng [checkIn, checkOut - 1] không đụng bookedDates
 */
export function buildBookingGuards(bookedDates: YMD[]) {
  const booked = new Set(bookedDates);

  const toYMD = (d: Date): YMD => format(d, 'yyyy-MM-dd');

  // Có ngày kín nào trong [start, endExclusive)?
  const hasBlockInNights = (start: Date, endExclusive: Date): boolean => {
    // các đêm là các mốc ngày dạng YMD từ start đến (endExclusive - 1 ngày)
    for (let d = new Date(start); isBefore(d, endExclusive); d = addDays(d, 1)) {
      if (booked.has(toYMD(d))) return true;
    }
    return false;
  };

  // ===== Disabled predicate cho DayPicker =====
  // range.from tồn tại -> đang chọn "to"; else -> đang chọn "from"
  const isDisabled = (day: Date, range: { from?: Date | null; to?: Date | null }): boolean => {
    const dayStr = toYMD(day);

    // Chưa có from => đang chọn check-in
    if (!range?.from) {
      // Check-in vào ngày kín: cấm
      return booked.has(dayStr);
    }

    // Đang chọn check-out
    const from = range.from;
    if (isEqual(day, from) || isBefore(day, from)) return true; // không cho to <= from

    // Nếu to là ngày kín → chỉ cho nếu KHÔNG có block trong [from, to)
    if (booked.has(dayStr)) {
      return hasBlockInNights(from!, day); // true => disable, false => allow
    }

    // Nếu to là ngày thường → vẫn phải đảm bảo [from, to) không cắt qua ngày kín
    return hasBlockInNights(from!, day);
  };

  // Modifier: ngày kín nhưng hợp lệ để dùng làm checkout boundary
  const isCheckoutOK = (day: Date, range: { from?: Date | null; to?: Date | null }) => {
    if (!range?.from) return false;
    const dayStr = toYMD(day);
    if (!booked.has(dayStr)) return false;
    if (isEqual(day, range.from) || isBefore(day, range.from!)) return false;
    // hợp lệ làm checkout nếu không có block trong các đêm thực sự ở (from...day-1)
    return !hasBlockInNights(range.from!, day);
  };

  // Helper: range có hợp lệ chưa (sau khi user chọn)
  const isValidRange = (from?: Date | null, to?: Date | null): boolean => {
    if (!from || !to) return false;
    if (isEqual(from, to) || isBefore(to, from)) return false;
    return !hasBlockInNights(from, to);
  };

  return { isDisabled, isCheckoutOK, isValidRange, toYMD };
}

/**
 * Tính toán các ngày bị disable cho calendar booking (legacy function)
 * @deprecated Sử dụng buildBookingGuards thay thế
 */
export const calculateDisabledDates = (bookedDates: Date[]): Date[] => {
  const today = startOfToday();
  const disabledDates: Date[] = [];

  // Thêm các ngày quá khứ
  const pastDates = Array.from({ length: today.getDate() - 1 }, (_, i) => {
    const date = new Date();
    date.setDate(i + 1);
    return date;
  });
  disabledDates.push(...pastDates);

  // Disable tất cả các ngày trong bookedDates
  bookedDates.forEach((date) => {
    disabledDates.push(new Date(date));
  });

  return disabledDates;
};

/**
 * Kiểm tra xem một khoảng thời gian có hợp lệ không (legacy function)
 * @deprecated Sử dụng buildBookingGuards thay thế
 */
export const isValidDateRange = (checkIn: Date, checkOut: Date, bookedDates: Date[]): boolean => {
  const today = startOfToday();

  // Kiểm tra ngày quá khứ
  if (checkIn < today || checkOut < today) {
    return false;
  }

  // Kiểm tra xem có ngày nào trong khoảng thời gian nằm trong bookedDates không
  const current = new Date(checkIn);

  while (current <= checkOut) {
    // Kiểm tra cả ngày checkout
    if (bookedDates.some((d) => d.toDateString() === current.toDateString())) {
      return false;
    }
    current.setDate(current.getDate() + 1);
  }

  return true;
};
