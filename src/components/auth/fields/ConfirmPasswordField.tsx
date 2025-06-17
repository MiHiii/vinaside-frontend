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
          <FormLabel>Nhập lại mật khẩu</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                className="
              bg-[hsl(var(--card))]
              border border-[hsl(var(--border))]
              text-[hsl(var(--card-foreground))]
              placeholder:text-[hsl(var(--muted-foreground))]
              rounded-md w-full py-2 px-4
              focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]
              transition
            "
                type={showPassword ? "text" : "password"}
                placeholder="********"
                {...field}
              />
              <button
                type="button"
                onClick={toggleVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
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
