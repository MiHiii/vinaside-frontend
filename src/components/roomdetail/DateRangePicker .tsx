import React, { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"

export default function DateRangePickerInline() {
  const [range, setRange] = useState<DateRange | undefined>()

  return (
    <div className="relative w-fit p-4 rounded-lg">
      {/* Tùy chỉnh spacing giữa 2 tháng */}
      <style>
        {`
          .rdp-months {
            display: flex !important;
            gap: 3rem !important;
          }

          /* Loại bỏ viền và hiệu ứng cho các nút điều hướng */
          .rdp-nav_button {
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
            background: transparent !important;
            color: inherit !important; /* Đảm bảo mũi tên có màu sắc giống với văn bản */
            font-size: 6rem !important;
          }

          /* Loại bỏ viền cho các nút chuyển tháng */
          .rdp-button {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }

          /* Tùy chỉnh màu sắc và hiệu ứng hover */
          .rdp-button:hover {
            background: transparent !important;
            color: #000 !important; /* Thay đổi màu chữ nếu cần */
          }
      .rdp-nav_button svg {
            transform: scale(3.5); /* Tăng kích thước mũi tên */
          }
        `}
      </style>

      {/* Lịch 2 tháng */}
      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange}
        numberOfMonths={2}
        className="bg-transparent shadow-none border-none width-full"
      />

      {/* Nút xóa ngày: đặt đúng vị trí */}
      <button
        className="absolute text-sm hover:underline mr-8"
        style={{ right: '0', top: '100%' }}
        onClick={() => setRange(undefined)}
      >
        Xóa ngày
      </button>
    </div>
  )
}
