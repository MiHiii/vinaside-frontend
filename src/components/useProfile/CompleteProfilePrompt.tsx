import { Button } from "@/components/ui/button";

export default function CompleteProfilePrompt() {
  return (
    <div className="p-6 rounded-xl  max-w-xs w-full">
      <h3 className="text-lg font-semibold mb-2">Hoàn tất hồ sơ của bạn</h3>
      <p className="text-sm text-gray-600 mb-4">
      Hồ sơ Airbnb là một phần quan trọng của mọi lượt đặt. Hãy hoàn tất hồ sơ để giúp khách và các host khác hiểu hơn về bạn.
      </p>
     <Button
  className="w-[120px] text-lg font-semibold rounded-xl text-white hover:bg-pink-700 h-[46px] "
  style={{ backgroundColor: "#ff385c" }}
>
  Bắt đầu
</Button>
    </div>
  );
}