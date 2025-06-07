import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordSchema } from "./Schema";
import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import EmailField from "./fields/EmailField";
import { forgotPassword } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/hooks/useRedux";

export default function ForgotPasswordForm() {
  const methods = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const dispatch = useAppDispatch()

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      await dispatch(forgotPassword(data)).unwrap(); 
      toast.success("Liên kết khôi phục đã được gửi tới email của bạn");
      methods.reset(); // Reset lại form
    } catch (error) {
      toast.error((error as string) || "Gửi email khôi phục thất bại");
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="max-w-md mx-auto p-8 mt-20 border border-black rounded-lg shadow-sm"
      >
        <EmailField />
        <Button
          type="submit"
          className="w-full bg-black text-white mt-4"
          disabled={methods.formState.isSubmitting}
        >
          {methods.formState.isSubmitting
            ? "Đang gửi..."
            : "Gửi liên kết khôi phục"}
        </Button>
      </form>
    </FormProvider>
  );
}
