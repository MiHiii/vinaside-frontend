import { Link } from "react-router-dom"
import { FaFacebook, FaTwitter, FaInstagram, FaGlobe } from "react-icons/fa"
import { Button } from "@/components/ui/button"

export default function ClientFooter() {
  return (
    <footer className="w-full border-t border-gray-200bg-[hsl(var(--background))] text-[hsl(var(--foreground))] py-8 text-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Support Column */}
          <div className="space-y-4">
            <h3 className="font-medium">Hỗ trợ</h3>
            <ul className="space-y-3">
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Yêu cầu trợ giúp về vấn đề an toàn
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  AirCover
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Chống phân biệt đối xử
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Hỗ trợ người khuyết tật
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Các tùy chọn hủy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Báo cáo lo ngại của khu dân cư
                </Link>
              </li>
            </ul>
          </div>

          {/* Hosting Column */}
          <div className="space-y-4">
            <h3 className="font-medium">Đón tiếp khách</h3>
            <ul className="space-y-3">
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Cho thuê nhà trên Vinaside
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  AirCover cho Chủ nhà
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Tài nguyên về đón tiếp khách
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Diễn đàn cộng đồng
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Đón tiếp khách có trách nhiệm
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Tham gia khóa học miễn phí về công việc Đón tiếp khách
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Tìm host hỗ trợ
                </Link>
              </li>
            </ul>
          </div>

          {/* Vinaside Column */}
          <div className="space-y-4">
            <h3 className="font-medium">Vinaside</h3>
            <ul className="space-y-3">
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Bản phát hành Mùa hè 2025
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Trang tin tức
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Tính năng mới
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Cơ hội nghề nghiệp
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Nhà đầu tư
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:underline">
                  Chỗ ở khẩn cấp Vinaside.org
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col items-center border-t border-gray-200 pt-8 md:flex-row md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-gray-600">
            <span>© 2025 Vinaside, Inc.</span>
            <span className="hidden md:inline">·</span>
            <Link to="#" className="hover:underline">
              Quyền riêng tư
            </Link>
            <span className="hidden md:inline">·</span>
            <Link to="#" className="hover:underline">
              Điều khoản
            </Link>
            <span className="hidden md:inline">·</span>
            <Link to="#" className="hover:underline">
              Sơ đồ trang web
            </Link>
          </div>

          <div className="mt-4 flex items-center gap-4 md:mt-0">
            <Button variant="ghost" size="icon" className="rounded-full">
              <FaGlobe className="h-5 w-5" />
              <span className="ml-2">Tiếng Việt (VN)</span>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full ml-7">
              <span>₫ VND</span>
            </Button>
            <Link to="#" className="text-gray-600 hover:text-gray-900">
              <FaFacebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link to="#" className="text-gray-600 hover:text-gray-900">
              <FaTwitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link to="#" className="text-gray-600 hover:text-gray-900">
              <FaInstagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
