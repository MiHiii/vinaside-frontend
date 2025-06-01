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
    <div className="space-y-7 ml-10">
      <InputOTP
        maxLength={6}
        value={otp || ""}
        onChange={(val) => setValue("otp", val)}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      {errors.otp && (
        <FormMessage>{errors.otp.message?.toString()}</FormMessage>
      )}
    </div>
  );
}
