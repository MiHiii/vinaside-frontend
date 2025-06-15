// src/pages/BecomeAHost/Amenities.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  Wifi, 
  Tv, 
  Printer, 
  Snowflake, 
  Thermometer, 
  Car, 
  Bath, 
  Utensils, 
  Waves, 
  Dumbbell, 
  Music, 
  Shirt, 
  Flame, 
  ShieldCheck, 
  Siren
} from "lucide-react";

// Define amenity type
interface Amenity {
  id: string;
  name: string;
  icon: React.ReactNode;
  selected: boolean;
}

// Group of amenities
interface AmenityGroup {
  title: string;
  amenities: Amenity[];
}

export default function Amenities() {
  const navigate = useNavigate();

  // Create amenity groups with their respective items
  const [amenityGroups, setAmenityGroups] = useState<AmenityGroup[]>([
    {
      title: "Bạn có tiện nghi nào nổi bật không?",
      amenities: [
        { id: "wifi", name: "Wi-Fi", icon: <Wifi className="h-6 w-6" />, selected: false },
        { id: "tv", name: "TV", icon: <Tv className="h-6 w-6" />, selected: false },
        { id: "kitchen", name: "Bếp", icon: <Utensils className="h-6 w-6" />, selected: false },
        { id: "washer", name: "Máy giặt", icon: <Shirt className="h-6 w-6" />, selected: false },
        { id: "ac", name: "Điều hòa nhiệt độ", icon: <Snowflake className="h-6 w-6" />, selected: false },
        { id: "heating", name: "Hệ thống sưởi", icon: <Thermometer className="h-6 w-6" />, selected: false },
        { id: "workspace", name: "Không gian làm việc riêng", icon: <Printer className="h-6 w-6" />, selected: false },
        { id: "parking", name: "Chỗ đỗ xe miễn phí trong khuôn viên", icon: <Car className="h-6 w-6" />, selected: false },
        { id: "pool", name: "Hồ bơi", icon: <Waves className="h-6 w-6" />, selected: false },
      ]
    },
    {
      title: "Bạn có tiện nghi nào nổi bật không?",
      amenities: [
        { id: "hottub", name: "Bồn tắm nước nóng", icon: <Bath className="h-6 w-6" />, selected: false },
        { id: "bbq", name: "Khu vực BBQ", icon: <Flame className="h-6 w-6" />, selected: false },
        { id: "dining", name: "Không gian ăn uống ngoài trời", icon: <Utensils className="h-6 w-6" />, selected: false },
        { id: "firepit", name: "Lò sưởi ngoài trời", icon: <Flame className="h-6 w-6" />, selected: false },
        { id: "gym", name: "Thiết bị tập thể dục", icon: <Dumbbell className="h-6 w-6" />, selected: false },
        { id: "entertainment", name: "Loa Bluetooth", icon: <Music className="h-6 w-6" />, selected: false },
      ]
    },
    {
      title: "Bạn có tiện nghi nào trong những tiện nghi dưới đây không?",
      amenities: [
        { id: "security-cam", name: "Camera an ninh", icon: <ShieldCheck className="h-6 w-6" />, selected: false },
        { id: "smoke-alarm", name: "Máy báo khói", icon: <Siren className="h-6 w-6" />, selected: false },
        { id: "first-aid", name: "Bộ sơ cứu", icon: <ShieldCheck className="h-6 w-6" />, selected: false },
        { id: "fire-extinguisher", name: "Bình chữa cháy", icon: <Flame className="h-6 w-6" />, selected: false },
        { id: "carbon-monoxide-alarm", name: "Máy phát hiện CO", icon: <ShieldCheck className="h-6 w-6" />, selected: false },
      ]
    }
  ]);

  // Toggle amenity selection
  const toggleAmenity = (groupIndex: number, amenityId: string) => {
    const updatedGroups = [...amenityGroups];
    const amenityIndex = updatedGroups[groupIndex].amenities.findIndex(
      (amenity) => amenity.id === amenityId
    );
    
    if (amenityIndex !== -1) {
      updatedGroups[groupIndex].amenities[amenityIndex].selected = 
        !updatedGroups[groupIndex].amenities[amenityIndex].selected;
      setAmenityGroups(updatedGroups);
    }
  };

  const handleNext = () => {
    // Get all selected amenities
    const selectedAmenities = amenityGroups
      .flatMap(group => group.amenities)
      .filter(amenity => amenity.selected)
      .map(amenity => amenity.id);
    
    console.log("Selected amenities:", selectedAmenities);
    
    // Navigate to the next page
    navigate("/photos");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center p-8 bg-white">
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl font-semibold mb-2 text-gray-800">
            Cho khách biết chỗ ở của bạn có những gì
          </h1>
          <p className="text-gray-500 mb-8">
            Bạn có thể thêm tiện nghi sau khi đăng chỗ ở của bạn
          </p>

          {/* Amenity Groups */}
          {amenityGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-10">
              <h2 className="text-xl font-medium mb-4">{group.title}</h2>
              <div className="grid grid-cols-3 gap-4">
                {group.amenities.map((amenity) => (
                  <Card
                    key={amenity.id}
                    className={`p-4 cursor-pointer hover:border-gray-400 transition-all ${
                      amenity.selected
                        ? "border-2 border-black"
                        : "border border-gray-200"
                    }`}
                    onClick={() => toggleAmenity(groupIndex, amenity.id)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="text-gray-600 mb-2">
                        {amenity.icon}
                      </div>
                      <span className="text-sm">{amenity.name}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-center w-full">
            {/* Nút quay lại bên trái */}
            <Link to="/become-a-host/stand-out">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>

            {/* Nút tiếp theo bên phải */}
            <Link to="/become-a-host/photos">
              <Button
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleNext}
              >
                Tiếp theo
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
