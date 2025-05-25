import { Accordion, AccordionItem } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Share, Heart } from "lucide-react"
import { Card } from "@/components/ui/card"


export default function ClientDetail() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 ml-[114px]">
   
     <div className="flex items-center justify-between mt-7 mb-7">
  <h1 className="text-3xl font-bold">
    P"m"P.24 : Tropical flat * Gorgeous Bathtub in D1
  </h1>
  <div className="flex gap-4">
    <Button variant="ghost" className="flex items-center gap-1 p-0 hover:underline hover:bg-gray-100">
      <Share className="w-4 h-4" />
      <span className="underline">Chia sẻ</span>
    </Button>
    <Button variant="ghost" className="flex items-center gap-1 p-0 hover:underline hover:bg-gray-100">
      <Heart className="w-4 h-4" />
      <span className="underline">Lưu</span>
    </Button>
  </div>
</div>
      {/* Gallery */}
      <div className="grid grid-cols-5 gap-2 h-[500px] rounded-xl overflow-hidden mb-8">
        {/* Ảnh lớn bên trái */}
        <div className="col-span-3 w-full">
          <img
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60"
            alt="Main"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Cụm ảnh nhỏ bên phải */}
        <div className="col-span-2 w-full grid grid-rows-2 gap-2 h-full">
    
          {/* Hàng 1 */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <img
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60"
              className="w-full h-full object-cover"
              alt="Gallery 1"
            />
            <img
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60"
              className="w-full h-full object-cover"
              alt="Gallery 2"
            />
          </div>
          {/* Hàng 2 */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <img
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60"
              className="w-full h-full object-cover"
              alt="Gallery 3"
            />
            <div className="relative">
                  <img
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60"
              className="w-full h-full object-cover"
              alt="Gallery 4"
            />
             <Button
        variant="outline"
        className="absolute right-4 bottom-4 z-10 font-semibold px-5 py-2 rounded-lg border border-black flex items-center gap-2 bg-white hover:bg-gray-100 shadow"
      >
        <span className="w-5 h-5 flex items-center justify-center">
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
            <circle cx="4" cy="4" r="1.5" fill="black"/>
            <circle cx="10" cy="4" r="1.5" fill="black"/>
            <circle cx="16" cy="4" r="1.5" fill="black"/>
            <circle cx="4" cy="10" r="1.5" fill="black"/>
            <circle cx="10" cy="10" r="1.5" fill="black"/>
            <circle cx="16" cy="10" r="1.5" fill="black"/>
            <circle cx="4" cy="16" r="1.5" fill="black"/>
            <circle cx="10" cy="16" r="1.5" fill="black"/>
            <circle cx="16" cy="16" r="1.5" fill="black"/>
          </svg>
        </span>
        Hiển thị tất cả ảnh
      </Button>
            </div>
          
          </div>
  
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Description & Amenities */}
        <div className="lg:col-span-2">
          {/* Description */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Toàn bộ căn hộ cho thuê tại Quận 1, Việt Nam</h1>
            <p className="text-muted-foreground mb-2">2 khách · 1 phòng ngủ · 1 giường · 1 phòng tắm</p>
            <Accordion type="single" collapsible>
              <AccordionItem value="desc">
                <div className="text-sm text-gray-700">
                  Khi bạn bước vào căn hộ, bạn sẽ thấy đá cẩm thạch ẩn dưới trần nhà tuyệt đẹp cùng không gian xanh mát.
                </div>
              </AccordionItem>
            </Accordion>
          </div>
          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Nơi này có những gì cho bạn</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <li>Bếp</li>
              <li>Wi-Fi</li>
              <li>Không gian làm việc</li>
              <li>Bồn tắm nước nóng</li>
              <li>TV</li>
              <li>Máy giặt</li>
              <li>Máy sấy</li>
              <li>Điều hòa nhiệt độ</li>
            </ul>
          </div>
        </div>
        {/* Right side - Booking Card & Rating */}
        <div className="space-y-6">

             {/* Box thông báo hiếm khi còn phòng */}
      <div className="w-fit mb-6">
        {/* Đường viền trên, đổ bóng xám đều */}
        <div
          className="mx-auto mb-[-8px] h-2 w-24  "
          // style={{ boxShadow: "0 4px 16px 0 #8886, 0 2px 8px 0 #8884" }}
        />
       <Card
  className="flex items-center gap-2 px-4 py-4 rounded-xl w-fit bg-white border-0"
  style={{ boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1), 0 0px 4px rgba(0, 0, 0, 0.06)" }}
>
          <span>
            {/* SVG kim cương outline đẹp */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <g stroke="#F472B6" strokeWidth="1.5" strokeLinejoin="round">
                <polygon points="12 3 2 9 12 21 22 9 12 3" fill="#fff" />
                <path d="M2 9h20" />
                <path d="M7 9l5 12 5-12" />
                <path d="M7 9l5-6 5 6" />
                <path d="M12 3v18" />
              </g>
            </svg>
          </span>
          <span className="text-sm font-medium text-gray-900">
            Hiếm khi còn phòng! Chỗ ở này thường kín phòng
          </span>
        </Card>
      </div>

          {/* Booking Card */}
          <div className="sticky top-20 w-full border shadow-xl rounded-xl bg-white">
            <div className="p-6 border-b">
              <div className="text-xl font-semibold">₫5.431.201 / 2 đêm</div>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                <Calendar mode="range" />
                <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">Đặt phòng</Button>
                <p className="text-sm text-center text-gray-500">Bạn chưa bị trừ tiền</p>
              </div>
            </div>
          </div>
          {/* Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold">4.98</div>
            <p className="text-sm text-gray-500">Dựa trên 170 đánh giá</p>
          </div>
        </div>
      </div>
    </div>
    
  )
}
