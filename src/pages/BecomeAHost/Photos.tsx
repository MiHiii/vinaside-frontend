import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropzoneUpload } from "@/components/BecomeAHost/DropzoneUpload";
import { Header } from "@/components/BecomeAHost/Header";

export default function UploadPhotos() {
  const [images, setImages] = useState<File[]>([]);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main */}
      <main className="flex-grow flex flex-col items-center p-8 bg-white">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2 text-gray-800">
            Bổ sung một số bức ảnh chụp chỗ ở của bạn
          </h1>
          <p className="text-gray-500 mb-6">
            Bạn sẽ cần 5 bức ảnh để bắt đầu. Về sau, bạn vẫn có thể dễ dàng thay đổi.
          </p>

          <DropzoneUpload images={images} setImages={setImages} />
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-center w-full">
            <Link to="/amenities">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <Button
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-3 rounded-lg font-medium text-base shadow hover:shadow-md transition-all"
              onClick={() => navigate("/title")}
              disabled={images.length < 5}
            >
              Tiếp theo
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
