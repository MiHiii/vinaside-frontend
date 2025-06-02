// ProfilePage.tsx
import { useState } from "react";
import {
  BookOpenIcon,
  MapPinIcon,
  GiftIcon,
  StarIcon,
  MusicIcon,
  BriefcaseIcon,
  SmileIcon,
  Brain,
  ClockIcon,
  HeartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileFormDialog } from "./FormProflie"; // Điều chỉnh path nếu cần
import { Card, CardContent } from "@/components/ui/card";
import { ProfileTextareaDialog } from "./FormTextarea";
import { Switch } from "@/components/ui/switch"; 
import { Plus } from "lucide-react";
import { ProfileHobbyDialog } from "./ProfileHobby";
import { NavLink } from "react-router-dom";
const profileItems = [
  { text: "Nơi tôi từng theo học", icon: BookOpenIcon },
  { text: "Nơi tôi luôn muốn đến", icon: MapPinIcon },
  { text: "Thập niên tôi sinh ra", icon: GiftIcon },
  { text: "Kỹ năng tốt nhất của tôi", icon: StarIcon },
  { text: "Bài hát yêu thích của tôi", icon: MusicIcon },
  { text: "Công việc của tôi", icon: BriefcaseIcon },
  { text: "Thú cưng", icon: SmileIcon },
  { text: "Sự thật thú vị về tôi", icon: Brain },
  { text: "Tôi dành quá nhiều thời gian để", icon: ClockIcon },
  { text: "Thứ mà tôi luôn nghĩ đến", icon: HeartIcon },
];

