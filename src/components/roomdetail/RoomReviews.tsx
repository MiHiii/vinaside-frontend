import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  selectReviews,
  fetchReviewsByRoomId,
} from "@/store/slices/reviewSlice";


// Hàm loại bỏ dấu tiếng Việt
function removeAccents(str: string) {
  return str.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

const FILTERS = [
  "Phù hợp nhất",
  "Gần đây nhất",
  "Có điểm xếp hạng cao nhất",
  "Có điểm xếp hạng thấp nhất",
];
const RoomReviews: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [showAll, setShowAll] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredReviews = useAppSelector(selectReviews).filter((r) => {
    if (!r || !r.user) return false;
    const normalizedSearch = removeAccents(searchTerm.toLowerCase());
    // Lọc theo tên và nội dung đánh giá
    const name = getUserName(r.user);
    return (
      removeAccents(name.toLowerCase()).includes(normalizedSearch) ||
      removeAccents(r.comment.toLowerCase()).includes(normalizedSearch)
    );
  });
  const dispatch = useAppDispatch();
  const reduxReviews = useAppSelector(selectReviews);

  useEffect(() => {
    if (roomId) {
      dispatch(fetchReviewsByRoomId(roomId));
    }
  }, [roomId, dispatch]);



  function getUserAvatar(user: unknown): string {
    if (
      user &&
      typeof user === "object" &&
      "avatar_url" in user &&
      typeof (user as Record<string, unknown>).avatar_url === "string"
    ) {
      return (user as Record<string, string>).avatar_url;
    }
    return "https://via.placeholder.com/50";
  }
  function getUserName(user: unknown): string {
    if (
      user &&
      typeof user === "object" &&
      "name" in user &&
      typeof (user as Record<string, unknown>).name === "string"
    ) {
      return (user as Record<string, string>).name;
    }
    return "Avatar";
  }
  // Tính toán số lượng đánh giá và điểm trung bình từ reduxReviews
  const totalReviews = reduxReviews.filter((r) => r && r.user).length;
  const averageRating =
    totalReviews > 0
      ? reduxReviews
          .filter((r) => r && r.user)
          .reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;
  return (
    <div className="mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ngoài modal: luôn hiển thị 6 review đầu, không lọc searchTerm */}
        {(showAll
          ? []
          : reduxReviews.filter((r) => r && r.user).slice(0, 6)
        ).map((r, idx) => (
          <div key={idx} className="flex flex-col gap-2 p-6">
            <div className="flex items-center gap-4 mb-2">
              <img
                src={getUserAvatar(r.user)}
                alt={getUserName(r.user)}
                className="h-12 w-12 rounded-full object-cover border border-gray-200"
              />
              <div>
                <div className="font-semibold text-lg text-gray-900">
                  {r.user?.name || "Khách hàng"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
              {Array.from({ length: r.rating }).map((_, i) => (
                <span key={i}>★</span>
              ))}
              <span className="ml-2">
                {r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString()
                  : ""}
              </span>
            </div>
            <div className="text-gray-900 text-base mb-2">{r.comment}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-8">
        <Dialog open={showAll} onOpenChange={setShowAll}>
          <DialogTrigger asChild>
            <Button
              className="rounded-xl px-6 py-3 bg-gray-100 text-gray-900 font-semibold text-base shadow-none hover:bg-gray-200"
              style={{ display: showAll ? "none" : undefined }}
            >
              {`Hiển thị tất cả ${reduxReviews.length} đánh giá`}
            </Button>
          </DialogTrigger>
          <DialogContent
            style={{ width: "90vw", maxWidth: "1400px" }}
            className="p-0 bg-white border-none rounded-2xl overflow-hidden"
          >
            <div className="flex flex-col md:flex-row h-[80vh]">
              {/* Left: Tổng quan & tiêu chí */}
              <div className="md:w-1/3 w-full bg-gray-50 p-8 flex flex-col items-center justify-start border-r border-gray-200">
                <div className="text-5xl font-bold flex items-center gap-2 mb-2">
                  {averageRating.toFixed(1)}
                  <span>
                    <img
                      src="https://vinaside.sgp1.digitaloceanspaces.com/avatar/1752684867666-662549443.png"
                      alt="favorite"
                      width={32}
                      height={32}
                      className="inline-block"
                    />
                  </span>
                </div>
                <div className="font-semibold text-lg mb-2">
                  {totalReviews > 0
                    ? `Được khách yêu thích (${totalReviews} lượt đánh giá)`
                    : "Chưa có đánh giá"}
                </div>
                <div className="text-gray-500 text-center mb-6 text-sm">
                  Nhà này được khách yêu thích dựa trên điểm xếp hạng, lượt đánh
                  giá và độ tin cậy
                </div>
                <div className="w-full mb-6">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>5</span>
                    <div className="flex-1 mx-2 h-1 bg-gray-300 rounded">
                      <div
                        className="h-1 bg-black rounded"
                        style={{ width: "90%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>4</span>
                    <div className="flex-1 mx-2 h-1 bg-gray-300 rounded">
                      <div
                        className="h-1 bg-black/60 rounded"
                        style={{ width: "10%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>3</span>
                    <div className="flex-1 mx-2 h-1 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>2</span>
                    <div className="flex-1 mx-2 h-1 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>1</span>
                    <div className="flex-1 mx-2 h-1 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between text-base">
                    <span>🧹 Mức độ sạch sẽ</span>
                    <span>4,8</span>
                  </div>
                  <div className="flex items-center justify-between text-base">
                    <span>✔️ Độ chính xác</span>
                    <span>4,9</span>
                  </div>
                  <div className="flex items-center justify-between text-base">
                    <span>🔑 Nhận phòng</span>
                    <span>4,9</span>
                  </div>
                  <div className="flex items-center justify-between text-base">
                    <span>💬 Giao tiếp</span>
                    <span>5,0</span>
                  </div>
                  <div className="flex items-center justify-between text-base">
                    <span>📍 Vị trí</span>
                    <span>4,9</span>
                  </div>
                  <div className="flex items-center justify-between text-base">
                    <span>🏷️ Giá trị</span>
                    <span>4,9</span>
                  </div>
                </div>
              </div>
              {/* Right: Danh sách bình luận */}
              <div className="md:w-2/3 w-full p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold">
                    {reduxReviews.length} lượt đánh giá
                  </div>
                </div>
                <div className="mb-4 flex items-center gap-4">
                  <div className="relative w-full max-w-xs">
                    <input
                      type="text"
                      placeholder="Tìm kiếm đánh giá"
                      className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black pr-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setSearchTerm("")}
                        tabIndex={-1}
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center ml-auto">
                    <button
                      className="border rounded-full px-4 py-2 flex items-center gap-2"
                      type="button"
                      onClick={() => setIsDropdownOpen((v) => !v)}
                    >
                      {selectedFilter}
                      <span>
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M7 10l5 5 5-5"
                            stroke="#222"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 bg-white border-none rounded shadow p-2 w-56 z-10">
                        {FILTERS.map((filter) => (
                          <div
                            key={filter}
                            className={`py-2 px-4 hover:bg-gray-100 cursor-pointer ${
                              selectedFilter === filter
                                ? "bg-gray-100 font-semibold"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedFilter(filter);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {filter}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-6">
                  {filteredReviews.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="text-lg font-semibold mb-4">
                        Không có kết quả cho ‘{searchTerm}’
                      </div>
                      <hr className="my-4" />
                      <div className="text-gray-500">
                        Đánh giá dịch từ ngôn ngữ khác sẽ không được hiển thị.
                        Bạn có thể tìm kiếm bằng ngôn ngữ gốc.
                      </div>
                    </div>
                  ) : (
                    filteredReviews
                      .filter((r) => r && r.user)
                      .map((r, idx) => (
                        <div
                          key={idx}
                          className="flex gap-4 border-b pb-6 last:border-b-0"
                        >
                          <img
                            src={getUserAvatar(r.user)}
                            alt={getUserName(r.user)}
                            className="h-12 w-12 rounded-full object-cover border border-gray-200 mt-1"
                          />
                          <div>
                            <div className="font-semibold text-lg text-gray-900">
                              {r.user?.name || "Khách hàng"}
                            </div>
                            <div className="text-gray-500 text-sm mb-1">
                              {r.createdAt
                                ? new Date(r.createdAt).toLocaleDateString()
                                : ""}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <span key={i}>★</span>
                              ))}
                              <span className="ml-2">
                                {r.createdAt
                                  ? new Date(r.createdAt).toLocaleDateString()
                                  : ""}
                              </span>
                            </div>
                            <div className="text-gray-900 text-base mb-2">
                              {r.comment}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <a
          href="#"
          className="text-gray-500 underline text-base flex items-center"
        >
          Tìm hiểu quy trình đánh giá
        </a>
      </div>
    </div>
  );
};

export default RoomReviews;
