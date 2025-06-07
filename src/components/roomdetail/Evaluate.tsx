import React from "react";
import { Star } from "lucide-react";

interface ReviewProps {
  reviewer: string;
  avatarUrl: string;
  timeAgo: string;
  rating: number;
  text: string;
}

const ReviewCard: React.FC<ReviewProps> = ({ reviewer, avatarUrl, timeAgo, rating, text }) => {
  return (
    <div className="flex gap-4 pb-4 mb-4">
      {/* Avatar */}
      <img
        src={avatarUrl}
        alt={reviewer}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
      />

      {/* Review content */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {/* Reviewer name */}
          <span className="font-semibold">{reviewer}</span>
          {/* Rating */}
          <div className="flex items-center text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-current" : "text-gray-300"}`} />
            ))}
          </div>
        </div>

        <span className="text-xs text-gray-500">{timeAgo}</span>

        <p className="text-sm mt-2 text-gray-700">{text}</p>

        {/* Show more button */}
        <button className="text-sm text-blue-600 hover:underline mt-2">Hiển thị thêm</button>
      </div>
    </div>
  );
};

const ReviewsSection = () => {
  const reviews = [
    {
      reviewer: "Tung",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      timeAgo: "6 tháng trước",
      rating: 5,
      text: "Chỗ ở xinh xắn, sạch sẽ, đầy đủ dịch vụ. Vị trí thuận lợi dễ đi chơi xung quanh Sài Gòn. Nếu có dịp sẽ quay trở lại.",
    },
    {
      reviewer: "Mi",
      avatarUrl: "https://randomuser.me/api/portraits/women/50.jpg",
      timeAgo: "5 năm trước",
      rating: 5,
      text: "Phòng ốc sạch sẽ, tiện nghi, vị trí gần trung tâm, dễ dàng di chuyển thuận tiện. Chủ nhà dễ thương.",
    },
     {
      reviewer: "Tung",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      timeAgo: "6 tháng trước",
      rating: 5,
      text: "Chỗ ở xinh xắn, sạch sẽ, đầy đủ dịch vụ. Vị trí thuận lợi dễ đi chơi xung quanh Sài Gòn. Nếu có dịp sẽ quay trở lại.",
    },
    {
      reviewer: "Mi",
      avatarUrl: "https://randomuser.me/api/portraits/women/50.jpg",
      timeAgo: "5 năm trước",
      rating: 5,
      text: "Phòng ốc sạch sẽ, tiện nghi, vị trí gần trung tâm, dễ dàng di chuyển thuận tiện. Chủ nhà dễ thương.",
    },
     {
      reviewer: "Tung",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      timeAgo: "6 tháng trước",
      rating: 5,
      text: "Chỗ ở xinh xắn, sạch sẽ, đầy đủ dịch vụ. Vị trí thuận lợi dễ đi chơi xung quanh Sài Gòn. Nếu có dịp sẽ quay trở lại.",
    },
    {
      reviewer: "Mi",
      avatarUrl: "https://randomuser.me/api/portraits/women/50.jpg",
      timeAgo: "5 năm trước",
      rating: 5,
      text: "Phòng ốc sạch sẽ, tiện nghi, vị trí gần trung tâm, dễ dàng di chuyển thuận tiện. Chủ nhà dễ thương.",
    }
    // Thêm các đánh giá khác ở đây...
  ];

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">11 lượt đánh giá</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {reviews.map((review, index) => (
          <ReviewCard key={index} {...review} />
        ))}
      </div>
      {/* Button để thêm đánh giá */}
      <div className="mt-2 ">
        <button className="px-6 py-2 text-black bg-gray-200 hover:bg-gray-300 rounded-md tex-xl shadow-sm">
          Thêm đánh giá
        </button>
      </div>
    </div>
  );
};

export default ReviewsSection;
