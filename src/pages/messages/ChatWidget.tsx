"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { cn } from "@/lib/utils";
import { useChatbot } from "@/hooks/useChatbot";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { hasUnreadMessages, isConnected, markAsRead } = useChatbot();

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      markAsRead();
    }
  };

  return (
    <>
      {/* Nút Chat nổi */}
      <Button
        variant="default"
        size="icon"
        className={cn(
          "fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 z-50 transition-all duration-300",
          isOpen && "scale-110"
        )}
        aria-label="Mở cửa sổ trò chuyện"
        onClick={handleToggleChat}
      >
        {isOpen ? (
          <X className="h-7 w-7" />
        ) : (
          <MessageSquare className="h-7 w-7" />
        )}

        {/* Notification badge */}
        {hasUnreadMessages && !isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs text-white font-bold">1</span>
          </div>
        )}

        {/* Connection status indicator */}
        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white">
          <div
            className={cn(
              "w-full h-full rounded-full transition-colors duration-300",
              isConnected ? "bg-green-500" : "bg-red-500"
            )}
          />
        </div>
      </Button>

      {/* Cửa sổ Chat */}
      <div
        className={cn(
          "fixed bottom-20 right-4 w-full max-w-[455px] h-[580px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-40",
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        )}
      >
        <ChatWindow onClose={() => setIsOpen(false)} />
      </div>
    </>
  );
}
