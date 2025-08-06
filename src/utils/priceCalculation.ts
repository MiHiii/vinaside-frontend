import { Listing, IListing } from "@/types/listing";

/**
 * Tính số ngày cuối tuần giống như Backend
 * @param checkInDate - Ngày check-in
 * @param checkOutDate - Ngày check-out
 * @returns Số ngày cuối tuần
 */
export const calculateWeekendDays = (checkInDate: Date, checkOutDate: Date): number => {
  let weekendDays = 0;
  const currentDate = new Date(checkInDate);

  console.log("[DEBUG] calculateWeekendDays - Input:", {
    checkInDate: checkInDate.toISOString(),
    checkOutDate: checkOutDate.toISOString(),
    checkInLocal: checkInDate.toLocaleDateString('vi-VN'),
    checkOutLocal: checkOutDate.toLocaleDateString('vi-VN'),
  });

  // Không tính ngày checkout (< thay vì <=)
  while (currentDate < checkOutDate) {
    const dayOfWeek = currentDate.getDay();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    const localDate = currentDate.toLocaleDateString('vi-VN');
    
    console.log("[DEBUG] Checking date:", {
      date: currentDate.toISOString(),
      localDate,
      dayOfWeek,
      dayName,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6
    });
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // 0 = Sunday, 6 = Saturday (giống Backend)
      weekendDays++;
      console.log("[DEBUG] Weekend day found:", {
        date: currentDate.toISOString(),
        localDate,
        dayOfWeek,
        dayName,
        weekendDays
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log("[DEBUG] calculateWeekendDays - Result:", { weekendDays });
  return weekendDays;
};

/**
 * Tính weekend surcharge giống như Backend
 * @param listing - Thông tin listing
 * @param checkInDate - Ngày check-in
 * @param checkOutDate - Ngày check-out
 * @returns Số tiền weekend surcharge
 */
export const calculateWeekendSurcharge = (
  listing: Listing | IListing,
  checkInDate: Date,
  checkOutDate: Date
): number => {
  console.log("[DEBUG] calculateWeekendSurcharge - Input:", {
    has_weekend_surcharge: listing.has_weekend_surcharge,
    weekend_surcharge_percent: listing.weekend_surcharge_percent,
    price_per_night: listing.price_per_night,
    checkInDate: checkInDate.toISOString(),
    checkOutDate: checkOutDate.toISOString(),
    checkInLocal: checkInDate.toLocaleDateString('vi-VN'),
    checkOutLocal: checkOutDate.toLocaleDateString('vi-VN'),
  });

  if (!listing.has_weekend_surcharge || !listing.weekend_surcharge_percent) {
    console.log("[DEBUG] calculateWeekendSurcharge - No surcharge applied");
    return 0;
  }

  const weekendDays = calculateWeekendDays(checkInDate, checkOutDate);
  const surchargePercent = listing.weekend_surcharge_percent || 0;
  const pricePerNight = listing.price_per_night || 0;
  
  const result = Math.round((pricePerNight * weekendDays * surchargePercent) / 100);
  
  console.log("[DEBUG] calculateWeekendSurcharge - Calculation:", {
    weekendDays,
    surchargePercent,
    pricePerNight,
    calculation: `${pricePerNight} * ${weekendDays} * ${surchargePercent} / 100`,
    result
  });
  
  return result;
}; 