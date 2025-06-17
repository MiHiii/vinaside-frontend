import { useFormContext } from "react-hook-form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { FormMessage } from "@/components/ui/form";

export default function OtpInput() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const otp = watch("otp");

  return (
    <div className="space-y-7 ">
      <InputOTP
        maxLength={8}
        value={otp || ""}
        onChange={(val) => setValue("otp", val)}
      >
        <InputOTPGroup>
          <InputOTPSlot
            index={0}
            className="
   
    border border-[hsl(var(--border))]
    rounded-lg shadow-sm
    bg-[hsl(var(--card))]
    text-[hsl(var(--card-foreground))]
    focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]
    transition
    mx-1
  "
          />
          <InputOTPSlot
            index={1}
            className="
   
   border border-[hsl(var(--border))]
   rounded-lg shadow-sm
   bg-[hsl(var(--card))]
   text-[hsl(var(--card-foreground))]
   focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]
   transition
   mx-1
 "
          />
          <InputOTPSlot
            index={2}
            className="
   
   border border-[hsl(var(--border))]
   rounded-lg shadow-sm
   bg-[hsl(var(--card))]
   text-[hsl(var(--card-foreground))]
   focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]
   transition
   mx-1
 "
          />
          <InputOTPSlot
            index={3}
            className="
   
   border border-[hsl(var(--border))]
   rounded-lg shadow-sm
   bg-[hsl(var(--card))]
   text-[hsl(var(--card-foreground))]
   focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]
   transition
   mx-1
 "
          />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot
            index={4}
            className="
   
   border border-[hsl(var(--border))]
   rounded-lg shadow-sm
   bg-[hsl(var(--card))]
   text-[hsl(var(--card-foreground))]
   focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]
   transition
   mx-1
 "
          />
          <InputOTPSlot
            index={5}
            className="
   
   border border-[hsl(var(--border))]
   rounded-lg shadow-sm
   bg-[hsl(var(--card))]
   text-[hsl(var(--card-foreground))]
   focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]
   transition
   mx-1
 "
          />
          <InputOTPSlot
            index={6}
            className="
   
   border border-[hsl(var(--border))]
   rounded-lg shadow-sm
   bg-[hsl(var(--card))]
   text-[hsl(var(--card-foreground))]
   focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]
   transition
   mx-1
 "
          />
          <InputOTPSlot
            index={7}
            className="
   
   border border-[hsl(var(--border))]
   rounded-lg shadow-sm
   bg-[hsl(var(--card))]
   text-[hsl(var(--card-foreground))]
   focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]
   transition
   mx-1
 "
          />
        </InputOTPGroup>
      </InputOTP>

      {errors.otp && (
        <FormMessage>{errors.otp.message?.toString()}</FormMessage>
      )}
    </div>
  );
}
