import { Plus, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function BecomeAHost() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nội dung chính */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-3 text-center sm:text-left">
            Chào mừng Bạn quay trở lại VINASIDE
          </h1>
          <div className="text-lg mb-8 text-center font-semibold sm:text-left">
            Bắt đầu tạo mục cho thuê mới
          </div>
          {/* Card tạo mục mới */}
          <Link to={"/overview"}>
          <button
            className="
              w-full flex items-center gap-3 border border-gray-200 rounded-xl px-5 py-4 mb-2
              hover:bg-gray-50 transition
              focus:outline-none
            "
          >
            <span className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-lg">
              <Plus className="w-5 h-5" />
            </span>
            <span className="text-base font-medium flex-1 text-left">
              Tạo mục cho thuê mới
            </span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          </Link>
          <hr className="mt-6 border-gray-200" />
        </div>
      </main>
    </div>
  );
}
