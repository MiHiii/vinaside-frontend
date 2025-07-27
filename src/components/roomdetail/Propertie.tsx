"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchPropertyById,
  selectPropertyDetail,
} from "@/store/slices/propertySlice";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface PropertieProps {
  propertyId?: string;
}

export default function Propertie({ propertyId }: PropertieProps) {
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [message, setMessage] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const property = useAppSelector(selectPropertyDetail);
  const loading = useAppSelector(
    (state) => state.properties.propertyDetailLoading
  );

  useEffect(() => {
    if (propertyId) {
      dispatch(fetchPropertyById(propertyId));
    }
  }, [propertyId, dispatch]);

  const handleHostClick = () => {
    if (propertyId) {
      navigate(`/property/${propertyId}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mt-5">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6 shadow-sm border-0 bg-white rounded-xl">
              <CardContent className="p-0">
                <div className="flex items-start gap-6">
                  <Skeleton className="w-28 h-28 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-40 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-3xl mt-5">
        <h1 className="text-2xl font-semibold mb-8 text-gray-900">
          Gặp gỡ host của bạn
        </h1>
        <div className="text-center text-gray-500 py-8">
          Không tìm thấy thông tin chủ nhà
        </div>
      </div>
    );
  }

  const hostName = property.name || "Chủ nhà";
  const hostAvatar = property.images?.[0];
  const hostInitial = hostName.charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl mt-5">
      <h1 className="text-2xl font-semibold mb-8 text-gray-900">
        Gặp gỡ host của bạn
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Host Info */}
        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="p-6 shadow-sm border-0 bg-white rounded-xl">
            <CardContent className="p-0">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar
                    className="w-28 h-28 border-4 border-white shadow-lg cursor-pointer hover:scale-102 transition-transform duration-200"
                    onClick={handleHostClick}
                  >
                    <AvatarImage src={hostAvatar} alt={hostName} />
                    <AvatarFallback className="bg-gradient-to-br from-green-600 to-green-800 text-white text-3xl font-bold">
                      {hostInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-pink-500 rounded-full p-2 shadow-lg">
                    <Heart className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div>
                    <h2
                      className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-gray-600 transition-colors"
                      onClick={handleHostClick}
                    >
                      {hostName}
                    </h2>
                    <div className="flex items-center gap-1 text-gray-600 mt-1">
                      <span className="text-sm">🏆</span>
                      <span className="text-sm">Chủ nhà siêu cấp</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Super Host Info */}
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Thông tin Chủ nhà
            </h4>
            <div className="space-y-2 text-gray-700">
              <div>Tỉ lệ phản hồi: 100%</div>
              <div>Phản hồi trong vòng 1 giờ</div>
              {property.description && (
                <div className="text-sm text-gray-600 mt-3">
                  {property.description}
                </div>
              )}
            </div>
          </div>

          <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors">
                Nhắn tin cho host
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Bạn vẫn còn thắc mắc? Nhắn tin cho host
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Textarea
                  placeholder="Tôi sẽ ghé thăm..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px] resize-none border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                />
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors">
                  Gửi tin nhắn
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
