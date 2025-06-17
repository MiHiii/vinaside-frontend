import React from "react";
import { Button } from "@/components/ui/button"; // Import button từ UI

const PastTrip = () => {
  return (
    <div className="flex flex-col items-center justify-center p-2">
      {" "}
      {/* Dùng Flexbox để căn giữa */}
      <a href="">
        <img
          className="w-80 h-70"
          src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-UserProfile/original/797c1df2-a40c-4d93-9550-ca5b213cd01b.png?im_w=240"
          alt=""
        />
      </a>
      <p className="text-sm mb-6 text-center">
        {" "}
        {/* Căn giữa đoạn văn */}
        Sau khi thực hiện chuyến đi đầu tiên trên Airbnb, bạn <br /> sẽ tìm thấy
        các đặt chỗ trước đây của mình tại đây.
      </p>
      <Button
        type="submit"
        className="
        h-9 mt-4 py-3 rounded-xl
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

export default PastTrip;
