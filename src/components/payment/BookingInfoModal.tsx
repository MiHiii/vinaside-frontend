import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { startOfToday, format } from 'date-fns';
import { buildBookingGuards } from '@/utils/dateUtils';

interface BookingInfoModalProps {
  open: boolean;
  onClose: () => void;
  initialDateRange: DateRange | undefined;
  initialGuests: { adults: number; infants: number };
  maxGuests: number;
  allowInfants?: boolean;
  maxInfants: number;
  bookedDates: Date[];
  onSave: (data: { dateRange: DateRange | undefined; guests: { adults: number; infants: number } }) => void;
}

const BookingInfoModal: React.FC<BookingInfoModalProps> = ({
  open,
  onClose,
  initialDateRange,
  initialGuests,
  maxGuests,
  allowInfants,
  maxInfants,
  bookedDates,
  onSave,
}) => {
  const [tab, setTab] = useState<'date' | 'guest'>('date');
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [guests, setGuests] = useState(initialGuests);

  // Chuyển đổi bookedDates từ Date[] sang YMD[]
  const bookedDatesYMD = useMemo(() => {
    return bookedDates.map((date: Date) => format(date, 'yyyy-MM-dd'));
  }, [bookedDates]);

  // Tạo booking guards
  const guards = useMemo(() => buildBookingGuards(bookedDatesYMD), [bookedDatesYMD]);

  const handleSave = () => {
    onSave({ dateRange, guests });
    onClose();
  };

  const handleChange = (key: 'adults' | 'infants', delta: number) => {
    setGuests((prev) => {
      let next = prev[key] + delta;
      if (key === 'adults') {
        if (next < 1) next = 1;
        if (next > maxGuests) next = maxGuests;
      }
      if (key === 'infants') {
        if (!allowInfants) return prev;
        if (next < 0) next = 0;
        if (next > maxInfants) next = maxInfants;
      }
      return { ...prev, [key]: next };
    });
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) {
      setDateRange(range);
      return;
    }

    // Sử dụng guards để kiểm tra tính hợp lệ
    if (!guards.isValidRange(range.from, range.to)) {
      setDateRange(undefined);
      return;
    }

    setDateRange(range);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogTitle>Chỉnh sửa thông tin đặt phòng</DialogTitle>
        <DialogDescription>Thay đổi ngày đặt phòng hoặc số lượng khách</DialogDescription>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <div className='col-span-4'>
              <div className='flex space-x-2 mb-4'>
                <button
                  onClick={() => setTab('date')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    tab === 'date' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  Ngày đặt
                </button>
                <button
                  onClick={() => setTab('guest')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    tab === 'guest' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  Số khách
                </button>
              </div>

              {tab === 'date' && (
                <div className='space-y-4'>
                  <Calendar
                    mode='range'
                    selected={dateRange}
                    onSelect={handleSelect}
                    numberOfMonths={2}
                    disabled={(day) => guards.isDisabled(day, dateRange || {})}
                    fromDate={startOfToday()}
                    className='rounded-md border'
                    modifiers={{
                      // Hiển thị gạch các ngày kín
                      booked: (day) => bookedDatesYMD.includes(guards.toYMD(day)),
                      // Ngày kín nhưng được phép chọn làm checkout
                      checkoutOK: (day) => guards.isCheckoutOK(day, dateRange || {}),
                    }}
                    modifiersClassNames={{
                      booked:
                        'text-red-500 line-through opacity-80 cursor-not-allowed bg-red-100 border border-red-200',
                      checkoutOK:
                        'text-red-500 opacity-100 cursor-pointer bg-red-50 border-2 border-dashed border-red-300',
                    }}
                  />
                </div>
              )}

              {tab === 'guest' && (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Người lớn</span>
                    <div className='flex items-center space-x-2'>
                      <button
                        onClick={() => handleChange('adults', -1)}
                        className='w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50'>
                        -
                      </button>
                      <span className='w-8 text-center'>{guests.adults}</span>
                      <button
                        onClick={() => handleChange('adults', 1)}
                        className='w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50'>
                        +
                      </button>
                    </div>
                  </div>

                  {allowInfants && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Trẻ em</span>
                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() => handleChange('infants', -1)}
                          className='w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50'>
                          -
                        </button>
                        <span className='w-8 text-center'>{guests.infants}</span>
                        <button
                          onClick={() => handleChange('infants', 1)}
                          className='w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50'>
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='flex justify-end space-x-2'>
          <Button variant='outline' onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingInfoModal;
