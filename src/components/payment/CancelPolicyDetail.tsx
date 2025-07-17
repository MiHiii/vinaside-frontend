import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, subDays } from "date-fns";
import { useState } from "react";

interface CancelPolicyDetailProps {
  policy?: string;
  checkInDate: string;
}

export default function CancelPolicyDetail({
  policy,
  checkInDate,
}: CancelPolicyDetailProps) {
  const [open, setOpen] = useState(false);

  const renderShort = () => {
    switch (policy) {
      case "flexible":
        return "Huỷ miễn phí trước ngày nhận phòng";
      case "moderate":
        return "Huỷ miễn phí trước 5 ngày nhận phòng";
      case "strict":
        return "Không hoàn tiền sau khi đặt";
      default:
        return "Chưa rõ chính sách huỷ";
    }
  };

  const renderDetail = () => {
    const checkIn = new Date(checkInDate);
    const fiveDaysBefore = format(subDays(checkIn, 5), "dd/MM/yyyy");
    const oneDayBefore = format(subDays(checkIn, 1), "dd/MM/yyyy");
    const formattedCheckIn = format(checkIn, "dd/MM/yyyy");

    switch (policy) {
      case "flexible":
        return (
          <>
            <p>
              Nhận phòng vào <strong>{formattedCheckIn}</strong>.
            </p>
            <p>
              Huỷ trước <strong>{oneDayBefore} 14:00</strong>: hoàn tiền đầy đủ.
            </p>
            <p>
              Huỷ sau thời điểm trên hoặc không đến nhận phòng: mất phí đêm đầu
              tiên.
            </p>
          </>
        );
      case "moderate":
        return (
          <>
            <p>
              Nhận phòng vào <strong>{formattedCheckIn}</strong>.
            </p>
            <p>
              Huỷ trước <strong>{fiveDaysBefore} 14:00</strong>: hoàn tiền đầy
              đủ.
            </p>
            <p>
              Huỷ sau thời điểm trên: hoàn 50% tiền phòng, phí dịch vụ không
              hoàn.
            </p>
          </>
        );
      case "strict":
        return (
          <>
            <p>
              Nhận phòng vào <strong>{formattedCheckIn}</strong>.
            </p>
            <p>
              Sau khi đặt phòng: không hoàn tiền trong mọi trường hợp, trừ bất
              khả kháng.
            </p>
          </>
        );
      default:
        return <p>Chưa rõ chính sách huỷ áp dụng cho chỗ ở này.</p>;
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 text-sm">
        <p>{renderShort()}</p>
        {policy && (
          <Button variant="link" size="sm" onClick={() => setOpen(true)}>
            Tìm hiểu thêm
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết chính sách huỷ</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">{renderDetail()}</div>
          <div className="pt-4">
            <a
              href="#"
              className="text-blue-600 underline text-sm"
              onClick={(e) => e.preventDefault()}
            >
              Xem thêm về chính sách huỷ của Airbnb
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
