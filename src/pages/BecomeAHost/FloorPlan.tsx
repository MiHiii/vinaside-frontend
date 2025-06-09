// src/app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, DoorOpen, Home as HomeIcon} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Import Collapsible components từ Shadcn UI
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import QuantityCounter from "@/components/BecomeAHost/QuantityCounter"; // Đảm bảo đường dẫn đúng
import { Header } from "@/components/BecomeAHost/Header";

// Define type cho lựa chọn loại chỗ ở
type PropertyType = 'entire-home' | 'private-room' | 'shared-room' | null;

export default function FloorPlan() {
  const navigate = useNavigate();

  // State cục bộ để quản lý lựa chọn UI và trạng thái mở/đóng của collapsible
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType>(null);
  const [isEntireHomeCollapsibleOpen, setIsEntireHomeCollapsibleOpen] = useState(false);
  const [isPrivateRoomCollapsibleOpen, setIsPrivateRoomCollapsibleOpen] = useState(false);

  // States cục bộ cho dữ liệu các trường nhập liệu (không kết nối Redux sâu ở đây)
  const [entireHomeGuests, setEntireHomeGuests] = useState(1);
  const [entireHomeBedrooms, setEntireHomeBedrooms] = useState(1);
  const [entireHomeBeds, setEntireHomeBeds] = useState(1);
  const [entireHomeBathrooms, setEntireHomeBathrooms] = useState(1);

  const [privateRoomGuests, setPrivateRoomGuests] = useState(1);
  const [privateRoomBedrooms, setPrivateRoomBedrooms] = useState(1);
  const [privateRoomBeds, setPrivateRoomBeds] = useState(1);
  const [privateRoomHasLock, setPrivateRoomHasLock] = useState<boolean | null>(null);

  // useEffect để đồng bộ trạng thái mở/đóng của collapsible với lựa chọn loại chỗ ở
  useEffect(() => {
    if (selectedPropertyType === 'entire-home') {
      setIsEntireHomeCollapsibleOpen(true);
      setIsPrivateRoomCollapsibleOpen(false);
    } else if (selectedPropertyType === 'private-room') {
      setIsPrivateRoomCollapsibleOpen(true);
      setIsEntireHomeCollapsibleOpen(false);
    } else {
      // Khi không có lựa chọn nào hoặc chọn loại khác, đóng cả hai collapsible
      setIsEntireHomeCollapsibleOpen(false);
      setIsPrivateRoomCollapsibleOpen(false);
    }
  }, [selectedPropertyType]);

  // Handler khi người dùng chọn một loại chỗ ở
  const handleSelectPropertyType = (type: PropertyType) => {
    if (selectedPropertyType === type) {
      // Nếu click lại vào lựa chọn đã chọn, bỏ chọn và đóng collapsible
      setSelectedPropertyType(null);
    } else {
      // Chọn loại mới
      setSelectedPropertyType(type);
    }
  };

  const handleNext = () => {
    // Basic validation for UI interaction
    if (!selectedPropertyType) {
      alert("Vui lòng chọn loại chỗ ở trước khi tiếp tục.");
      return;
    }

    if (selectedPropertyType === 'entire-home' && entireHomeGuests < 1) {
        alert("Số khách cho Toàn bộ nhà phải ít nhất là 1.");
        return;
    }

    if (selectedPropertyType === 'private-room' && privateRoomGuests < 1) {
        alert("Số khách cho Một căn phòng phải ít nhất là 1.");
        return;
    }

    if (selectedPropertyType === 'private-room' && privateRoomHasLock === null) {
        alert("Vui lòng chọn xem phòng có khóa không.");
        return;
    }


    // Simulate navigation for UI demonstration
    console.log("Dữ liệu đã chọn:", {
      selectedPropertyType,
      entireHomeDetails: { guests: entireHomeGuests, bedrooms: entireHomeBedrooms, beds: entireHomeBeds, bathrooms: entireHomeBathrooms },
      privateRoomDetails: { guests: privateRoomGuests, bedrooms: privateRoomBedrooms, beds: privateRoomBeds, hasRoomLock: privateRoomHasLock }
    });
    navigate(`/stand-out`); // Navigate to the next dummy page
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 bg-white">
        <h1 className="text-3xl font-semibold mb-10 text-gray-800 text-center">
          Khách sẽ được sử dụng loại chỗ ở nào?
        </h1>

        <div className="w-full max-w-xl space-y-4">
          {/* Option 1: Toàn bộ nhà */}
          <Collapsible
            open={isEntireHomeCollapsibleOpen}
            onOpenChange={() => handleSelectPropertyType(isEntireHomeCollapsibleOpen ? null : 'entire-home')}
            className={`border rounded-lg ${
              selectedPropertyType === "entire-home"
                ? "border-black ring-2 ring-black"
                : "border-gray-300 hover:border-black"
            } transition-all duration-200`}
          >
            <CollapsibleTrigger asChild>
              <div className="p-6 flex justify-between items-center cursor-pointer w-full">
                <div>
                  <h2 className="text-lg font-medium mb-1">Toàn bộ nhà</h2>
                  <p className="text-gray-500 text-sm">
                    Khách được sử dụng riêng toàn bộ chỗ ở này.
                  </p>
                </div>
                <div className="text-gray-500 text-3xl">
                  <HomeIcon className="h-6 w-6" />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-top-full p-4 border-t border-gray-200">
              {/* Nội dung chi tiết cho "Toàn bộ nhà" - Hình 1 */}
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Chia sẻ một số thông tin cơ bản về chỗ ở của bạn
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Sau này, bạn sẽ bổ sung những thông tin khác, như loại giường chẳng hạn.
              </p>
              <QuantityCounter
                label="Khách"
                value={entireHomeGuests}
                onIncrement={() => setEntireHomeGuests(entireHomeGuests + 1)}
                onDecrement={() => setEntireHomeGuests(Math.max(1, entireHomeGuests - 1))}
                description="Bao gồm cả trẻ em và em bé."
                minValue={1}
              />
              <QuantityCounter
                label="Phòng ngủ"
                value={entireHomeBedrooms}
                onIncrement={() => setEntireHomeBedrooms(entireHomeBedrooms + 1)}
                onDecrement={() => setEntireHomeBedrooms(Math.max(0, entireHomeBedrooms - 1))}
                minValue={0}
              />
              <QuantityCounter
                label="Giường"
                value={entireHomeBeds}
                onIncrement={() => setEntireHomeBeds(entireHomeBeds + 1)}
                onDecrement={() => setEntireHomeBeds(Math.max(0, entireHomeBeds - 1))}
                minValue={0}
              />
              <QuantityCounter
                label="Phòng tắm"
                value={entireHomeBathrooms}
                onIncrement={() => setEntireHomeBathrooms(entireHomeBathrooms + 1)}
                onDecrement={() => setEntireHomeBathrooms(Math.max(0, entireHomeBathrooms - 1))}
                minValue={0}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Option 2: Một căn phòng */}
          <Collapsible
            open={isPrivateRoomCollapsibleOpen}
            onOpenChange={() => handleSelectPropertyType(isPrivateRoomCollapsibleOpen ? null : 'private-room')}
            className={`border rounded-lg ${
              selectedPropertyType === "private-room"
                ? "border-black ring-2 ring-black"
                : "border-gray-300 hover:border-black"
            } transition-all duration-200`}
          >
            <CollapsibleTrigger asChild>
              <div className="p-6 flex justify-between items-center cursor-pointer w-full">
                <div>
                  <h2 className="text-lg font-medium mb-1">Một căn phòng</h2>
                  <p className="text-gray-500 text-sm">
                    Khách sẽ có phòng riêng trong một ngôi nhà và được sử dụng
                    những khu vực chung.
                  </p>
                </div>
                <div className="text-gray-500 text-3xl">
                  <DoorOpen className="h-6 w-6" />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-top-full p-4 border-t border-gray-200">
              {/* Nội dung chi tiết cho "Một căn phòng" - Hình 2 */}
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Hãy bắt đầu từ những điều cơ bản
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Bao nhiêu người có thể ở tại đây?
              </p>
              <QuantityCounter
                label="Khách"
                value={privateRoomGuests}
                onIncrement={() => setPrivateRoomGuests(privateRoomGuests + 1)}
                onDecrement={() => setPrivateRoomGuests(Math.max(1, privateRoomGuests - 1))}
                description="Bao gồm cả trẻ em và em bé."
                minValue={1}
              />
              <QuantityCounter
                label="Phòng ngủ"
                value={privateRoomBedrooms}
                onIncrement={() => setPrivateRoomBedrooms(privateRoomBedrooms + 1)}
                onDecrement={() => setPrivateRoomBedrooms(Math.max(0, privateRoomBedrooms - 1))}
                minValue={0}
              />
              <QuantityCounter
                label="Giường"
                value={privateRoomBeds}
                onIncrement={() => setPrivateRoomBeds(privateRoomBeds + 1)}
                onDecrement={() => setPrivateRoomBeds(Math.max(0, privateRoomBeds - 1))}
                minValue={0}
              />
              {/* Câu hỏi "Có phải mỗi phòng ngủ đều có một khóa?" */}
              <div className="py-4 border-b border-gray-200 last:border-b-0">
                <h3 className="text-lg font-medium mb-4">Có phải mỗi phòng ngủ đều có một khóa?</h3>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="privateRoomLock" // Unique name for radio buttons
                      value="true"
                      checked={privateRoomHasLock === true}
                      onChange={() => setPrivateRoomHasLock(true)}
                      className="form-radio h-5 w-5 text-rose-500 border-gray-300 focus:ring-rose-500"
                    />
                    <span className="ml-3 text-base">Có</span>
                  </label>
                  <label className="block cursor-pointer">
                    <input
                      type="radio"          
                      name="privateRoomLock" // Unique name for radio buttons
                      value="false"
                      checked={privateRoomHasLock === false}
                      onChange={() => setPrivateRoomHasLock(false)}
                      className="form-radio h-5 w-5 text-rose-500 border-gray-300 focus:ring-rose-500"
                    />
                    <span className="ml-3 text-base">Không</span>
                    <p className="text-sm text-gray-500 mt-1 ml-8">
                      Khách muốn trong phòng phải có khóa. Chúng tôi đặc biệt khuyên bạn nên bổ sung khóa.
                      <Link to="#" className="text-blue-600 hover:underline ml-1">Tìm hiểu thêm</Link>
                    </p>
                  </label>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-center w-full">
            {/* Nút quay lại bên trái */}
            <Link to="/location">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>

            {/* Nút tiếp theo bên phải */}
              <Button
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleNext}
                disabled={!selectedPropertyType} // Disable nếu chưa chọn loại nào
              >
                Tiếp theo
              </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}