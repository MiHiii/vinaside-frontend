import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchWishlist,
  removeWishlist,
  WishlistItem,
} from "@/store/slices/wishlistSlice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { fetchListingById } from "@/store/slices/listingSlice";

const WishlistPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const wishlist =
    (useAppSelector((state) => state.wishlist.data) as WishlistItem[]) || [];
  const loading = useAppSelector((state) => state.wishlist.loading);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemoveWishlist = async (wishlistId: string) => {
    try {
      await dispatch(removeWishlist(wishlistId)).unwrap();
      toast("Đã xóa khỏi danh sách yêu thích", {
        style: { background: "#ccccc", color: "#ba0000" },
      });
      dispatch(fetchWishlist());
    } catch {
      toast("Xóa thất bại", {
        style: { background: "#ccccc", color: "#ba0000" },
      });
    }
  };

  const handleViewDetail = async (roomId: string) => {
    try {
      await dispatch(fetchListingById(roomId));
      navigate(`/list/${roomId}`);
    } catch {
      toast("Không thể lấy chi tiết phòng", {
        style: { background: "#ccccc", color: "#ba0000" },
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-bold mb-6">
        Danh sách phòng yêu thích của tôi
      </h2>
      {loading ? (
        <p>Đang tải...</p>
      ) : wishlist.length === 0 ? (
        <p>Bạn chưa có phòng nào trong danh sách yêu thích.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {wishlist.map((item) => (
            <Card
              key={item._id}
              className="rounded-2xl bg-card border-none shadow hover:shadow-lg transition cursor-pointer min-w-[280px] max-w-[280px]"
              onClick={() => handleViewDetail(item.room_id._id)}
            >
              <div className="relative">
                <img
                  src={
                    item.room_id.images?.[0] || "https://placehold.co/400x300"
                  }
                  alt={item.room_id.title}
                  className="h-[220px] w-full object-cover rounded-2xl"
                />
                <Badge className="absolute top-3 left-3 bg-muted text-white text-[10px] font-medium rounded-xl shadow px-3 py-1 backdrop-blur">
                  Yêu thích
                </Badge>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveWishlist(item._id);
                  }}
                  className="absolute top-3 right-3 rounded-full hover:bg-muted"
                  aria-label="Xóa khỏi yêu thích"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      stroke="#ba0000"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <CardContent className="p-3 pb-2">
                <div className="flex justify-between items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base truncate text-card-foreground">
                    {item.room_id.title}
                  </h3>
                  <div className="flex items-center gap-1 text-base font-medium text-card-foreground">
                    <span>★</span>
                    <span>
                      {item.room_id.average_rating?.toFixed(1) ?? "--"}
                    </span>
                  </div>
                </div>
                <div className="text-[15px] text-black font-semibold mb-0.5">
                  {item.room_id.price_per_night?.toLocaleString()}₫ / đêm
                </div>
                <div className="text-[15px] text-muted-foreground mb-0.5">
                  {item.room_id.guests ?? 2} khách
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
