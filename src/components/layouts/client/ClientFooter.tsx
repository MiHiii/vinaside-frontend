import { Link } from "react-router-dom"
import { FaFacebook, FaTwitter, FaInstagram, FaGlobe } from "react-icons/fa"
import { Button } from "@/components/ui/button"

export default function ClientFooter() {
  return (
    <footer className="w-full border-t bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-medium">Hỗ trợ</h3>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-600 hover:underline">Trung tâm trợ giúp</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Yêu cầu trợ giúp về vấn đề an toàn</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">AirCover</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Chống phân biệt đối xử</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Hỗ trợ người khuyết tật</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Các tùy chọn hủy</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Báo cáo lo ngại của khu dân cư</Link></li>
            </ul>
          </div>

          {/* Hosting */}
          <div className="space-y-4">
            <h3 className="font-medium">Đón tiếp khách</h3>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-600 hover:underline">Cho thuê nhà trên Vinaside</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">AirCover cho Chủ nhà</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Tài nguyên về đón tiếp khách</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Diễn đàn cộng đồng</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Đón tiếp khách có trách nhiệm</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Khóa học miễn phí</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Tìm host hỗ trợ</Link></li>
            </ul>
          </div>

          {/* Vinaside */}
          <div className="space-y-4">
            <h3 className="font-medium">Vinaside</h3>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-600 hover:underline">Bản phát hành Mùa hè 2025</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Trang tin tức</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Tính năng mới</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Cơ hội nghề nghiệp</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Nhà đầu tư</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Chỗ ở khẩn cấp Vinaside.org</Link></li>
            </ul>
          </div>

          {/* Legal + Social */}
          <div className="space-y-4">
            <h3 className="font-medium">Pháp lý & Mạng xã hội</h3>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-600 hover:underline">Điều khoản dịch vụ</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Chính sách quyền riêng tư</Link></li>
              <li><Link to="#" className="text-gray-600 hover:underline">Sơ đồ trang web</Link></li>
            </ul>
            <div className="flex space-x-4 mt-4 text-gray-600">
              <Link to="#"><FaFacebook /></Link>
              <Link to="#"><FaTwitter /></Link>
              <Link to="#"><FaInstagram /></Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex flex-wrap items-center gap-2 text-gray-600">
            <span>© 2025 Vinaside, Inc.</span>
            <span className="hidden sm:inline">·</span>
            <Link to="#" className="hover:underline">Quyền riêng tư</Link>
            <span className="hidden sm:inline">·</span>
            <Link to="#" className="hover:underline">Điều khoản</Link>
            <span className="hidden sm:inline">·</span>
            <Link to="#" className="hover:underline">Sơ đồ trang web</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 rounded-full">
              <FaGlobe className="h-4 w-4" />
              <span>Tiếng Việt (VN)</span>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full">₫ VND</Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
