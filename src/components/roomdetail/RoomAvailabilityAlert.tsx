// components/RoomAvailabilityAlert.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function RoomAvailabilityAlert() {
  return (
    <Card className=" rounded-xl border-none shadow-[0_-1px_4px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.1)]">
      <CardContent className="flex items-center space-x-3 p-4">
        {/*
          Inline SVG “kim cương” 4 mặt cắt, mỗi mặt cắt dùng tông hồng khác nhau.
          Kích thước SVG là 24×24, đặt flex-shrink-0 để không bị co lại.
        */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Không dùng gradient, dùng 4 màu khác nhau để giả lập các mặt cắt */}
          </defs>
          {/* Mặt trên bên phải */}
          <polygon points="12,2 22,12 12,12" fill="#F9A8D4" />
          {/* Mặt trên bên trái */}
          <polygon points="12,2 12,12 2,12" fill="#F472B6" />
          {/* Mặt dưới bên trái */}
          <polygon points="2,12 12,12 12,22" fill="#EC4899" />
          {/* Mặt dưới bên phải */}
          <polygon points="12,12 22,12 12,22" fill="#F9A8D4" />
          {/* Viền chạy xung quanh để tạo cảm giác “cắt” rõ hơn */}
          <polygon
            points="12,2 22,12 12,22 2,12"
            fill="none"
            stroke="#EC4899"
            strokeWidth="1"
          />
        </svg>

        <span className="text-sm font-medium text-gray-800">
          Hiếm khi còn phòng! Chỗ ở này thường kín phòng
        </span>
      </CardContent>
    </Card>
  );
}
