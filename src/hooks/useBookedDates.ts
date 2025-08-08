import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';

export const useBookedDates = (listingId: string) => {
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBookedDates = useCallback(async () => {
    if (!listingId || isLoading) return;
    
    try {
      console.log("🔄 useBookedDates: Fetching booked dates for listingId:", listingId);
      setIsLoading(true);
      const res = await api.get(`/bookings/booked-dates/${listingId}`);
      console.log('Full response:', res.data);

      const rawDates = res.data?.data?.bookedDates || [];
      console.log('Ngày đã đặt:', rawDates);

      const converted = rawDates.map((d: string) => {
        const [year, month, day] = d.split('-');
        return new Date(Number(year), Number(month) - 1, Number(day));
      });

      console.log('Ngày sau khi convert:', converted);
      setBookedDates(converted);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách ngày đã đặt:', error);
    } finally {
      setIsLoading(false);
    }
  }, [listingId, isLoading]);

  useEffect(() => {
    if (listingId) {
      console.log("🔄 useBookedDates: useEffect triggered for listingId:", listingId);
      fetchBookedDates();
    }
  }, [listingId]); // Chỉ phụ thuộc vào listingId, không phụ thuộc vào fetchBookedDates

  return { bookedDates, refetch: fetchBookedDates, isLoading };
};
