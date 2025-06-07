import React, { useEffect } from "react";

interface ModalContentProps {
  onClose: () => void;
}

const ModalContent: React.FC<ModalContentProps> = ({ onClose }) => {
  // Ngăn cuộn nền khi modal hiển thị
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      {/* Card modal: h-[70vh] để chiếm 70% viewport height */}
 <div
        className="
          bg-white 
          h-[70vh] 
          rounded-2xl 
          shadow-2xl ring-1 ring-black/10 
          max-w-4xl 
          w-full 
          p-6 
          relative 
          flex flex-col
        "
        role="dialog"
        aria-modal="true"
      >
        {/* Nút Đóng (X) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>

        {/* Nội dung của card */}
        <div className="flex flex-col flex-1 overflow-y-auto pr-2">
          {/* Mỗi mục trong <ul> bây giờ là một <li> với dấu “+” */}
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="mr-2 text-gray-900">+</span>
              <h2 className="text-2xl font-bold leading-tight">
                Giới thiệu về chỗ ở này
              </h2>
            </li>

            <li className="flex items-start">
              <span className="mr-2 text-gray-900">+</span>
              <p>
                Thư giãn trong sự thoải mái và yên tĩnh ở nơi yên bình này nằm
                hoàn hảo ở trung tâm Sài Gòn, tòa nhà Bitexco, chợ Bến Thành,
                Phố đi bộ Nguyễn Huệ, Nhà thờ Đức Bà Sài Gòn, Dinh Độc Lập...
              </p>
            </li>

            <li className="flex items-start">
              <span className="mr-2 text-gray-900">+</span>
              <p>
                Địa điểm đặc biệt này gần mọi nơi, giúp bạn dễ dàng lên kế hoạch
                cho chuyến thăm của mình.
              </p>
            </li>

            <li className="flex items-start">
              <span className="mr-2 text-gray-900">+</span>
              <div className="space-y-2">
                <p>
                  &lt; 5 phút đi bộ từ Trung tâm mua sắm & Công viên
                </p>
                <p>
                  Chợ trái cây và ẩm thực địa phương đích thực trước nhà của
                  chúng tôi
                </p>
                <p>
                  Nhiều nhà hàng địa phương gần đó (ăn chay, hải sản, bánh
                  mì,...)
                </p>
              </div>
            </li>

            <li className="flex items-start">
              <span className="mr-2 text-gray-900">+</span>
              <p>
                <strong>Chỗ ở:</strong> Căn phòng đặc biệt này nằm ở tầng 4,
                mang đến trải nghiệm độc đáo và riêng tư. Để sử dụng, bạn có thể
                đi thang máy lên tầng 3 và sau đó đi lên một tầng cầu thang.
                Đừng lo lắng về hành lý của bạn – chúng tôi sẽ có mặt để chào
                đón bạn và hỗ trợ bất cứ điều gì bạn cần, đảm bảo việc đến nơi
                suôn sẻ và thoải mái!
              </p>
            </li>

            <li className="flex items-start">
              <span className="mr-2 text-gray-900">+</span>
              <p>
                (Thêm nội dung để kiểm tra thanh cuộn) Lorem ipsum dolor sit
                amet, consectetur adipiscing elit. Sed et justo orci. Phasellus
                consectetur vitae elit non sollicitudin. Curabitur condimentum
                euismod nisi, vel tincidunt mi feugiat et. Sed finibus, orci nec
                auctor facilisis, felis nunc aliquam enim, sed aliquet tortor
                sapien vitae mi. Vivamus ac justo vehicula, convallis nulla ac,
                dictum magna. Pellentesque imperdiet, dui et consequat euismod,
                nulla risus volutpat magna, eu tempor orci lectus et felis. Cras
                sollicitudin turpis eget magna gravida auctor.
              </p>
            </li>

            {/* Gộp nội dung Máy giặt, Máy sấy và Gửi hành lý vào cùng một <li> */}
            <li className="flex items-start">
              <span className="mr-2 text-gray-900">+</span>
              <div className="space-y-2">
                <p>
                  <strong>Khu giặt sấy chung ở khu vực lầu 3 của ngôi nhà:</strong>
                </p>
                <div className="pl-4 space-y-1">
                  <p>
                    <strong>Máy giặt:</strong> Có hướng dẫn sử dụng máy dán bên phải máy. Nước giặt miễn phí để sẵn trên bàn bên cạnh máy. Móc treo phơi đồ để sẵn trên bàn, nằm phía bên trái của máy nếu bạn muốn phơi đồ bằng ánh sáng tự nhiên, khu vực phơi nằm phía bên phải máy giặt.
                  </p>
                  <p>
                    <strong>Máy sấy:</strong> Nếu bạn không phơi đồ, sử dụng máy sấy để làm khô, đã được cài đặt sẵn sấy 60 phút.
                  </p>
                  <p>
                    <strong>Gửi hành lý trước khi nhận phòng và sau khi trả phòng:</strong> Bạn có thể gửi hành lý cho nhân viên ở cửa hàng Little Paris. Nếu bạn đến sớm hơn thời gian cửa hàng hoạt động, hỏi tôi để tôi gửi hướng dẫn cho bạn chỗ để hành lý.
                  </p>
                </div>
              </div>
            </li>

            <li className="flex items-start">
              <span className="mr-2 text-gray-900">+</span>
              <p>
                Curabitur condimentum euismod nisi, vel tincidunt mi feugiat et.
                Sed finibus, orci nec auctor facilisis, felis nunc aliquam enim,
                sed aliquet tortor sapien vitae mi. Vivamus ac justo vehicula,
                convallis nulla ac, dictum magna. Pellentesque imperdiet, dui et
                consequat euismod, nulla risus volutpat magna, eu tempor orci
                lectus et felis.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ModalContent;
