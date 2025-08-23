import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreateVoucherDto } from "@/types/voucher";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const voucherSchema = z.object({
  code: z.string()
    .nonempty("Mã voucher là bắt buộc")
    .regex(/^[A-Z0-9]+$/, "Mã voucher chỉ được chứa chữ hoa và số, không có khoảng trắng hoặc dấu"),
  discount_percent: z.coerce.number()
    .min(1, "Phần trăm giảm giá phải từ 1% trở lên")
    .max(50, "Phần trăm giảm giá không vượt quá 50%"),
  max_uses: z.coerce.number()
    .min(1, "Số lượt sử dụng tối đa phải từ 1 trở lên"),
  expiration_date: z.string().nonempty("Ngày hết hạn là bắt buộc"),
  description: z.string().optional(),
  min_order_value: z.coerce.number().min(0, "Giá trị đơn hàng tối thiểu không được âm")
  .max(15000000, "Giá trị đơn hàng tối thiểu không vượt quá 15 triệu")
  .optional(),
  applies_to: z.object({ room_ids: z.array(z.string()).optional() }).optional(),
});

type VoucherFormValues = z.infer<typeof voucherSchema>;

interface Props {
  initialValues?: CreateVoucherDto;
  loading?: boolean;
  onSubmit: (data: CreateVoucherDto) => void;
  onClose: () => void;
  isEdit?: boolean;
}

const defaultValues: CreateVoucherDto = {
  code: "",
  discount_percent: 0,
  max_uses: 1,
  expiration_date: "",
  description: "",
  min_order_value: 0,
  applies_to: { room_ids: [] },
};

const VoucherFormModal = ({ initialValues, loading, onSubmit, onClose, isEdit }: Props) => {
  const { register, handleSubmit, reset, formState: { errors }, setError } = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: initialValues || defaultValues,
  });

  const [apiError, setApiError] = React.useState<string | null>(null);

  // Reset form khi initialValues thay đổi
  React.useEffect(() => {
    reset(initialValues || defaultValues);
    setApiError(null);
  }, [initialValues, reset]);

  // Reset lỗi khi đóng modal
  React.useEffect(() => {
    return () => setApiError(null);
  }, []);

  // Reset lỗi khi thay đổi mã voucher
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiError(null);
    register("code").onChange(e);
  };

  // Ép kiểu các trường số về number trước khi submit
  const handleFormSubmit = async (data: VoucherFormValues) => {
    setApiError(null);
    try {
      await onSubmit({
        ...data,
        discount_percent: Number(data.discount_percent),
        max_uses: Number(data.max_uses),
      });
    } catch (err: unknown) {
      let errorMsg = "Có lỗi xảy ra, vui lòng thử lại";
      // Kiểm tra lỗi là object và có statusCode/status 409
      if (
        typeof err === "object" &&
        err !== null &&
        ("statusCode" in err || "status" in err)
      ) {
        const status = (err as Record<string, unknown>)["statusCode"] ?? (err as Record<string, unknown>)["status"];
        if (status === 409) {
          // Lấy error hoặc message, luôn là string
          const errorObj = err as Record<string, unknown>;
          const errorMsg =
            (typeof errorObj.error === "string" && errorObj.error) ||
            (typeof errorObj.message === "string" && errorObj.message) ||
            "Mã voucher đã tồn tại, vui lòng chọn mã khác!";
          setError("code", { type: "manual", message: errorMsg });
          return;
        }
      }
      // fallback: kiểm tra message
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as Record<string, unknown>)["message"] === "string"
      ) {
        errorMsg = (err as { message: string }).message;
      }
      setApiError(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fadeIn">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-xl font-bold text-gray-800">{isEdit ? "Sửa voucher" : "Tạo voucher mới"}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-6 space-y-5">
          {apiError && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm font-medium">
              {apiError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã voucher <span className="text-red-500">*</span></label>
            <input {...register("code")}
              placeholder="Nhập mã voucher"
              className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
              onChange={handleCodeChange}
            />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phần trăm giảm <span className="text-red-500">*</span></label>
              <input type="number" {...register("discount_percent")} placeholder="% giảm" className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.discount_percent ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.discount_percent && <p className="text-xs text-red-500 mt-1">{errors.discount_percent.message}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượt dùng tối đa <span className="text-red-500">*</span></label>
              <input type="number" {...register("max_uses")} placeholder="Tối đa" className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.max_uses ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.max_uses && <p className="text-xs text-red-500 mt-1">{errors.max_uses.message}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị phòng tối thiểu</label>
              <input type="number" {...register("min_order_value")} placeholder="Giá trị tối thiểu (tuỳ chọn)" className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.min_order_value ? 'border-red-500' : 'border-gray-300'}`} min={0} />
              {errors.min_order_value && <p className="text-xs text-red-500 mt-1">{errors.min_order_value.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hạn sử dụng <span className="text-red-500">*</span></label>
            <input type="date" {...register("expiration_date")} className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.expiration_date ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.expiration_date && <p className="text-xs text-red-500 mt-1">{errors.expiration_date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea {...register("description")} placeholder="Mô tả voucher (không bắt buộc)" className="border rounded-md px-3 py-2 w-full min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary/50 border-gray-300" />
          </div>
          {/* Có thể bổ sung chọn phòng áp dụng nếu cần */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={loading} className="font-semibold">
              {isEdit ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoucherFormModal; 