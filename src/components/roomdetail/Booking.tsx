import { useState } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { PlusCircle, MinusCircle, ChevronDown, ChevronUp } from 'lucide-react';

// Cập nhật GuestCounterProps
interface GuestCounterProps {
  title: string;
  description: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  isIncrementDisabled?: boolean;
  isDecrementDisabled?: boolean;
  underlineDescription?: boolean; 
}

// Đổi thành named export để có thể import riêng lẻ
export const GuestCounter: React.FC<GuestCounterProps> = ({
  title,
  description,
  count,
  onIncrement,
  onDecrement,
  isIncrementDisabled,
  isDecrementDisabled,
  underlineDescription, // Nhận prop mới
}) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium">{title}</p>
        {/* Áp dụng class 'underline' có điều kiện */}
        <p className={`text-sm text-black ${underlineDescription ? 'underline' : ''}`}>
          {description}
        </p> 
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-8 h-8"
          onClick={onDecrement}
          disabled={isDecrementDisabled}
        >
          <MinusCircle className={`w-6 h-6 ${isDecrementDisabled ? 'text-gray-300' : 'text-gray-700'}`} />
        </Button>
        <span className="text-lg w-4 text-center">{count}</span>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-8 h-8"
          onClick={onIncrement}
          disabled={isIncrementDisabled}
        >
          <PlusCircle className={`w-6 h-6 ${isIncrementDisabled ? 'text-gray-300' : 'text-gray-700'}`} />
        </Button>
      </div>
    </div>
  );
};

const MAX_GUESTS_ADULTS_CHILDREN = 2;
const MIN_ADULTS = 1;

