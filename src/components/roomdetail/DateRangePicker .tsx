import React from "react"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"

interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="relative w-fit p-4 bg-white shadow-md rounded-xl">
      <style>
        {`
          .rdp-months {
            display: flex !important;
            gap: 3rem !important;
          }
          .rdp-nav_button {
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
            background: transparent !important;
            color: inherit !important;
            font-size: 6rem !important;
          }
          .rdp-button {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          .rdp-button:hover {
            background: transparent !important;
            color: #000 !important;
          }
          .rdp-nav_button svg {
            transform: scale(3.5);
          }
        `}
      </style>
      <Calendar
        mode="range"
        selected={value}
        onSelect={onChange}
        numberOfMonths={2}
        className="bg-transparent shadow-none border-none width-full"
      />
      <button
        className="absolute text-sm hover:underline mr-8"
        style={{ right: '0', top: '100%' }}
        onClick={() => onChange(undefined)}
      >
        Xóa ngày
      </button>
    </div>
  )
}
