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
          <FormLabel>Số điện thoại</FormLabel>
          <FormControl>
            <Input type="tel" placeholder="0901234567" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
