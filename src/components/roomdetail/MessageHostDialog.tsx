"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePropertyStaff } from "@/hooks/useMessages";

interface MessageHostDialogProps {
  hostName?: string;
  className?: string;
  propertyId?: string;
}

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar_url: string;
  is_online: boolean;
  last_seen: string;
}

export default function MessageHostDialog({
  hostName = "host",
  className = "",
  propertyId,
}: MessageHostDialogProps) {
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [sending, setSending] = useState(false);

  const { staffList, loading, error, sendMessageToStaff } =
    usePropertyStaff(propertyId);

  // Auto-select first staff member when staff list loads
  useEffect(() => {
    if (staffList.length > 0 && !selectedStaffId) {
      setSelectedStaffId(staffList[0]._id);
    }
  }, [staffList, selectedStaffId]);

  const handleSendMessage = async () => {
    if (!selectedStaffId || !message.trim()) {
      toast.error("Vui lòng chọn nhân viên và nhập tin nhắn");
      return;
    }

    setSending(true);
    try {
      await sendMessageToStaff(selectedStaffId, message.trim());
      setMessage("");
      setIsMessageOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
      <DialogTrigger asChild>
        <Button
          className={`w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors ${className}`}
        >
          Nhắn tin cho nhân viên
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Nhắn tin cho nhân viên tòa nhà
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {/* Staff Selection */}
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">
                Đang tải danh sách nhân viên...
              </p>
            </div>
          ) : staffList.length > 0 ? (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Chọn nhân viên:
              </label>
              <Select
                value={selectedStaffId}
                onValueChange={setSelectedStaffId}
              >
                <SelectTrigger className="w-full border-gray-300 focus:border-gray-500 focus:ring-gray-500">
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 focus:border-gray-500 focus:ring-gray-500">
                  {staffList.map((staff) => (
                    <SelectItem key={staff._id} value={staff._id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage
                            src={staff.avatar_url}
                            alt={staff.name}
                          />
                          <AvatarFallback className="text-xs">
                            {staff.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {staff.name}
                          </span>
                          {/* <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              {staff.role}
                            </span>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                staff.is_online ? "bg-green-500" : "bg-gray-400"
                              }`}
                            ></div>
                          </div> */}
                          {/* {!staff.is_online && (
                            <span className="text-xs text-gray-400">
                              Hoạt động{" "}
                              {new Date(staff.last_seen).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          )} */}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">
                Không có nhân viên nào cho tòa nhà này
              </p>
            </div>
          )}

          {/* Message Input */}
          {staffList.length > 0 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tin nhắn:
                </label>
                <Textarea
                  placeholder="Xin chào, tôi muốn hỏi về phòng này. Bạn có thể cho tôi biết thêm thông tin về..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px] resize-none border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={sending || !selectedStaffId || !message.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang gửi...
                  </div>
                ) : (
                  "Gửi tin nhắn"
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
