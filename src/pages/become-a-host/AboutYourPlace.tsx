import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Header } from "@/components/become-a-host/Header";

export default function AboutYourPlace() {
  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content - Đã chỉnh sửa */}
      <main className="flex-grow flex items-center justify-center p-8"> {/* Đã xóa max-w-7xl, mx-auto, py-8, sm:py-12 ở đây */}
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8"> {/* Thêm wrapper để giới hạn chiều rộng nội dung */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center"> {/* Đã xóa h-full ở đây */}
            {/* Left Panel - Content */}
            <div className="space-y-4 lg:space-y-6">
              {/* Step indicator */}
              <div className="text-lg font-medium text-black tracking-wide">
                Bước 1
              </div>

              {/* Main heading */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight">
                  Chia sẻ thông tin về chỗ ở của bạn cho chúng tôi
                </h1>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <p className="text-base sm:text-lg text-[#222] leading-relaxed">
                  Trong bước này, chúng tôi sẽ hỏi xem bạn cho thuê loại chỗ ở nào và bạn muốn cho khách đặt toàn bộ nhà hay chỉ một phòng cụ thể. Sau đó, hãy cho chúng tôi biết vị trí và số lượng khách có thể ở tại đó.
                </p>
              </div>
            </div>

            {/* Right Panel - Video */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-full max-w-sm lg:max-w-lg">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                    preload="metadata"
                  >
                    <source
                      src="https://stream.media.muscache.com/zFaydEaihX6LP01x8TSCl76WHblb01Z01RrFELxyCXoNek.mp4?v_q=high"
                      type="video/mp4"
                    />
                    {/* Fallback for browsers that don't support video */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-500 text-sm">
                          Video không thể tải
                        </p>
                      </div>
                    </div>
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            {/* Left side - Back button */}
            <Link to="/overview">
              <Button
                variant="ghost"
                className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>

            {/* Right side - Next button */}
            <Link to="/location">
              <Button
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
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