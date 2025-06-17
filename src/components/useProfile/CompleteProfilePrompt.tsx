import { Button } from "@/components/ui/button";

export default function CompleteProfilePrompt() {
  return (
    <div className="p-6 rounded-xl  max-w-xs w-full">
      <h3 className="text-lg font-semibold mb-2">Hoàn tất hồ sơ của bạn</h3>
      <p className="text-sm text-gray-600 mb-4">
        Hồ sơ Airbnb là một phần quan trọng của mọi lượt đặt. Hãy hoàn tất hồ sơ
        để giúp khách và các host khác hiểu hơn về bạn.
      </p>
      <Button
        type="submit"
        className="
        w-full mt-4 py-3 rounded-xl
    bg-[hsl(var(--background))]
    text-[hsl(var(--foreground))]
    dark:bg-[hsl(var(--foreground))]
    dark:text-[hsl(var(--background))]
    font-semibold text-base shadow-md 
    transition
  "
      >
        Xác nhận
      </Button>
    </div>
  );
}