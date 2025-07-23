import { Heart } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/useRedux";
import { toggleWishlistRoom } from "@/store/slices/wishlistSlice";

interface ButtonWishlistProps {
  liked?: boolean;
  onToggle?: (liked: boolean) => void;
  className?: string;
  roomId: string;
}

const ButtonWishlist: React.FC<ButtonWishlistProps> = ({
  liked,
  onToggle,
  className,
  roomId,
}) => {
  const [internalLiked, setInternalLiked] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  // Ưu tiên optimisticLiked, sau đó đến prop liked, cuối cùng là internalLiked
  const isLiked =
    optimisticLiked !== undefined
      ? optimisticLiked
      : liked !== undefined
      ? liked
      : internalLiked;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await dispatch(toggleWishlistRoom(roomId)).unwrap();
      const newLiked = !isLiked;
      setOptimisticLiked(newLiked); // đổi màu ngay lập tức
      if (onToggle) {
        onToggle(newLiked);
      } else {
        setInternalLiked(newLiked);
      }
      toast(
        newLiked
          ? "Đã thêm vào danh sách yêu thích!"
          : "Đã bỏ khỏi danh sách yêu thích!",
        {
          style: {
            background: "#ccccc",
            color: "#00000",
          },
          className: "text-base py-5 px-7 min-w-[320px]",
          descriptionClassName: "text-black text-sm",
        }
      );
    } catch (err: unknown) {
      toast((err as string) || "Có lỗi khi cập nhật trạng thái yêu thích!", {
        style: {
          background: "#ccccc",
          color: "#ba0000",
        },
        className: "text-base py-5 px-7 min-w-[320px]",
        descriptionClassName: "text-black text-sm",
      });
    } finally {
      setLoading(false);
    }
  };

  // Khi prop liked thay đổi (do listings BE trả về mới), reset optimisticLiked
  useEffect(() => {
    setOptimisticLiked(undefined);
  }, [liked]);

  return (
    <button
      onClick={handleClick}
      className={
        `rounded-full p-2 hover:bg-muted transition absolute top-1 right-1 ` +
        (className || "")
      }
      aria-label="Yêu thích"
      type="button"
      disabled={loading}
    >
      <Heart
        className={`w-6 h-6 text-white fill-gray-500 transition-colors duration-200 cursor-pointer hover:scale-105 ${
          isLiked ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
        }`}
      />
    </button>
  );
};

export default ButtonWishlist;
