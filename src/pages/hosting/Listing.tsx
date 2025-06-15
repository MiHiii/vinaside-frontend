import { useState } from "react";
import { Plus } from "lucide-react";
import { CustomPagination } from "@/components/host/Pagination";
import { Button } from "@/components/ui/button";
import { ListingPopup } from "@/components/host/ListingPopup";
import { Link } from "react-router-dom";

type PostStatus = "Cần hành động" | "Đang thực hiện";

interface Post {
  id: number;
  image: string;
  status: PostStatus;
  title: string;
  location: string;
  favorite?: boolean;
}

const statusMap: Record<
  PostStatus,
  { color: string; dotColor: string; icon: React.ReactNode }
> = {
  "Cần hành động": {
    color: "bg-white text-gray-700 border border-gray-200",
    dotColor: "bg-red-500",
    icon: <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>,
  },
  "Đang thực hiện": {
    color: "bg-white text-gray-700 border border-gray-200",
    dotColor: "bg-orange-500", 
    icon: <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>,
  },
};

const posts: Post[] = [
  { id: 1, image: "https://picsum.photos/300/200?random=1", status: "Cần hành động", title: "Phòng xinh 1", location: "Chỗ ở tại Cầu Giấy, Hà Nội", favorite: true },
  { id: 2, image: "https://picsum.photos/300/200?random=2", status: "Đang thực hiện", title: "Phòng xinh 2", location: "Chỗ ở tại Cầu Giấy, Hà Nội", favorite: false },
  { id: 3, image: "https://picsum.photos/300/200?random=3", status: "Cần hành động", title: "Phòng xinh 3", location: "Chỗ ở tại Cầu Giấy, Hà Nội", favorite: true },
  { id: 4, image: "https://picsum.photos/300/200?random=4", status: "Đang thực hiện", title: "Phòng xinh 4", location: "Chỗ ở tại Cầu Giấy, Hà Nội", favorite: false },
  { id: 5, image: "https://picsum.photos/300/200?random=5", status: "Cần hành động", title: "Phòng xinh 5", location: "Chỗ ở tại Cầu Giấy, Hà Nội", favorite: true },
  { id: 6, image: "https://picsum.photos/300/200?random=6", status: "Đang thực hiện", title: "Phòng xinh 6", location: "Chỗ ở tại Cầu Giấy, Hà Nội", favorite: false },
  { id: 7, image: "https://picsum.photos/300/200?random=7", status: "Cần hành động", title: "Phòng xinh 7", location: "Chỗ ở tại Cầu Giấy, Hà Nội", favorite: true },
  { id: 8, image: "https://picsum.photos/300/200?random=8", status: "Đang thực hiện", title: "Phòng xinh 8", location: "Chỗ ở tại Cầu Giấy, Hà Nội", favorite: false },
];

export default function Listing() {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.ceil(posts.length / pageSize);
  const paginatedPosts = posts.slice((page - 1) * pageSize, page * pageSize);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); // Thêm state cho post được chọn
  // Xử lý mở popup
  const handleOpenPopup = (post: Post) => {
    setSelectedPost(post);
  };

  // Xử lý đóng popup
  const handleClosePopup = () => {
    setSelectedPost(null);
  };

  // Xử lý chỉnh sửa
  const handleEdit = () => {
    console.log("Chỉnh sửa post:", selectedPost?.id);
    handleClosePopup();
  };

  // Xử lý xoá
  const handleDelete = () => {
    console.log("Xoá post:", selectedPost?.id);
    handleClosePopup();
  };


  return (
    <div className="max-w-7xl mx-auto px-4 py-10 relative">
      {/* Nút thêm phòng ở góc phải */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Bài đăng của bạn</h1>
        <div className="flex gap-2">
          <Link to={"/become-a-host"}>
            <Button size="icon"
            className="bg-gray-100 hover:bg-gray-200 border border-gray-100 rounded-full w-12 h-12 flex items-center justify-center"
            aria-label="Thêm phòng"
            >
              <Plus className="w-14 h-14" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
        {paginatedPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => handleOpenPopup(post)}
            className="relative rounded-2xl shadow bg-white p-4 transition-all duration-300 hover:shadow-xl hover:scale-105 group"
          >
            {/* Hình ảnh */}
            <div className="relative">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover rounded-xl"
              />
              {/* Badge trạng thái giống hình */}
              <div
                className={`absolute top-3 left-3 flex items-center px-3 py-1 rounded-full font-medium text-xs shadow-sm ${statusMap[post.status].color}`}
              >
                {statusMap[post.status].icon}
                {post.status}
              </div>
            </div>
            {/* Tiêu đề và mô tả */}
            <div className="mt-3">
              <div className="font-semibold text-lg flex items-center gap-2">
                {post.title}
              </div>
              <div className="text-gray-500 text-sm">{post.location}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Phân trang */}
      <div className="flex justify-center mt-8">
        <CustomPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Thêm popup vào cuối component */}
      {selectedPost && (
        <ListingPopup
          open={!!selectedPost}
          onClose={handleClosePopup}
          image={selectedPost.image}
          title={selectedPost.title}
          location={selectedPost.location}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
