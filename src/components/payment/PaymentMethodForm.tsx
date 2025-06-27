import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock } from "lucide-react";

type PaymentCardFormData = {
  cardNumber: string;
  expiry: string;
  cvv: string;
  postalCode: string;
  country: string;
};

export default function PaymentCardForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentCardFormData>({
    defaultValues: { country: "vietnam" },
  });

  const onSubmit = (data: PaymentCardFormData) => {
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <div>
       
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="max-w-lg mx-auto shadow-lg border border-gray-200 rounded-2xl">
          <CardContent className="p-8">
            {/* Tiêu đề */}
            <h2 className="text-lg font-semibold mb-6">
              1. Thêm phương thức thanh toán
            </h2>

            {/* Phương thức thanh toán */}
            <div className="flex items-center justify-between ">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-full bg-gray-100 p-2">
                  <svg
                    width={22}
                    height={22}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <rect
                      x="2"
                      y="6"
                      width="18"
                      height="10"
                      rx="2"
                      stroke="currentColor"
                    />
                    <path d="M2 10h18" stroke="currentColor" />
                  </svg>
                </span>
                <span className="font-medium">
                  Thẻ tín dụng hoặc thẻ ghi nợ
                </span>
              </div>
              <input
                type="radio"
                checked
                readOnly
                className="accent-black w-5 h-5"
              />
            </div>

            {/* Logo thẻ */}
            <div className="flex items-center gap-2 mb-4 ml-10">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                alt="Visa"
                className="h-2"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                alt="Mastercard"
                className="h-2"
              />
            </div>

            {/* Số thẻ, ngày hết hạn, CVV */}
            <div className="mb-4">
              <div className="border border-gray-300 rounded-t-xl px-4 pt-4 pb-2">
                <Label
                  htmlFor="cardNumber"
                  className="text-gray-600 flex items-center gap-1"
                >
                  Số thẻ
                  <Lock className="inline-block h-4 w-4 text-gray-400" />
                </Label>
                <Input
                  id="cardNumber"
                  {...register("cardNumber", {
                    required: "Vui lòng nhập số thẻ",
                    pattern: {
                      value: /^\d{16}$/,
                      message: "Số thẻ phải đủ 16 chữ số",
                    },
                  })}
                  placeholder="1234 5678 9012 3456"
                  className="border-none px-0 py-1 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                  maxLength={16}
                  inputMode="numeric"
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cardNumber.message}
                  </p>
                )}
              </div>
              <div className="flex border border-t-0 border-gray-300 rounded-b-xl">
                <div className="flex-1 border-r border-gray-300 px-4 py-2">
                  <Label htmlFor="expiry" className="text-gray-600">
                    Ngày hết hạn
                  </Label>
                  <Input
                    id="expiry"
                    {...register("expiry", {
                      required: "Vui lòng nhập ngày hết hạn",
                      pattern: {
                        value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                        message: "Định dạng MM/YY",
                      },
                    })}
                    placeholder="MM/YY"
                    className="border-none px-0 py-1 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                    maxLength={5}
                  />
                  {errors.expiry && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.expiry.message}
                    </p>
                  )}
                </div>
                <div className="flex-1 px-4 py-2">
                  <Label htmlFor="cvv" className="text-gray-600">
                    CVV
                  </Label>
                  <Input
                    id="cvv"
                    {...register("cvv", {
                      required: "Vui lòng nhập CVV",
                      pattern: {
                        value: /^\d{3,4}$/,
                        message: "CVV phải là 3-4 số",
                      },
                    })}
                    placeholder="123"
                    className="border-none px-0 py-1 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                    maxLength={4}
                    inputMode="numeric"
                  />
                  {errors.cvv && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.cvv.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Mã bưu chính */}
            <div className="mb-4">
              <Input
                id="postalCode"
                {...register("postalCode", {
                  required: "Vui lòng nhập mã bưu chính",
                })}
                placeholder="Mã bưu chính"
                className="border border-gray-300 rounded-xl px-4 py-2 text-base"
              />
              {errors.postalCode && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.postalCode.message}
                </p>
              )}
            </div>

            {/* Quốc gia/khu vực */}
            <div className="mb-6">
              <Select
                onValueChange={(value) => setValue("country", value)}
                defaultValue="vietnam"
              >
                <SelectTrigger className=" w-full border border-gray-300 rounded-xl px-4 py-2 text-base">
                  <SelectValue placeholder="Quốc gia/khu vực" />
                </SelectTrigger>
                <SelectContent className="bg-gray-100 ">
                  <SelectItem value="vietnam">Việt Nam</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.country.message}
                </p>
              )}
            </div>

            <div className="w-full h-px bg-gray-200 my-6 rounded" />

            {/* Nút Tiếp theo */}
            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                className="bg-black text-white hover:bg-gray-800 rounded-xl py-2 text-base"
              >
                Tiếp theo
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
      <Card className="max-w-lg mx-auto mt-4 rounded-2xl border border-gray-200">
        <CardContent className="py-6 px-8">
          <span className="font-medium text-base">
            2. Xem lại lượt đặt của bạn
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
