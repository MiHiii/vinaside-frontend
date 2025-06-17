import React from "react";
import { Button } from "@/components/ui/button"; // Import button từ UI

const Connection = () => {
  return (
    <div className="flex flex-col items-center justify-center p-2">
      {" "}
      {/* Dùng Flexbox để căn giữa */}
      <a href="">
        <img
          className="w-100 h-50"
          src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-UserProfile/original/e7a31b6a-2370-4cec-8bd7-8943d4130a8e.png?im_w=1680&im_q=medq"
          alt=""
        />
      </a>
      <p className="text-sm mb-6 text-center">
        {" "}
        {/* Căn giữa đoạn văn */}
        Khi bạn tham gia trải nghiệm hoặc mời ai <br /> đó tham gia chuyến đi,
        bạn sẽ tìm thấy hồ
        <br /> sơ của những khách khác ở đây{" "}
        <a href="#" className="underline">
          Tìm hiểu thêm
        </a>
      </p>
      <Button
        type="submit"
        className="
   mt-4 py-3 rounded-xl
    bg-[hsl(var(--background))]
    text-[hsl(var(--foreground))]
    dark:bg-[hsl(var(--foreground))]
    dark:text-[hsl(var(--background))]
    font-semibold text-base shadow-md 
    transition
  "
      >
        Đặt chuyến đi
      </Button>
    </div>
  );
};

export default Connection;
