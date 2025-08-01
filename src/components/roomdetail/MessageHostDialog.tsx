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
import { MessageCircle, Send, Users, Loader2, XCircle } from "lucide-react";

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

  // Reset selected staff when propertyId changes
  useEffect(() => {
    setSelectedStaffId("");
  }, [propertyId]);

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
          className={`group relative w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] overflow-hidden ${className}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center gap-3">
            <MessageCircle className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
            <span className="text-[14px]">Nhắn tin cho nhân viên</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-white border-0 shadow-2xl rounded-3xl p-0 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out">
        <div className="bg-gradient-to-br from-gray-50 to-white p-8">
          <DialogHeader className="space-y-3 animate-in slide-in-from-top-2 duration-700 delay-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-900 rounded-2xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Nhắn tin cho nhân viên
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Liên hệ với đội ngũ hỗ trợ tòa nhà
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-6 animate-in slide-in-from-bottom-2 duration-700 delay-200">
            {/* Staff Selection */}
            {loading ? (
              <div className="text-center py-8">
                <div className="relative">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
                  </div>
                  <div className="absolute inset-0 bg-gray-200 rounded-full animate-pulse opacity-30"></div>
                </div>
                <p className="text-sm text-gray-600 mt-4 font-medium">
                  Đang tải danh sách nhân viên...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-sm text-red-600 font-medium mb-2">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-xs"
                >
                  Thử lại
                </Button>
              </div>
            ) : staffList.length > 0 ? (
              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Chọn nhân viên:
                </label>
                <Select
                  value={selectedStaffId}
                  onValueChange={setSelectedStaffId}
                >
                  <SelectTrigger className="w-full border-2 border-gray-200 hover:border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 rounded-xl py-3 px-4 transition-all duration-200 bg-white shadow-sm hover:shadow-md">
                    <SelectValue placeholder="Chọn nhân viên" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200 rounded-xl shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
                    {staffList.map((staff) => (
                      <SelectItem
                        key={staff._id}
                        value={staff._id}
                        className="hover:bg-gray-50 focus:bg-gray-50 rounded-lg m-1 transition-colors duration-150"
                      >
                        <div className="flex items-center gap-3 py-2">
                          <div className="relative">
                            <Avatar className="w-8 h-8 border-2 border-gray-200">
                              <AvatarImage
                                src={staff.avatar_url || "/placeholder.svg"}
                                alt={staff.name}
                              />
                              <AvatarFallback className="text-sm font-semibold bg-gray-100 text-gray-700">
                                {staff.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                staff.is_online ? "bg-green-500" : "bg-gray-400"
                              }`}
                            ></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {staff.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {staff.role}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Không có nhân viên nào cho tòa nhà này
                </p>
              </div>
            )}

            {/* Message Input */}
            {staffList.length > 0 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Tin nhắn:
                  </label>
                  <div className="relative">
                    <Textarea
                      placeholder="Xin chào, tôi muốn hỏi về phòng này. Bạn có thể cho tôi biết thêm thông tin về..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[140px] resize-none border-2 border-gray-200 hover:border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 rounded-xl p-4 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-sm leading-relaxed"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {message.length}/500
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={sending || !selectedStaffId || !message.trim()}
                  className="group relative w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                        <span>Gửi tin nhắn</span>
                      </>
                    )}
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
