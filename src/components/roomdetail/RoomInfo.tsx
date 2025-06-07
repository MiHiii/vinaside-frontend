// components/RoomInfo.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Users,
  Home,
  Bed,
  Bath,
  Sparkles,
  CheckCircle,
  Key,
  MessageSquare,
  MapPin,
  Tag,
  Calendar,
  Shield,
  Award
} from "lucide-react";

// Import ReviewModal
import { ReviewModal } from "./ReviewModal";
import ModalContent from "./ModalContent";
import AmenitiesModal,{defaultGroups} from "./AmenitiesModal";
import DateRangePicker from "./DateRangePicker ";
interface RoomInfoProps {
  roomData?: {
    title: string;
    location: string;
    rating: number;
    reviewCount: number;
    price: number;
    host: {
      name: string;
      avatar: string;
      isSuperhost: boolean;
      yearsHosting: number;
      responseRate: number;
      responseTime: string;
    };
    specs: {
      guests: number;
      bedrooms: number;
      beds: number;
      bathrooms: number;
    };
    amenities: Array<{
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
      name: string;
    }>;
    description: string;
    highlights: Array<{
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
      title: string;
      description: string;
    }>;
  };
}

  const RoomInfo: React.FC<RoomInfoProps> = ({ roomData }) => {
  // State để điều khiển hiển thị ReviewModal
  const [showReviews, setShowReviews] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
   const [showAmenities, setShowAmenities] = useState(false);
  // Dữ liệu mặc định nếu không có props roomData
  const defaultData = {
    title: "Phòng tại Quận 1, Việt Nam",
    location: "Quận 1, Thành phố Hồ Chí Minh, Việt Nam",
    rating: 4.95,
    reviewCount: 11,
    price: 1200000,
    host: {
      name: "Minh Quang",
      avatar: "M",
      isSuperhost: true,
      yearsHosting: 3,
      responseRate: 100,
      responseTime: "trong vòng 1 giờ",
    },
    specs: {
      guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
    },
    amenities: [
      { icon: Sparkles, name: "Mức độ sạch sẽ" },
      { icon: CheckCircle, name: "Độ chính xác" },
      { icon: Key, name: "Nhận phòng" },
      { icon: MessageSquare, name: "Giao tiếp" },
      { icon: MapPin, name: "Vị trí" },
      { icon: Tag, name: "Giá trị" },
    ],
    description:
      "Căn hộ hiện đại với đầy đủ tiện nghi, nằm ở vị trí thuận lợi gần trung tâm thành phố. Phù hợp cho cặp đôi hoặc khách du lịch một mình. Có ban công với view đẹp và đầy đủ các thiết bị cần thiết cho một kỳ nghỉ thoải mái. Gần các điểm tham quan nổi tiếng và có nhiều nhà hàng, quán cà phê xung quanh.",
    highlights: [
      {
        icon: Home,
        title: "Toàn bộ nhà/căn hộ",
        description: "Bạn sẽ có toàn bộ căn hộ cho riêng mình",
      },
      {
        icon: Shield,
        title: "Tự nhận phòng",
        description: "Tự nhận phòng bằng hộp khóa thông minh",
      },
      {
        icon: Award,
        title: "Siêu chủ nhà",
        description: "Siêu chủ nhà là những chủ nhà có kinh nghiệm, được đánh giá cao",
      },
    ],
  };

  // Dùng dữ liệu props nếu có, ngược lại dùng defaultData
  const data = roomData || defaultData;

  // Danh sách categoryRatings (dùng cho cột trái của ReviewModal)
  const categoryRatings = [
    { icon: Sparkles, label: "Mức độ sạch sẽ", score: 4.9 },
    { icon: CheckCircle, label: "Độ chính xác", score: 4.9 },
    { icon: Key, label: "Nhận phòng", score: 5.0 },
    { icon: MessageSquare, label: "Giao tiếp", score: 5.0 },
    { icon: MapPin, label: "Vị trí", score: 4.9 },
    { icon: Tag, label: "Giá trị", score: 5.0 },
  ];

  // Dữ liệu review mẫu (dùng cho cột phải của ReviewModal)
  const reviewsData = [
    {
      reviewer: "Anne",
      avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
      timeAgo: "1 tuần trước",
      rating: 5.0,
      text: `Hoàn toàn giới thiệu Squirrel Village nếu bạn có kế hoạch đi nhanh
      nhưng giá cả phải chăng tại thành phố xinh đẹp của Việt Nam.
      Nhu cầu thiết yếu do chủ nhà cung cấp và họ thực sự phản hồi nhanh và cũng rất hữu ích.
      Tôi đánh giá cao Dan và đảm bảo chúng tôi cảm thấy thoải mái trong thời gian lưu trú.`,
      translatedFromEnglish: true,
    },
    {
      reviewer: "Justney",
      avatarUrl: "", //Nếu để trống, sẽ hiển chữ cái đầu
      timeAgo: "2 tuần trước",
      rating: 5.0,
      text: `Dan và nhóm của anh ấy phản hồi rất nhanh và rất sẵn lòng hỗ trợ!
      Tôi không có bất kỳ trục trặc hoặc lo lắng nào trong suốt thời gian ở.
      Rất hữu ích với bất kỳ mức độ kỳ vọng nào. Chắc chắn sẽ đề xuất!!`,
      translatedFromEnglish: false,
    },
        {
      reviewer: "Justney",
      avatarUrl: "", //Nếu để trống, sẽ hiển chữ cái đầu
      timeAgo: "2 tuần trước",
      rating: 5.0,
      text: `Dan và nhóm của anh ấy phản hồi rất nhanh và rất sẵn lòng hỗ trợ!
      Tôi không có bất kỳ trục trặc hoặc lo lắng nào trong suốt thời gian ở.
      Rất hữu ích với bất kỳ mức độ kỳ vọng nào. Chắc chắn sẽ đề xuất!!`,
      translatedFromEnglish: false,
    },
    // Bạn có thể thêm nhiều review mẫu nữa để test scroll...
  ];

  return (
    <>
      <div className="space-y-6 lg:space-y-8">
        {/* ===== Section Header + Specs ===== */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 -mt-7">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                {data.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                {/* Specs: khách, phòng, giường, tắm */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">{data.specs.guests}</p>
                      <p className="text-sm text-gray-600">khách</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">{data.specs.bedrooms}</p>
                      <p className="text-sm text-gray-600">phòng ngủ</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bed className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">{data.specs.beds}</p>
                      <p className="text-sm text-gray-600">giường</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bath className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">{data.specs.bathrooms}</p>
                      <p className="text-sm text-gray-600">phòng tắm</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Rating & Badge ===== */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current text-yellow-400" />
              <span className="font-medium">{data.rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-600">•</span>
            {/* Nút hiển thị modal đánh giá */}
            <button
              onClick={() => setShowReviews(true)}
              className="text-gray-600 hover:text-gray-900 underline font-medium"
            >
              {data.reviewCount} đánh giá
            </button>
            <span className="text-gray-600">•</span>
            <Badge
              variant="secondary"
              className="bg-pink-100 text-pink-800 hover:bg-pink-200"
            >
              Được khách yêu thích
            </Badge>
          </div>
        </div>

        {/* ===== Host Info Card ===== */}
        <Card className="border border-gray-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-xl font-semibold text-white">
                  {data.host.avatar}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg sm:text-xl font-semibold truncate">
                    Host: {data.host.name}
                  </h3>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{data.host.yearsHosting} năm kinh nghiệm đón tiếp khách</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span>Tỷ lệ phản hồi: {data.host.responseRate}%</span>
                    <span className="hidden sm:inline text-gray-400">•</span>
                    <span>Phản hồi {data.host.responseTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== Highlights ===== */}
        <div className="space-y-4">
          {data.highlights.map((highlight, index) => (
            <div key={index} className="flex items-start gap-4">
              <highlight.icon className="h-6 w-6 text-gray-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 mb-1">{highlight.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ===== Description ===== */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold">
            Giới thiệu về chỗ ở này
          </h3>
          <div className="text-gray-700 leading-relaxed">
            <p>{data.description}</p>
          </div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black rounded-md shadow-sm transition duration-200"
      >
        Xem thêm
      </button>

           {isOpen && <ModalContent onClose={() => setIsOpen(false)} />}
        </div>

        {/* ===== Amenities ===== */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold">Tiện nghi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-3">
                <amenity.icon className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">{amenity.name}</span>
              </div>
            ))}
          </div>
          <Button
           variant="outline" 
           className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black rounded-md border-none shadow-sm transition duration-200"
          onClick={() => setShowAmenities(true)}>
            Hiển thị tất cả {data.amenities.length + 5} tiện nghi
          </Button>
        </div>

        {/* ===== Calendar Section ===== */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Chọn ngày nhận phòng
          </h3>
          <p className="text-gray-600">Thêm ngày đi để xem giá chính xác</p>
          <DateRangePicker />
        </div>
      </div>
      <ReviewModal
        open={showReviews}
        onClose={() => setShowReviews(false)}
        overallRating={data.rating}
        totalReviews={data.reviewCount}
        categoryRatings={categoryRatings}
        reviews={reviewsData}
      />
         <AmenitiesModal
      open={showAmenities}
      onClose={() => setShowAmenities(false)}
      groups={defaultGroups}
     />
    </>
  );
};

export default RoomInfo;
