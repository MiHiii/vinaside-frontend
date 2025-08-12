import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function ConfirmPasswordField() {
  const { control } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => setShowPassword((prev) => !prev);

  return (
    <FormField
      control={control}
      name="confirmPassword" // ✅ đúng tên
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[hsl(var(--foreground))] font-medium">
            Xác nhận mật khẩu
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                className="
                bg-[hsl(var(--background))]
                border-2 border-[hsl(var(--border))]
                text-[hsl(var(--foreground))]
                placeholder:text-[hsl(var(--muted-foreground))]
                rounded-lg w-full py-3 px-4 pr-12
                focus:outline-none focus:border-gray-400 focus:!ring-0 focus:!shadow-none
                hover:border-gray-300
                transition-colors duration-200
                !ring-0 !shadow-none !box-shadow-none
              "
                type={showPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu của bạn"
                {...field}
              />
              <button
                type="button"
                onClick={toggleVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
