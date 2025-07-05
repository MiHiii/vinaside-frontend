import { useState, useEffect } from "react";
import { api } from "@/services/api";

export const useBookedDates = (listingId: string) => {
  const [bookedDates, setBookedDates] = useState<Date[]>([]);

  const fetchBookedDates = async () => {
    try {
      const res = await api.get(`/bookings/booked-dates/${listingId}`);
      console.log("Full response:", res.data);

      const rawDates = res.data?.data?.bookedDates || [];
      console.log("Ngày đã đặt:", rawDates);

      const converted = rawDates.map((d: string) => {
        const [year, month, day] = d.split("-");
        return new Date(Number(year), Number(month) - 1, Number(day));
      });

      console.log("Ngày sau khi convert:", converted);
      setBookedDates(converted);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ngày đã đặt:", error);
    }
  };

  useEffect(() => {
    if (listingId) {
      fetchBookedDates();
    }
  }, [listingId]);

  return { bookedDates, refetch: fetchBookedDates };
};
