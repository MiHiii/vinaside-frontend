// ProfileTextareaDialog.tsx

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Textarea } from "../ui/textarea";

type ProfileTextareaDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export const ProfileTextareaDialog = ({
  isOpen,
  onClose,
  title,
}: ProfileTextareaDialogProps) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const maxLength = 450;

  const resetForm = () => {
    setInputValue("");
    setError("");
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setInputValue(value);

    if (value.length > maxLength) {
      setError(`Vượt quá ${maxLength} ký tự so với giới hạn`);
    } else {
      setError("");
    }
  };

  const handleSave = () => {
    if (inputValue.length > maxLength) {
      setError(`Vượt quá ${maxLength} ký tự so với giới hạn`);
      return;
    }

    console.log("Đã lưu thành công!");
    onClose();
    resetForm();  // reset khi lưu thành công luôn
  };

  // Hàm này gọi khi dialog "đóng" (khi isOpen chuyển false)
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      // dialog đóng thì reset form
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[680px] h-[400px] bg-white p-8 rounded-2xl border-none shadow-[0_10px_50px_rgba(0,0,0,0.25)]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>
            Hãy chia sẻ đôi chút về bản thân để các Chủ nhà/Người tổ chức hoặc
            khách sau này có thể biết thêm về bạn.
          </DialogDescription>
        </DialogHeader>

        <div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Textarea
              id="description"
              style={{ width: "610px", height: "100px" }}
              placeholder="Giới thiệu bản thân..."
              className={`col-span-4 border-2 focus:outline-none !ring-0 ${
                error ? "border-red-600" : "border-gray-300 focus:border-black"
              }`}
              value={inputValue}
              onChange={handleInputChange}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm mt-2 flex items-center gap-1">
              <span className="text-xl">⚠️</span> {error}
            </div>
          )}

          <div className="text-right text-sm text-gray-500 mt-1">
            Còn {Math.max(maxLength - inputValue.length, 0)} ký tự
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            className="px-10 py-6 text-white bg-black rounded-xl text-lg"
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

