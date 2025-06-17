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
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input
              type="email"
              className="
              bg-[hsl(var(--card))]
              border border-[hsl(var(--border))]
              text-[hsl(var(--card-foreground))]
              placeholder:text-[hsl(var(--muted-foreground))]
              rounded-md w-full py-2 px-4
              focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]
              transition
            "
              placeholder="Email"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
