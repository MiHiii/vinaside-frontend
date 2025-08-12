import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function EmailField() {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[hsl(var(--foreground))] font-medium">
            Email
          </FormLabel>
          <FormControl>
            <Input
              type="email"
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
              placeholder="Nhập email của bạn"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
