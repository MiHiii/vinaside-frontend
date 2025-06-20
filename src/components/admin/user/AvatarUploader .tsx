// components/AvatarUploader.tsx
import React, { useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AvatarUploaderProps {
  previewUrl?: string | null;
  onChange: (file: File | null) => void;
  fallback?: string;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  previewUrl,
  onChange,
  fallback,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-4">
      <Avatar className="w-16 h-16">
        <AvatarImage src={previewUrl || undefined} alt="Avatar" />
        <AvatarFallback>{fallback || "?"}</AvatarFallback>
      </Avatar>
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          Chọn ảnh
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </div>
    </div>
  );
};

export default AvatarUploader;
