"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import OtpInput from "./fields/OtpField";
import { otpSchema, OtpSchema } from "./Schema";

type Props = {
  onSubmitOtp: (otp: string) => void;
  onResendOtp: () => void;
  isResending: boolean;
};

export default function OtpForm({
  onSubmitOtp,
  onResendOtp,
  isResending,
}: Props) {
  const form = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = (data: OtpSchema) => {
    onSubmitOtp(data.otp);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <OtpInput />
        <Button type="submit" className="w-full bg-black text-white">
          Xác nhận
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full text-sm text-muted-foreground"
          onClick={onResendOtp}
          disabled={isResending}
        >
          {isResending ? "Đang gửi lại..." : "Gửi lại mã"}
        </Button>
      </form>
    </FormProvider>
  );
}
