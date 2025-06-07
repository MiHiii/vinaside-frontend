// components/ReviewModal.tsx
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Star, X, Search } from "lucide-react";

interface CategoryRating {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  score: number;
}

interface ReviewData {
  reviewer: string;
  avatarUrl?: string;
  timeAgo: string;
  rating: number;
  text: string;
  translatedFromEnglish?: boolean;
}

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  overallRating: number;
  totalReviews: number;
  categoryRatings: CategoryRating[];
  reviews: ReviewData[];
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  open,
  onClose,
  overallRating,
  totalReviews,
  categoryRatings,
  reviews,
}) => {
  // Ngăn scroll nền khi modal mở
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Lớp phủ đen nhẹ, không mờ nội dung, vẫn bắt sự kiện click để đóng */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <Card className="relative z-50 w-full max-w-4xl mx-4 lg:mx-0 bg-white rounded-2xl shadow-2xl shadow-[0_15px_30px_rgba(0,0,0,0.2)]  overflow-hidden border-none">
        <CardContent className="p-6 lg:p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cột trái */}
            <div className="flex-1 space-y-8">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-8 w-8 text-gray-400" />
                  <span className="text-5xl font-bold text-gray-900">
                    {overallRating.toFixed(1).replace(".", ",")}
                  </span>
                  <Award className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Được khách yêu thích
                </h3>
                <p className="text-sm text-gray-600">
                  Nhà này được khách yêu thích dựa trên điểm xếp hạng, lượt đánh giá và độ tin cậy
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-medium text-gray-900">
                  Xếp hạng tổng thể
                </h4>
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700">{star}</span>
                      <div
                        className={`h-1 flex-1 rounded-full ${
                          star === 5 ? "bg-gray-900" : "bg-gray-200"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <ul className="space-y-4">
                {categoryRatings.map((cat, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <cat.icon className="h-6 w-6 text-gray-600" />
                      <span className="text-sm text-gray-700">{cat.label}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {cat.score.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cột phải */}
            <div className="flex-1 flex flex-col gap-6 max-h-[600px]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {totalReviews} lượt đánh giá
                  </h3>
                  <button className="text-sm text-blue-600 hover:underline">
                    Tìm hiểu quy trình đánh giá
                  </button>
                </div>
                <div>
                  <select className="border border-gray-300 rounded-full px-4 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black">
                    <option>Phù hợp nhất</option>
                    <option>Mới nhất</option>
                    <option>Cũ nhất</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đánh giá"
                  className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-8">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center gap-3">
                      {rev.avatarUrl ? (
                        <img
                          src={rev.avatarUrl}
                          alt={rev.reviewer}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-medium">
                          {rev.reviewer.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{rev.reviewer}</span>
                        <span className="text-xs text-gray-500">{rev.timeAgo} trên Airbnb</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(rev.rating)
                              ? "fill-current text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-500">• {rev.timeAgo}</span>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {rev.text}
                    </p>

                    {rev.translatedFromEnglish && (
                      <button className="text-xs text-gray-500 hover:underline">
                        Hiển thị bản gốc
                      </button>
                    )}

                    {idx < reviews.length - 1 && <hr className="border-gray-200" />}
                  </div>
                ))}

                {reviews.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">
                    Chưa có đánh giá nào
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
