"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Shield,
  Clock,
  MessageCircle,
  Share,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchPropertyById,
  fetchPropertyRoomsList,
  selectPropertyDetail,
  selectPropertyRoomsList,
  selectPropertyRoomsListLoading,
} from "@/store/slices/propertySlice";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useNavigate } from "react-router-dom";
import ButtonWishlist from "@/components/common/ButtonWishlist";
import MessageHostDialog from "./MessageHostDialog";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function PropertyInfo() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const property = useAppSelector(selectPropertyDetail);
  const propertyRooms = useAppSelector(selectPropertyRoomsList) as any[];
  const loading = useAppSelector(
    (state) => state.properties.propertyDetailLoading
  );
  const roomsLoading = useAppSelector(selectPropertyRoomsListLoading);

  useEffect(() => {
    if (id) {
      dispatch(fetchPropertyById(id));
      dispatch(fetchPropertyRoomsList(id));
    }
  }, [id, dispatch]);

  // Set dynamic title based on property data
  useDocumentTitle(
    property
      ? `${property.name} tại ${
          property.location?.city || property.location?.address
        }`
      : loading
      ? "Đang tải..."
      : "Chi tiết nơi ở"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-80" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-80 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-gray-50 p-8 rounded-lg border">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className=" text-gray-400" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Không tìm thấy thông tin property
          </h1>
          <p className="text-gray-500">
            Property này không tồn tại hoặc đã bị xóa.
          </p>
        </div>
      </div>
    );
  }

  const hostName = property.name || "Chủ nhà";
  const hostAvatar = property.images?.[0];
  const hostInitial = hostName.charAt(0).toUpperCase();

  // Lấy thông tin địa chỉ
  const location = property.location || {};
  const address = [
    location.address,
    location.ward,
    location.district,
    location.city,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-black mb-3">{hostName}</h1>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Chủ nhà siêu cấp
                </Badge>
                <div className="flex items-center gap-1 text-gray-600">
                  <Star className="w-4 h-4 text-black fill-black" />
                  <span className="font-medium text-black">4.96</span>
                  <span className="text-sm">(51 đánh giá)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4 text-black" />
                  <span className="text-sm">Phản hồi trong 1 giờ</span>
                </div>
              </div>
              <div className="flex items-center gap-2 border-gray-200 mt-4">
                <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Địa chỉ:
                </h3>
                <h3 className="text-gray-700 leading-relaxed text-base">
                  {address || "Chưa có thông tin địa chỉ"}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Images */}
            <Card className="overflow-hidden border border-gray-200">
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {hostAvatar ? (
                    <img
                      src={hostAvatar || "/placeholder.svg"}
                      alt={hostName}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Globe className="w-16 h-16 mx-auto mb-2" />
                        <p className="text-lg">Không có ảnh</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property Description & Address */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-medium text-black mb-3">Mô tả</h3>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {property.description ||
                      "Chưa có mô tả chi tiết về property này. Đây là một property tuyệt vời với nhiều tiện ích và dịch vụ chất lượng cao."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Profile Card */}
            <Card className="border border-gray-200 overflow-hidden">
              <div className="h-20" />
              <CardContent className="p-6 -mt-10 relative">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-20 h-20 border-4 border-white shadow-lg mx-auto mb-4">
                      <AvatarImage
                        src={hostAvatar || "/placeholder.svg"}
                        alt={hostName}
                      />
                      <AvatarFallback className="bg-black text-white text-2xl font-bold">
                        {hostInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0 -right-0 bg-pink-500 rounded-full p-2 shadow-lg">
                      <Heart className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-black mb-2">
                    {hostName}
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-black text-black mb-4"
                  >
                    🏆 Chủ nhà siêu cấp
                  </Badge>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-black rounded-full" />
                      <span className="text-gray-600">Tỉ lệ phản hồi: </span>
                      <span className="font-semibold text-black">100%</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-black" />
                      <span className="text-gray-600">
                        Phản hồi trong vòng{" "}
                      </span>
                      <span className="font-semibold text-black">1 giờ</span>
                    </div>
                  </div>

                  <MessageHostDialog
                    hostName={hostName}
                    propertyId={property._id}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-black mb-4">
                  Thông tin liên hệ
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-black" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Số điện thoại
                      </div>
                      <div className="text-sm text-gray-600">
                        {property.contactPhone ? (
                          <a
                            href={`tel:${property.contactPhone}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {property.contactPhone}
                          </a>
                        ) : (
                          "Chưa có số điện thoại"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-black" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Email
                      </div>
                      <div className="text-sm text-gray-600">
                        {property.contactEmail ? (
                          <a
                            href={`mailto:${property.contactEmail}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {property.contactEmail}
                          </a>
                        ) : (
                          "Chưa có email"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Phòng của tôi */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-black mb-6">
            Các phòng tại {hostName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {roomsLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="min-w-[280px] max-w-[280px]">
                  <Skeleton className="h-[220px] w-full rounded-2xl mb-2" />
                  <div className="p-3 pb-2">
                    <Skeleton className="h-5 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/3 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            ) : propertyRooms && propertyRooms.length > 0 ? (
              propertyRooms.map((room: any) => (
                <PropertyCard
                  key={room._id}
                  property={room}
                  onViewDetail={(id: string) => navigate(`/list/${id}`)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                Chưa có phòng nào trong property này
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type PropertyCardProps = {
  property: any;
  onViewDetail: (id: string) => void;
};

function PropertyCard({ property, onViewDetail }: PropertyCardProps) {
  const imageUrl = property.images?.[0]?.startsWith("http")
    ? property.images[0]
    : `https://yourcdn.com${property.images?.[0]}`;

  return (
    <div
      onClick={() => onViewDetail(property._id)}
      className="min-w-[280px] max-w-[280px] rounded-2xl bg-white border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      <div className="relative">
        <img
          src={imageUrl || "https://placehold.co/400x300"}
          alt={property.title}
          className="h-[220px] w-full object-cover rounded-2xl"
        />
        <ButtonWishlist liked={property.is_wishlisted} roomId={property._id} />
      </div>
      <div className="p-3 pb-2">
        <div className="flex justify-between items-center gap-2 mb-1">
          <h3 className="font-semibold text-[17px] truncate text-black">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 text-sm font-medium text-black">
            <span>★</span>
            <span>{property.average_rating?.toFixed(1) ?? "--"}</span>
          </div>
        </div>
        <div className="text-sm text-gray-600 font-medium mb-1">
          {property.price_per_night?.toLocaleString()}₫ / đêm
        </div>
        <div className="text-sm text-gray-600">
          {property.guests ?? 2} khách
        </div>
      </div>
    </div>
  );
}
