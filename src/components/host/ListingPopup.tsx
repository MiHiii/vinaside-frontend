import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ListingPopupProps {
  open: boolean;
  onClose: () => void;
  image: string;
  title: string;
  location: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ListingPopup({
  open,
  onClose,
  image,
  title,
  location,
  onEdit,
  onDelete,
}: ListingPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          w-full 
          max-w-[calc(100%-2rem)] 
          sm:max-w-md 
          rounded-3xl 
          shadow-2xl 
          bg-white 
          p-0
          border-none
          outline-none
            ring-0
        "
      >
        <div className="relative flex flex-col items-center px-6 py-8">
          {/* Nút đóng */}
          <DialogClose
            asChild
            className="absolute top-4 left-4 text-gray-500 hover:bg-gray-100 rounded-full p-1"
          >
          </DialogClose>
          {/* Ảnh */}
          <img
            src={image}
            alt={title}
            className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-xl mb-4 shadow"
          />
          {/* Tiêu đề và vị trí */}
          <div className="text-center mb-6">
            <div className="font-semibold text-lg">{title}</div>
            <div className="text-gray-500 text-sm">{location}</div>
          </div>
          {/* Nút chỉnh sửa */}
          <Button
            className="w-full h-12 rounded-xl text-base font-semibold mb-4 bg-black text-white hover:bg-black/80"
            onClick={onEdit}
          >
            Chỉnh sửa mục cho thuê
          </Button>
          {/* Nút xoá */}
          <button
            className="w-full flex items-center justify-center gap-2 text- font-semibold hover:text-rose-600 text-base py-2 rounded-xl transition"
            onClick={onDelete}
          >
            <Trash2 className="w-5 h-5" />
            Xóa mục cho thuê
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
