import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, subDays } from "date-fns";

interface CancelPolicyDetailProps {
  policy?: string;
  checkInDate: string;
  open: boolean;
  onClose: () => void;
}

export default function CancelPolicyDetail({
  open,
  onClose,
  policy,
  checkInDate,
}: CancelPolicyDetailProps) {
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8">
        <DialogHeader>
          <DialogTitle>Chi tiết chính sách huỷ</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-base text-gray-800">
          {renderDetail()}
        </div>
        <div className="pt-4">
          <a
            href="#"
            className="text-blue-600 underline text-base"
            onClick={(e) => e.preventDefault()}
          >
            Xem thêm về chính sách huỷ của VinaSide
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
