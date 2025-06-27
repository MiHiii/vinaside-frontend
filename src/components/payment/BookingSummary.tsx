import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Button } from "../ui/button";
import BookingInfoModal from "./BookingInfoModal";
import React, { useState } from "react";
import PriceDetailModal from "./PriceDetailModal";
export default function BookingSummary() {
  const [open, setOpen] = useState(false);
  const [showPriceDetail, setShowPriceDetail] = useState(false);

  return (
    <>
      <Card className="sticky top-6 max-w-sm border rounded-2xl border-gray-200">
        <CardContent className="p-6 space-y-6">
          {/* Property Info */}
          <div className="flex gap-4">
            <img
              src="https://image-storage-mihi.sgp1.digitaloceanspaces.com/uploads/users/68444f6f406fe2fffadbbda1/user_1750707941428-942951940.webp"
              alt="Property"
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-medium text-sm mb-1">
                (401TTD) Studio nhỏ gọn với tầm nhìn đẹp
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  <span>5.0 (13)</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Được khách yêu thích
                </Badge>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Hủy miễn phí</h4>
            <p className="text-sm text-gray-600">
              Hủy trước 7 thg 8 để được hoàn tiền đầy đủ. <br />
              <span className="underline cursor-pointer text-black">
                Toàn bộ chính sách
              </span>
            </p>
          </div>

          {/* Trip Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-sm">Thông tin chuyến đi</h4>
              <Button
                onClick={() => setOpen(true)}
                variant="link"
                size="sm"
                className="text-sm bg-gray-100 p-0 h-7 w-20 hover:no-underline hover:bg-gray-200"
              >
                Thay đổi
              </Button>
            </div>
            <div className="space-y-1 text-sm">
              <p>8 – 10 thg 8, 2025</p>
              <p>1 người lớn</p>
            </div>
            <BookingInfoModal open={open} onClose={() => setOpen(false)} />
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium text-sm">Chi tiết giá</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>₫453.618 x 2 đêm</span>
                <span>₫907.236</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between font-medium">
              <span>Tổng VND</span>
              <span>₫907.236</span>
            </div>
            <a
              href="#"
              className="text-sm text-black mt-1 underline cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setShowPriceDetail(true);
              }}
            >
              Chi tiết giá
            </a>

            <PriceDetailModal
              open={showPriceDetail}
              onClose={() => setShowPriceDetail(false)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Thông báo ra ngoài Card */}
      <div className="flex gap-3 p-4 rounded-lg mt-4 max-w-sm">
        {/* SVG kim cương thay cho <Diamond /> */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0 mt-0.5"
        >
          <polygon
            points="16,28 4,12 10,4 22,4 28,12"
            fill="#fff"
            stroke="#ff4da6"
            strokeWidth="2"
            opacity="0.2"
          />
          <polygon
            points="16,28 4,12 10,4 22,4 28,12"
            fill="none"
            stroke="#ff4da6"
            strokeWidth="2"
          />
          <line
            x1="16"
            y1="28"
            x2="16"
            y2="4"
            stroke="#ff4da6"
            strokeWidth="2"
          />
          <line
            x1="10"
            y1="4"
            x2="22"
            y2="4"
            stroke="#ff4da6"
            strokeWidth="2"
          />
          <line
            x1="4"
            y1="12"
            x2="28"
            y2="12"
            stroke="#ff4da6"
            strokeWidth="2"
          />
          <line
            x1="10"
            y1="4"
            x2="16"
            y2="28"
            stroke="#ff4da6"
            strokeWidth="2"
          />
          <line
            x1="22"
            y1="4"
            x2="16"
            y2="28"
            stroke="#ff4da6"
            strokeWidth="2"
          />
        </svg>
        <div className="text-sm">
          <p className="font-medium">Nơi này rất hiếm khi còn chỗ.</p>
          <p className="text-gray-600">
            Nhà/phòng cho thuê của Squirrel Village thường kín phòng.
          </p>
        </div>
      </div>
    </>
  );
}
