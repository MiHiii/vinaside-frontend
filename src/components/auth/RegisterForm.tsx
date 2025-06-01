import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterSchema } from "./Schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import NameField from "./fields/NameField";
import EmailField from "./fields/EmailField";
import PasswordField from "./fields/PasswordField";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { register } from "@/store/slices/authSlice";
import ConfirmPasswordField from "./fields/ConfirmPasswordField";
import PhoneField from "./fields/PhoneField";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const methods = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      confirmPassword: "",
    },
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((state) => state.auth);
  const onSubmit = async (data: RegisterSchema) => {
    await dispatch(register(data));
  };

  useEffect(() => {
    console.log("User:", user);
    if (user) {
      methods.reset({
        name: "",
        email: "",
        password: "",
        phone: "",
        confirmPassword: "",
      });
      navigate("/verify-otp");
    }
  }, [user, methods, navigate]);

  return (
    <Card className="max-w-md mx-auto p-6 mt-22 bg-[hsl(var(--background))] text-[hsl(var(--foreground))] ">
      <CardHeader>
        <CardTitle>Đăng ký</CardTitle>
      </CardHeader>
      <CardContent className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <NameField />
            <EmailField />
            <PhoneField />
            <PasswordField />
            <ConfirmPasswordField />

            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button
              type="submit"
              className="w-full bg-black text-white"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
