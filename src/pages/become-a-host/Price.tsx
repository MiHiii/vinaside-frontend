import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";  // Shadcn UI component for input fields
import { Label } from "@/components/ui/label";  // Shadcn UI component for labels
import { FormatPrice } from "@/components/become-a-host/FormatPrice"; // Import FormatPrice component

export default function Price() {
  const [price, setPrice] = useState("");
  const [weekendPrice, setWeekendPrice] = useState("");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main - Chỉnh sửa theo yêu cầu */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-semibold mb-4 text-gray-800">
            Bây giờ, hãy đặt giá cho Homestay của bạn
          </h1>
          <p className="text-gray-500 mb-6">
            Lưu ý: Mức giá cuối tuần phụ thuộc vào từng phụ thu của Homestay của bạn.
          </p>

          <div className="space-y-4">
            <Label htmlFor="price" className="text-lg font-medium text-gray-700">
              Giá ngày trong tuần
            </Label>
            <Input
              id="price"
              type="number"
              placeholder="Nhập giá ngày trong tuần..."
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-4 text-gray-700 border border-gray-300 rounded-sm shadow-sm focus:ring-rose-500 focus:border-rose-500"
            />
            <div className="text-sm text-gray-500 text-right">
              <FormatPrice value={price} />
            </div>
          </div>
          <div className="space-y-4">
            <Label htmlFor="weekend-price" className="text-lg font-medium text-gray-700">
              Giá cuối tuần
            </Label>
            <Input
              id="weekend-price"
              type="number"
              placeholder="Nhập giá cuối tuần..."
              value={weekendPrice}
              onChange={(e) => setWeekendPrice(e.target.value)}
              className="w-full p-4 text-gray-700 border border-gray-300 rounded-sm shadow-sm focus:ring-rose-500 focus:border-rose-500"
            />
            <div className="text-sm text-gray-500 text-right">
              <FormatPrice value={weekendPrice} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <Link to="/become-a-host/finish-setup">
              <Button
                variant="ghost"
                className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>

            <Button
              onClick={() => {
                if (price) {
                  navigate("/hosting/listings");
                } else {
                  alert("Vui lòng nhập giá cơ sở trước khi tiếp tục.");
                }
              }}
              className={`${
                !price ? "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200" : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
              } text-white px-8 py-3 rounded-lg font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200`}
              disabled={!price}
            >
              Tiếp theo
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
