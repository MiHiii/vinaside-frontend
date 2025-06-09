import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function Overview() {
  const steps = [
    {
      id: 1,
      title: "Chia sẻ thông tin về chỗ ở của bạn cho chúng tôi",
      description:
        "Chia sẻ một số thông tin cơ bản, như vị trí của nhà/phòng cho thuê và số lượng khách có thể ở tại đó.",
      image:
        "https://a0.muscache.com/4ea/air/v2/pictures/da2e1a40-a92b-449e-8575-d8208cc5d409.jpg",
    },
    {
      id: 2,
      title: "Làm cho nhà/phòng cho thuê trở nên nổi bật",
      description:
        "Thêm từ 5 ảnh trở lên cùng với tiêu đề và nội dung mô tả – chúng tôi sẽ giúp bạn thực hiện.",
      image:
        "https://a0.muscache.com/4ea/air/v2/pictures/bfc0bc89-58cb-4525-a26e-7b23b750ee00.jpg",
    },
    {
      id: 3,
      title: "Hoàn thiện và đăng mục cho thuê",
      description:
        "Chọn giá khởi điểm, xác minh một vài thông tin, và bắt đầu chào đón khách!",
      image:
        "https://a0.muscache.com/4ea/air/v2/pictures/c0634c73-9109-4710-8968-3e927df1191c.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Location page styling with original buttons */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="text-rose-500">
                <Home className="h-8 w-8" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                Vinaside
              </span>
            </Link>

            {/* Original Exit Button */}
            <Button
              variant="outline"
              className="rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm border border-gray-300 hover:border-black transition-colors"
            >
              Thoát
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left side title */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-gray-900">
              Bắt đầu trên <span className="text-rose-600 uppercase">Vinaside</span>
              <br className="hidden sm:block" />
              <span className="block sm:inline"> thật dễ dàng</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-md lg:hidden">
              Làm theo 3 bước đơn giản để bắt đầu cho thuê chỗ ở của bạn
            </p>
          </div>

          {/* Right side steps */}
          <div className="space-y-6 sm:space-y-8">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col sm:flex-row items-start gap-4 sm:gap-6 ${
                  index !== steps.length - 1
                    ? "border-b border-gray-200 pb-6 sm:pb-8"
                    : ""
                }`}
              >
                {/* Step number */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold">
                    {step.id}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg sm:text-xl lg:text-2xl text-gray-900 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Image - Responsive sizing */}
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <img
                    src={step.image}
                    alt={`Bước ${step.id}`}
                    className="w-full sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 object-cover rounded-lg shadow-sm"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer - Simplified without progress indicator */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex justify-end">
            <Link to="/about-your-place">
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200">
              Bắt đầu
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
