import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateSafetyFeatureDto } from "@/types/safety-feature";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const safetyFeatureSchema = z.object({
  name: z.string().nonempty("Tên chính sách an toàn không được để trống").max(255, "Tên chính sách an toàn không được vượt quá 255 ký tự"),
  description: z.string().max(1000, "Mô tả không được vượt quá 1000 ký tự").optional(),
  is_active: z.boolean().optional(),
});

type SafetyFeatureFormValues = z.infer<typeof safetyFeatureSchema>;

interface Props {
  initialValues?: Partial<CreateSafetyFeatureDto>;
  loading?: boolean;
  onSubmit: (data: CreateSafetyFeatureDto) => void;
  onClose: () => void;
  isEdit?: boolean;
}

const defaultValues: CreateSafetyFeatureDto = {
  name: "",
  description: "",
  is_active: true,
};

const SafetyFeatureFormModal = ({ initialValues, loading, onSubmit, onClose, isEdit }: Props) => {
  const { register, handleSubmit, reset, formState: { errors }, control } = useForm<SafetyFeatureFormValues>({
    resolver: zodResolver(safetyFeatureSchema),
    defaultValues: initialValues || defaultValues,
  });

  React.useEffect(() => {
    reset(initialValues || defaultValues);
  }, [initialValues, reset]);

  const handleFormSubmit = (data: SafetyFeatureFormValues) => {
    onSubmit({ ...data, is_active: data.is_active ?? true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fadeIn">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-xl font-bold text-gray-800">{isEdit ? "Sửa chính sách an toàn" : "Tạo chính sách an toàn mới"}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên chính sách an toàn<span className="text-red-500">*</span></label>
            <input {...register("name")} placeholder="Nhập tên" className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea {...register("description")} placeholder="Mô tả (không bắt buộc)" className="border rounded-md px-3 py-2 w-full min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary/50 border-gray-300" />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>
          <div className="flex items-center gap-4">
            <Controller
              name="is_active"
              control={control}
              defaultValue={true}
              render={({ field }) => (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={e => field.onChange(e.target.checked)}
                    className="accent-primary w-5 h-5"
                  />
                  Đang hoạt động
                </label>
              )}
            />
          </div>
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

export default SafetyFeatureFormModal; 