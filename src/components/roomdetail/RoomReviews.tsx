import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from '@/components/ui/dialog';
import { XIcon } from 'lucide-react';

// Hàm loại bỏ dấu tiếng Việt
function removeAccents(str: string) {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

const reviews = [
  {
    name: "Toan",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    time: "1 tháng hoạt động trên Airbnb",
    date: "tháng 6 năm 2025",
    stars: 5,
    content: "Chỗ ở tốt, nằm trong khu nội bộ, gần trung tâm, đi lại thuận tiện, khi trống phòng còn cho mình check in sớm, sẽ quay lại",
  },
  {
    name: "Jackson",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
    time: "Mới tham gia Airbnb",
    date: "2 tuần trước",
    stars: 5,
    content: "Vị trí rất thuận tiện, gần mọi thứ tôi cần. Chủ nhà trả lời nhanh chóng và rất hữu ích trong suốt thời gian lưu trú của tôi. Một điều cần lưu ý là phòng tắm có mùi nước tiểu đáng chú ý, có ...",
    more: true,
  },
  {
    name: "Nhung",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    time: "2 năm hoạt động trên Airbnb",
    date: "tháng 5 năm 2025",
    stars: 5,
    content: "Chỗ ở trung tâm, chủ nhà thân thiện và hỗ trợ khách tốt",
  },
  {
    name: "Peng",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    time: "6 năm hoạt động trên Airbnb",
    date: "1 tuần trước",
    stars: 5,
    content: "Vị trí rất tốt và dễ tiếp cận và giao tiếp cũng thuận tiện hơn, bên cạnh đó, nó rất sạch sẽ, nhưng sẽ hơi ồn ao vào buổi tối vì sẽ có một số âm nhạc bên ngoài, có thể nó ở gần đường phố,...",
    more: true,
  },
  {
    name: "Holy",
    avatar: "https://randomuser.me/api/portraits/women/46.jpg",
    time: "11 tháng hoạt động trên Airbnb",
    date: "4 ngày trước",
    stars: 5,
    content: "Chủ nhà rất thân thiện và kiên nhẫn. Nếu có bất kỳ câu hỏi nào, bạn có thể hỏi trực tiếp và nhận câu trả lời. Ngôi nhà cũng dễ tìm. Tự phục vụ rất thuận tiện.",
  },
  {
    name: "Colin",
    avatar: "https://randomuser.me/api/portraits/men/47.jpg",
    time: "Tempe, Arizona",
    date: "1 tuần trước",
    stars: 5,
    content: "Rất đáng giá tiền cho một địa điểm có nhiều thứ để ăn và uống xung quanh. Hoàn hảo cho người nước ngoài muốn ở lại vài đêm",
  },
  {
      name: "Colin",
      avatar: "https://randomuser.me/api/portraits/men/47.jpg",
      time: "Tempe, Arizona",
      date: "1 tuần trước",
      stars: 5,
      content: "Rất đáng giá tiền cho một địa điểm có nhiều thứ để ăn và uống xung quanh. Hoàn hảo cho người nước ngoài muốn ở lại vài đêm",
    },
];

const FILTERS = [
  "Phù hợp nhất",
  "Gần đây nhất",
  "Có điểm xếp hạng cao nhất",
  "Có điểm xếp hạng thấp nhất"
];
const RoomReviews: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredReviews = reviews.filter(r => {
    const normalizedSearch = removeAccents(searchTerm.toLowerCase());
    return (
      removeAccents(r.name.toLowerCase()).includes(normalizedSearch) ||
      removeAccents(r.content.toLowerCase()).includes(normalizedSearch)
    );
  });
  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-6">Đánh giá của khách</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ngoài modal: luôn hiển thị 6 review đầu, không lọc searchTerm */}
        {(showAll ? [] : reviews.slice(0, 6)).map((r, idx) => (
          <div key={idx} className="flex flex-col gap-2 p-6">
            <div className="flex items-center gap-4 mb-2">
              <img src={r.avatar} alt={r.name} className="h-12 w-12 rounded-full object-cover border border-gray-200" />
              <div>
                <div className="font-semibold text-lg text-gray-900">{r.name}</div>
                <div className="text-gray-500 text-sm">{r.time}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
              {Array.from({ length: r.stars }).map((_, i) => (
                <span key={i}>★</span>
              ))}
              <span className="ml-2">{r.date}</span>
            </div>
            <div className="text-gray-900 text-base mb-2">
              {r.content}
              {r.more && <span className="ml-1 underline cursor-pointer text-gray-600">Hiển thị thêm</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-8">
        <Dialog open={showAll} onOpenChange={setShowAll}>
          <DialogTrigger asChild>
            <Button
              className="rounded-xl px-6 py-3 bg-gray-100 text-gray-900 font-semibold text-base shadow-none hover:bg-gray-200"
              style={{ display: showAll ? 'none' : undefined }}
            >
              {`Hiển thị tất cả ${reviews.length} đánh giá`}
            </Button>
          </DialogTrigger>
          <DialogContent
            style={{ width: '90vw', maxWidth: '1400px' }}
            className="p-0 bg-white border-none rounded-2xl overflow-hidden"
          >
            <div className="flex flex-col md:flex-row h-[80vh]">
              {/* Left: Tổng quan & tiêu chí */}
              <div className="md:w-1/3 w-full bg-gray-50 p-8 flex flex-col items-center justify-start border-r border-gray-200">
                <div className="text-5xl font-bold flex items-center gap-2 mb-2">5,0 <span>
                <img src="https://vinaside.sgp1.digitaloceanspaces.com/avatar/1752684867666-662549443.png" alt="favorite" width={32} height={32} className="inline-block" />
                  </span></div>
                <div className="font-semibold text-lg mb-2">Được khách yêu thích</div>
                <div className="text-gray-500 text-center mb-6 text-sm">Nhà này được khách yêu thích dựa trên điểm xếp hạng, lượt đánh giá và độ tin cậy</div>
                <div className="w-full mb-6">
                  <div className="flex items-center justify-between text-sm mb-1"><span>5</span><div className="flex-1 mx-2 h-1 bg-gray-300 rounded"><div className="h-1 bg-black rounded" style={{width:'90%'}}></div></div></div>
                  <div className="flex items-center justify-between text-sm mb-1"><span>4</span><div className="flex-1 mx-2 h-1 bg-gray-300 rounded"><div className="h-1 bg-black/60 rounded" style={{width:'10%'}}></div></div></div>
                  <div className="flex items-center justify-between text-sm mb-1"><span>3</span><div className="flex-1 mx-2 h-1 bg-gray-300 rounded"></div></div>
                  <div className="flex items-center justify-between text-sm mb-1"><span>2</span><div className="flex-1 mx-2 h-1 bg-gray-300 rounded"></div></div>
                  <div className="flex items-center justify-between text-sm mb-1"><span>1</span><div className="flex-1 mx-2 h-1 bg-gray-300 rounded"></div></div>
                </div>
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between text-base"><span>🧹 Mức độ sạch sẽ</span><span>4,8</span></div>
                  <div className="flex items-center justify-between text-base"><span>✔️ Độ chính xác</span><span>4,9</span></div>
                  <div className="flex items-center justify-between text-base"><span>🔑 Nhận phòng</span><span>4,9</span></div>
                  <div className="flex items-center justify-between text-base"><span>💬 Giao tiếp</span><span>5,0</span></div>
                  <div className="flex items-center justify-between text-base"><span>📍 Vị trí</span><span>4,9</span></div>
                  <div className="flex items-center justify-between text-base"><span>🏷️ Giá trị</span><span>4,9</span></div>
                </div>
              </div>
              {/* Right: Danh sách bình luận */}
              <div className="md:w-2/3 w-full p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold">{reviews.length} lượt đánh giá</div>
                </div>
                <div className="mb-4 flex items-center gap-4">
                  <div className="relative w-full max-w-xs">
                    <input
                      type="text"
                      placeholder="Tìm kiếm đánh giá"
                      className="border rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black pr-10"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
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
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                          <path d="M7 10l5 5 5-5" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 bg-white border-none rounded shadow p-2 w-56 z-10">
                        {FILTERS.map((filter) => (
                          <div
                            key={filter}
                            className={`py-2 px-4 hover:bg-gray-100 cursor-pointer ${selectedFilter === filter ? 'bg-gray-100 font-semibold' : ''}`}
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
                        Đánh giá dịch từ ngôn ngữ khác sẽ không được hiển thị. Bạn có thể tìm kiếm bằng ngôn ngữ gốc.
                      </div>
                    </div>
                  ) : (
                    filteredReviews.map((r, idx) => (
                      <div key={idx} className="flex gap-4 border-b pb-6 last:border-b-0">
                        <img src={r.avatar} alt={r.name} className="h-12 w-12 rounded-full object-cover border border-gray-200 mt-1" />
                        <div>
                          <div className="font-semibold text-lg text-gray-900">{r.name}</div>
                          <div className="text-gray-500 text-sm mb-1">{r.time}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                            {Array.from({ length: r.stars }).map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                            <span className="ml-2">{r.date}</span>
                          </div>
                          <div className="text-gray-900 text-base mb-2">
                            {r.content}
                            {r.more && <span className="ml-1 underline cursor-pointer text-gray-600">Hiển thị thêm</span>}
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
        <a href="#" className="text-gray-500 underline text-base flex items-center">Tìm hiểu quy trình đánh giá</a>
      </div>
    </div>
  );
};

export default RoomReviews; 