// Giữ nguyên default export cho BookingForm
export default function BookingForm() {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [numInfants, setNumInfants] = useState(0);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [guestPopoverOpen, setGuestPopoverOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<'from' | 'to'>('from');

  const totalGuestsAdultsChildren = numAdults + numChildren;

  const handleCalendarOpenChange = (newOpen: boolean) => {
    setCalendarOpen(newOpen);
    if (newOpen) {
      if (!date?.from) {
        setActiveButton('from');
      } else if (date.from && !date.to) {
        setActiveButton('to');
      }
    }
  };

  const handleDateSelect = (selectedRange: DateRange | undefined) => {
    if (selectedRange?.from && selectedRange.to && selectedRange.from.getTime() === selectedRange.to.getTime()) {
      setDate({ from: selectedRange.from, to: undefined }); 
      setActiveButton('to'); 
    }
    else if (selectedRange?.from && selectedRange.to) {
      setDate(selectedRange);
      setCalendarOpen(false); 
    }
    else if (selectedRange?.from) {
      setDate({ from: selectedRange.from, to: undefined });
      setActiveButton('to');
    }
    else {
      setDate({ from: undefined, to: undefined });
      setActiveButton('from');
    }
  };

  const clearFromDateInPopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate({ from: undefined, to: undefined });
    setActiveButton('from');
  };

  const clearToDateInPopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(prev => ({ from: prev?.from, to: undefined }));
    setActiveButton('to');
  };
  
  const handleClearAllDatesInPopover = () => {
    setDate({ from: undefined, to: undefined });
    setActiveButton('from');
  };

  const handleAdultsChange = (operation: 'increment' | 'decrement') => {
    setNumAdults(prev => {
      const newValue = operation === 'increment' ? prev + 1 : prev - 1;
      if (newValue < MIN_ADULTS) return MIN_ADULTS;
      if (operation === 'increment' && (newValue + numChildren) > MAX_GUESTS_ADULTS_CHILDREN) return prev;
      return newValue;
    });
  };

  const handleChildrenChange = (operation: 'increment' | 'decrement') => {
    setNumChildren(prev => {
      const newValue = operation === 'increment' ? prev + 1 : prev - 1;
      if (newValue < 0) return 0;
      if (operation === 'increment' && (numAdults + newValue) > MAX_GUESTS_ADULTS_CHILDREN) return prev;
      return newValue;
    });
  };

  const handleInfantsChange = (operation: 'increment' | 'decrement') => {
    setNumInfants(prev => {
      const newValue = operation === 'increment' ? prev + 1 : prev - 1;
      if (newValue < 0) return 0;
      if (newValue > 5) return 5; 
      return newValue;
    });
  };

  const guestDisplayValue = () => {
    const count = numAdults + numChildren;
    let text = `${count} khách`;
    if (numInfants > 0) {
      text += `, ${numInfants} em bé`;
    }
    return text;
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <Card className="w-[400px] shadow-xl rounded-sm border-gray-200 ">
        <CardContent className="p-6">
          <div className="">
            <p className="text-xl font-semibold mb-5 ">Thêm ngày để xem giá</p>
          </div>

          <div className="rounded-sm border overflow-hidden">
            
            <div className="grid grid-cols-2 border-b">
              {/* NHẬN PHÒNG Section */}
              <div className="flex flex-col">
                <span className="text-xs font-semibold px-3 pt-2 text-gray-700">NHẬN PHÒNG</span>
                <Popover open={calendarOpen} onOpenChange={handleCalendarOpenChange}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left font-normal rounded-none px-3 py-2"
                      onClick={() => {
                        setActiveButton('from'); 
                        setCalendarOpen(true);
                      }}
                    >
                      {date?.from ? format(date.from, "dd/MM/yyyy") : "Thêm ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    side="bottom"
                    
                    className="fixed   p-0 border-0 shadow-2xl rounded-2xl z-10 min-w-[600px] bg-white -translate-x-56"
                    style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
                  >
                    {/* Calendar PopoverContent */}
                    <div className="p-6 ">
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold whitespace-nowrap">Chọn ngày</div>
                            <div className="text-gray-500 text-sm">Thêm ngày đi để biết giá chính xác</div>
                          </div>
                          <div className="flex rounded-md overflow-hidden border border-gray-300 w-[280px]">
                            <div
                              className="flex-1 px-3 py-1.5 rounded-l-md bg-white text-black text-left cursor-pointer"
                              style={{ 
                                fontWeight: 600, 
                                borderWidth: activeButton === 'from' ? 2 : 0, 
                                borderColor: '#000' 
                              }}
                              onClick={() => setActiveButton('from')}
                            >
                              <div className="text-xs font-bold">NHẬN PHÒNG</div>
                              <div className="text-base font-normal text-gray-700 flex items-center justify-between w-full">
                                <span>{date?.from ? format(date.from, "dd/MM/yyyy") : "Thêm ngày"}</span>
                                {date?.from && (
                                  <button
                                    onClick={clearFromDateInPopover}
                                    className="ml-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-xs leading-none"
                                    aria-label="Xóa ngày nhận phòng trong lịch"
                                  >
                                    &#x2715;
                                  </button>
                                )}
                              </div>
                            </div>
                            <div
                              className={`flex-1 px-3 py-1.5 rounded-r-md text-left ${
                                date?.from ? 'bg-white text-black cursor-pointer' : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                              }`}
                              style={{ 
                                fontWeight: 600, 
                                borderWidth: activeButton === 'to' ? 2 : 0, 
                                borderColor: '#000' 
                              }}
                              onClick={() => { if (date?.from) setActiveButton('to'); }}
                            >
                              <div className="text-xs font-bold">TRẢ PHÒNG</div>
                              <div className="text-base font-normal flex items-center justify-between w-full">
                                <span className={!date?.from && !date?.to ? 'text-gray-400' : ''}>
                                  {date?.to ? format(date.to, "dd/MM/yyyy") : "Thêm ngày"}
                                </span>
                                {date?.to && (
                                  <button
                                    onClick={clearToDateInPopover}
                                    className="ml-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-xs leading-none"
                                    aria-label="Xóa ngày trả phòng trong lịch"
                                  >
                                    &#x2715;
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col h-full">
                        <Calendar
                          mode="range"
                          selected={date}
                          onSelect={handleDateSelect}
                          initialFocus={activeButton === 'from' || !date?.from}
                          numberOfMonths={2}
                          className="gap-10"
                          classNames={{
                            day: "h-9 w-9 p-0 font-normal rounded-full flex items-center justify-center !text-black",
                            day_selected: "bg-black text-white",
                            day_range_start: "bg-black !text-white",
                            day_range_end: "bg-black !text-white",
                            day_range_middle: "bg-white text-black",
                            day_outside: "text-gray-300",
                            day_disabled: "text-gray-300 opacity-50 cursor-not-allowed",
                            day_today: "",
                          }}
                          disabled={activeButton === 'to' && date?.from ? [date.from, { before: date.from }] : undefined}
                        />
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="ghost" onClick={handleClearAllDatesInPopover}>Xóa ngày</Button>
                          <Button onClick={() => setCalendarOpen(false)} className="ml-2 bg-black text-white hover:bg-black/90">Đóng</Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {/* TRẢ PHÒNG Section */}
              <div className="flex flex-col border-l">
                <span className="text-xs font-semibold px-3 pt-2 text-gray-700">TRẢ PHÒNG</span>
                <Popover open={calendarOpen} onOpenChange={handleCalendarOpenChange}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left font-normal rounded-none px-3 py-2"
                      onClick={() => {
                        if (date?.from) { 
                          setActiveButton('to');
                          setCalendarOpen(true);
                        } else {
                          setActiveButton('from');
                          setCalendarOpen(true);
                        }
                      }}
                      disabled={!date?.from && !calendarOpen} 
                    >
                      {date?.to ? format(date.to, "dd/MM/yyyy") : "Thêm ngày"}
                    </Button>
                  </PopoverTrigger>
                  {/* PopoverContent is shared for calendar */}
                </Popover>
              </div>
              
            </div>
            {/* Guest Selection Section */}
            <div className="flex flex-col ">
              <span className="text-xs font-semibold px-3 pt-2 text-gray-700">KHÁCH</span>
              <Popover open={guestPopoverOpen} onOpenChange={setGuestPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline" 
                    className="w-full justify-between text-left font-normal rounded-none px-3 py-2  text-black border-0 "
                  >
                    <span>{guestDisplayValue()}</span>
                    {guestPopoverOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                 side="bottom"
                  
                  className="w-[350px] fixed p-0 bg-white border border-gray-200 shadow-xl rounded-xl z-40"
                  align="start" >
                  <div className="p-4 space-y-2">
                    <GuestCounter
                      title="Người lớn"
                      description="Từ 13 tuổi trở lên"
                      count={numAdults}
                      onIncrement={() => handleAdultsChange('increment')}
                      onDecrement={() => handleAdultsChange('decrement')}
                      isDecrementDisabled={numAdults <= MIN_ADULTS}
                      isIncrementDisabled={totalGuestsAdultsChildren >= MAX_GUESTS_ADULTS_CHILDREN}
                    />
                    <GuestCounter
                      title="Trẻ em"
                      description="Độ tuổi 2 – 12"
                      count={numChildren}
                      onIncrement={() => handleChildrenChange('increment')}
                      onDecrement={() => handleChildrenChange('decrement')}
                      isDecrementDisabled={numChildren <= 0}
                      isIncrementDisabled={totalGuestsAdultsChildren >= MAX_GUESTS_ADULTS_CHILDREN}
                    />
                    <GuestCounter
                      title="Em bé"
                      description="Dưới 2 tuổi"
                      count={numInfants}
                      onIncrement={() => handleInfantsChange('increment')}
                      onDecrement={() => handleInfantsChange('decrement')}
                      isDecrementDisabled={numInfants <= 0}
                      isIncrementDisabled={numInfants >= 5} 
                    />
                     <GuestCounter 
                      title="Thú cưng"
                      description="Bạn sẽ mang theo động vật phục vụ?"
                      count={0}
                      onIncrement={() => {}}
                      onDecrement={() => {}}
                      isDecrementDisabled={true}
                      isIncrementDisabled={true}
                      underlineDescription={true} // Truyền prop mới ở đây
                    />
                  </div>
                  <div className="px-4 pb-4">
                     <p className="text-xs text-gray-600 mb-3">
                       Chỗ ở này cho phép tối đa {MAX_GUESTS_ADULTS_CHILDREN} khách, không tính em bé. Không được phép mang theo thú cưng.
                     </p>
                     <div className="flex justify-end pt-2"> 
                        <Button
                          variant="link"
                          className="text-black underline font-semibold px-0 py-0 h-auto"
                          onClick={() => setGuestPopoverOpen(false)}
                        >
                          Đóng
                        </Button>
                      </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button className="w-full text-white h-[50px] py-4 text-lg font-semibold rounded-sm mt-4" style={{ backgroundColor: "#da175f" }} >
            Kiểm tra tình trạng còn phòng
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
