import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateHouseRuleDto } from "@/types/house-rule";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store';
import { uploadIcon, resetUpload } from '@/store/slices/uploadSlice';
import { RootState } from '@/store';

const houseRuleSchema = z.object({
  name: z.string().nonempty("Tên không được để trống").max(255, "Tên không được vượt quá 255 ký tự"),
  description: z.string().max(1000, "Mô tả không được vượt quá 1000 ký tự").optional(),
  is_active: z.boolean().optional(),
  icon_url: z.string().optional(),
});

type HouseRuleFormValues = z.infer<typeof houseRuleSchema>;

interface Props {
  initialValues?: Partial<CreateHouseRuleDto>;
  loading?: boolean;
  onSubmit: (data: CreateHouseRuleDto) => void;
  onClose: () => void;
  isEdit?: boolean;
}

const defaultValues: CreateHouseRuleDto = {
  name: "",
  description: "",
  is_active: true,
};

const HouseRuleFormModal = ({ initialValues, loading, onSubmit, onClose, isEdit }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const uploadState = useSelector((state: RootState) => state.upload);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors }, control, setValue, watch } = useForm<HouseRuleFormValues>({
    resolver: zodResolver(houseRuleSchema),
    defaultValues: initialValues || defaultValues,
  });

  const handleClose = () => {
    dispatch(resetUpload());
    onClose();
  };

  React.useEffect(() => {
    reset(initialValues || defaultValues);
    // Nếu là thêm mới (không có icon_url) thì reset upload
    if (!initialValues || !initialValues.icon_url) {
      dispatch(resetUpload());
    }
  }, [initialValues, reset, dispatch]);

  React.useEffect(() => {
    if (uploadState.url) {
      setValue('icon_url', uploadState.url);
    }
  }, [uploadState.url, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      dispatch(uploadIcon(file));
    }
  };

  const handleFormSubmit = (data: HouseRuleFormValues) => {
    onSubmit({ ...data, is_active: data.is_active ?? true });
  };

  const iconUrl = watch('icon_url');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fadeIn">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-xl font-bold text-gray-800">{isEdit ? "Sửa quy tắc nhà" : "Tạo quy tắc nhà mới"}</h3>
          <button onClick={handleClose} className="p-1 rounded hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên <span className="text-red-500">*</span></label>
            <input {...register("name")} placeholder="Nhập tên" className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea {...register("description")} placeholder="Mô tả (không bắt buộc)" className="border rounded-md px-3 py-2 w-full min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary/50 border-gray-300" />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-3 py-1.5 border border-gray-300 bg-white text-gray-800 rounded hover:border-blue-400 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                Chọn icon...
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              {iconUrl ? (
                <img
                  src={iconUrl}
                  alt="icon"
                  style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6 }}
                />
              ) : (
                <span className="text-gray-400 text-lg">Không có tệp nào được chọn</span>
              )}
            </div>
            {uploadState.loading && <span className="text-xs text-blue-500 ml-2">Đang upload...</span>}
            {uploadState.error && <span className="text-xs text-red-500 ml-2">{uploadState.error}</span>}
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
            <Button type="button" variant="secondary" onClick={handleClose}>Hủy</Button>
            <Button type="submit" disabled={loading} className="font-semibold">
              {isEdit ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HouseRuleFormModal; 