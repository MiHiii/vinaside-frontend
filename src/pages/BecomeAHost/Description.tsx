import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/BecomeAHost/Header";

export default function Description() {
  const [description, setDescription] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-semibold mb-2 text-gray-800">
            Tạo phần mô tả
          </h1>
          <p className="text-gray-500 mb-6 font-semibold">
            Chia sẻ những điều tạo nên nét đặc biệt cho chỗ ở của bạn.
          </p>

          <div className="space-y-4">
            <Textarea
              id="home-title"
              rows={3}
              maxLength={32}
              placeholder="Nhập mô tả..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none w-full font-semibold h-44 p-4 text-gray-700 border border-gray-300 rounded-sm shadow-sm focus:ring-rose-500 focus:border-rose-500"
            />
            <div className="text-sm text-gray-500 text-right font-semibold">
              {description.length}/500
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            {/* Left side - Back button */}
            <Link to="/title">
              <Button
                variant="ghost"
                className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>

            {/* Right side - Next button */}
            <Link to={"/finish-setup"}>
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