export default function ProfilePage() {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isIntroDialogOpen, setIsIntroDialogOpen] = useState(false); 
  const [showEditButton, setShowEditButton] = useState(false);
  const [isHobbyDialogOpen, setIsHobbyDialogOpen] = useState(false);


  return (
    <div className="min-h-screen flex justify-center items-start p-6 mt-10">
      <div className="flex flex-col sm:flex-row gap-12 w-full max-w-6xl">

        {/* Left: Avatar */}
        <div className="flex flex-col items-center sm:items-start ml-10">
          <div className="relative mb-4">
            <div className="w-50 h-50 bg-black text-white rounded-full flex items-center justify-center text-8xl font-bold relative">
              M
              <Button
                variant="secondary"
                size="sm"
                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-6 py-1 text-[16px] rounded-full shadow-md hover:bg-gray-100 transition"
              >
                Thêm
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Profile content */}
        <div className="flex-1 ml-30">
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">Hồ sơ của tôi</h1>
            <p className="text-gray-600 text-sm">
              Host và khách có thể xem hồ sơ của bạn và hồ sơ này có thể hiển thị trên Airbnb để giúp chúng tôi tạo dựng niềm tin trong cộng đồng của mình.{" "}
              <a href="#" className="underline font-medium">Tìm hiểu thêm</a>
            </p>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profileItems.map(({ text, icon: Icon }, index) => {
              const hideBorder =
                hoverIndex === index || hoverIndex === index - 1;

              return (
                <Button
                  key={index}
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onClick={() => setSelectedItem(text)}
                  className={`justify-start h-auto py-6 w-[300px] text-base font-medium border-0 transition break-words whitespace-normal bg-transparent rounded-md ${
                    hideBorder ? "border-b-transparent" : "border-b border-gray-300"
                  } hover:bg-gray-100 flex items-center gap-3`}
                >
                  <Icon className="w-5 h-5 text-gray-600" />
                  {text}
                </Button>
              );
            })}
          </div>

          {/* Dialog khi click từng nút */}
          {selectedItem && (
            <ProfileFormDialog
              isOpen={true}
              onClose={() => setSelectedItem(null)}
              title={selectedItem}
            />
          )}
          
        
          {/* Giới thiệu bản thân */}

          <div className="mt-8">
            <h1 className="text-3xl font-bold mb-2">Giới thiệu bản thân</h1>
            <Card className="border-dashed border border-gray-300 rounded-xl mt-8">
              <CardContent className="p-6 space-y-2">
                <p className="text-gray-600">Viết nội dung thú vị và ấn tượng.</p>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsIntroDialogOpen(true); 
                  }}
                  className="text-sm text-black font-medium underline"
                >
                  Thêm phần giới thiệu
                </a>
              </CardContent>
            </Card>

            {/* Gọi đúng component mới tên là ProfileTextareaDialog */}
            <ProfileTextareaDialog
              isOpen={isIntroDialogOpen}
              onClose={() => setIsIntroDialogOpen(false)}
              title="Giới thiệu bản thân"
            />
          </div>
               <hr className="mt-8 border-gray-300" />   
          {/* Nơi tôi từng đến */}
             <div className="mt-8  ">
      {/* Phần tiêu đề và switch */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold mb-2">Nơi tôi từng đến</h1>
          <p className="text-sm text-gray-500">
            Chọn tem mà bạn muốn hiển thị cho người khác xem trên hồ sơ của mình.
          </p>
        </div>

        {/* Switch component từ Shadcn/UI */}
        <Switch
        
          id="show-travel-badge"
          checked={showEditButton}
          onCheckedChange={(checked) => setShowEditButton(checked)}
        />
      </div>
           
      {showEditButton && (
        <div className="mt-10">
          <Button variant="secondary" className=" w-[220px] h-[50px] bg-gray-100  hover:bg-gray-200  rounded-md text-lg"
          >
            Chỉnh sửa tem du lịch
          </Button>
        </div>
      )}
    </div>

       <hr className="mt-8 border-gray-300" />   
            
         <div className="mt-8">
            <h1 className="text-3xl font-bold mb-2">Giới thiệu bản thân</h1>
            <Card className="border-dashed border border-gray-300 rounded-xl mt-8">
              <CardContent className="p-6 space-y-2">
                <p className="text-gray-600">Viết nội dung thú vị và ấn tượng.</p>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsIntroDialogOpen(true); 
                  }}
                  className="text-sm text-black font-medium underline"
                >
                  Thêm phần giới thiệu
                </a>
              </CardContent>
            </Card>
            <ProfileTextareaDialog
              isOpen={isIntroDialogOpen}
              onClose={() => setIsIntroDialogOpen(false)}
              title="Giới thiệu bản thân"
            />
          </div>
        <hr className="mt-8 border-gray-300" />   
     
            <div className="mt-8  ">
            {/* Sở thích */}
            <h1 className="text-3xl font-bold mb-2">Sở thích của tôi</h1>
            <p className="text-gray-600">Thêm sở thích vào hồ sơ để tìm ra điểm chung với host và khách khác.</p>
            <div className="flex gap-4 mb-6 mt-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                onClick={() => setIsHobbyDialogOpen(true)} // mở dialog khi click
                className="w-25 h-10 flex items-center justify-center border-1 border-dashed rounded-xl text-gray-400 cursor-pointer"
              >
                <Plus className="w-20 h-6" />
              </div>
            ))}
          </div>

          <Button
            variant="secondary"
            className="w-[200px] h-[46px] bg-gray-100 hover:bg-gray-200 rounded-md text-lg"
            onClick={() => setIsHobbyDialogOpen(true)} // cũng mở dialog khi click
          >
            Thêm sở thích
          </Button>

          <ProfileHobbyDialog
            isOpen={isHobbyDialogOpen}
            onClose={() => setIsHobbyDialogOpen(false)}
            title="Chọn sở thích của bạn"
          />

      </div>


       <hr className="mt-8 border-gray-300" />   

          {/* Hoàn tất button */}
          <div className="mt-8 ml-160">
            <Button className="px-6 py-6 text-white bg-black rounded-xl text-lg">
              <NavLink to="/profilepage" className="flex items-center justify-center">
               Hoàn tất
              </NavLink>
             
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
