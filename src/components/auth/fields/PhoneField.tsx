import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function PhoneField() {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="phone"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[hsl(var(--foreground))] font-medium">
            Số điện thoại
          </FormLabel>
          <FormControl>
            <Input
              type="tel"
              placeholder="Nhập số điện thoại của bạn"
              className="
              bg-[hsl(var(--background))]
              border-2 border-[hsl(var(--border))]
              text-[hsl(var(--foreground))]
              placeholder:text-[hsl(var(--muted-foreground))]
              rounded-lg w-full py-3 px-4
              focus:outline-none focus:border-gray-400 focus:!ring-0 focus:!shadow-none
              hover:border-gray-300
              transition-colors duration-200
              !ring-0 !shadow-none !box-shadow-none
            "
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
