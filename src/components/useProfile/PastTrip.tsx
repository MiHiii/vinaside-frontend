import React from "react";
import { Button } from "@/components/ui/button"; // Import button từ UI

const PastTrip = () => {
  return (
    <div className="flex flex-col items-center justify-center p-2"> {/* Dùng Flexbox để căn giữa */}
      <a href="">
        <img className="w-80 h-70" src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-UserProfile/original/797c1df2-a40c-4d93-9550-ca5b213cd01b.png?im_w=240" alt="" />
      </a>
      <p className="text-sm mb-6 text-center"> {/* Căn giữa đoạn văn */}
        Sau khi thực hiện chuyến đi đầu tiên trên Airbnb, bạn <br/>  sẽ tìm thấy các đặt chỗ trước đây của mình tại đây.
      </p>
      <Button
        className="w-[180px] text-lg font-semibold rounded-xl text-white hover:bg-pink-700 h-[50px]"
        style={{ backgroundColor: "#ff385c" }}
      >
        Đặt chuyến đi
      </Button>
    </div>
  );
};

export default PastTrip;
