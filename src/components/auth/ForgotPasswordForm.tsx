import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordSchema } from "./Schema";
import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import EmailField from "./fields/EmailField";
import { forgotPassword } from "@/store/slices/authSlice";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/useRedux";

export default function ForgotPasswordForm() {
  const methods = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const dispatch = useAppDispatch();

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      await dispatch(forgotPassword(data)).unwrap();
      toast("Liên kết khôi phục đã được gửi tới email của bạn", {
        description: undefined,
        style: {
          background: "#ccccc",
          color: "#00000",
        },
      });
      methods.reset();
    } catch {
      toast("Gửi email khôi phục thất bại", {
        description: undefined,
        style: {
          background: "#ccccc",
          color: "#00000",
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="
            max-w-md w-full p-8 rounded-2xl shadow-lg
            border border-[hsl(var(--border))]
            text-[hsl(var(--card-foreground))]
          "
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-[hsl(var(--card-foreground))]">
            Quên mật khẩu
          </h2>
          <EmailField />
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
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting
              ? "Đang gửi..."
              : "Gửi liên kết khôi phục"}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
