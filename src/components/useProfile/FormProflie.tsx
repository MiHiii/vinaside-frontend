import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type ProfileFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export const ProfileFormDialog = ({ isOpen, onClose, title }: ProfileFormDialogProps) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(""); 
  const maxLength = 40; 

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    if (value.length > maxLength) {
      setError(`Vượt quá ${maxLength} ký tự so với giới hạn`);
    } else {
      setError(""); // Xoá lỗi nếu trong giới hạn
    }
  };

  const handleSave = () => {
    if (inputValue.length > maxLength) {
      setError(`Vượt quá ${maxLength} ký tự so với giới hạn`);
      return;
    }

    console.log("Đã lưu thành công!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[680px] h-[400px] bg-white p-8 rounded-2xl border-none shadow-[0_10px_50px_rgba(0,0,0,0.25)]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="username"
              style={{ width: "610px", height: "60px" }}
              placeholder={title}
              className={`col-span-3 border-2 focus:outline-none !ring-0 ${error ? "border-red-600" : "border-gray-300 focus:border-black"}`}
              value={inputValue}
              onChange={handleInputChange}
            />
          </div>

          {/* Cảnh báo nếu có lỗi */}
          {error && (
            <div className="text-red-600 text-sm mt-2 flex items-center gap-1">
              <span className="text-xl">⚠️</span> {error}
            </div>
          )}

          {/* Hiển thị số ký tự còn lại */}
          <div className="text-right text-sm text-gray-500 mt-1">
            Còn {Math.max(maxLength - inputValue.length, 0)} ký tự
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave}
          className="px-10 py-6 text-white bg-black rounded-xl text-lg"
           >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
