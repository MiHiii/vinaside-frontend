import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterSchema } from "./Schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import NameField from "./fields/NameField";
import EmailField from "./fields/EmailField";
import PasswordField from "./fields/PasswordField";
import PhoneField from "./fields/PhoneField";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { register } from "@/store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const methods = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, verifyEmail } = useAppSelector((state) => state.auth);

  const onSubmit = async (data: RegisterSchema) => {
    await dispatch(register(data));
  };

  useEffect(() => {
    if (verifyEmail) {
      methods.reset({
        name: "",
        email: "",
        password: "",
        phone: "",
      });
      navigate("/verify-otp");
    }
  }, [verifyEmail, methods, navigate]);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <Card
        className="w-full max-w-md mx-auto p-8 rounded-2xl shadow-lg
         text-[hsl(var(--card-foreground))]
          border border-[hsl(var(--border))]
          flex flex-col items-center justify-center min-h-[60vh]
        "
      >
        <CardHeader className="w-full">
          <CardTitle className="text-2xl font-bold mb-2">Đăng ký</CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <NameField />
              <EmailField />
              <PhoneField />
                <PasswordField />
                {error && <div className="text-red-500 text-sm">{error}</div>}
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
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
