import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchListingById, updateListing, selectListing, selectListingsLoading, selectCreateListingLoading, uploadListingImages, selectUploadListingImagesLoading } from "@/store/slices/listingSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { Listing } from "@/types/listing";
import { DropzoneUpload } from "@/components/become-a-host/DropzoneUpload";
import { fetchProperties, selectProperties } from "@/store/slices/propertySlice";
import { fetchAmenities, selectAmenities } from "@/store/slices/amenitySlice";
import { Property } from "@/types/property";
import { z } from "zod";

const listingSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  propertyId: z.string().min(1, "Phải chọn bất động sản"),
  price_per_night: z.preprocess(
    (val) => Number(val),
    z.number().gt(100000, "Giá/đêm phải lớn hơn 100.000")
  ),
  max_guests: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Số khách tối đa phải lớn hơn hoặc bằng 1")
  ),
  status: z.string().min(1, "Trạng thái là bắt buộc"),
  cancel_policy: z.string().min(1, "Chính sách hủy là bắt buộc"),
});

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const listing = useAppSelector(selectListing);
  const loading = useAppSelector(selectListingsLoading);
  const updateLoading = useAppSelector(selectCreateListingLoading);
  const uploadImagesLoading = useAppSelector(selectUploadListingImagesLoading);
  const [form, setForm] = useState<Listing | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const properties = useAppSelector(selectProperties);
  const amenities = useAppSelector(selectAmenities);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) dispatch(fetchListingById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (listing) setForm(listing);
  }, [listing]);

  useEffect(() => {
    if (!properties || properties.length === 0) {
      dispatch(fetchProperties({}));
    }
    dispatch(fetchAmenities({ limit: 100 }));
  }, [dispatch, properties]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => {
      if (!prev) return prev;
      if (name === "propertyId") {
        return { ...prev, propertyId: value };
      }
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => prev ? { ...prev, [name]: value } : prev);
  };

  const handleAmenitiesChange = (ids: string[]) => {
    setForm((prev) => prev ? { ...prev, amenities: ids } : prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const data = {
      ...form,
      propertyId: typeof form.propertyId === "object" && form.propertyId !== null ? form.propertyId._id : form.propertyId,
      price_per_night: Number(form.price_per_night),
      max_guests: Number(form.max_guests),
    };
    const resultZod = listingSchema.safeParse(data);
    if (!resultZod.success) {
      const fieldErrors: Record<string, string> = {};
      resultZod.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    } else {
      setErrors({});
    }
    const propertyId = data.propertyId;
    const result = await dispatch(updateListing({ id: form._id, ...form, propertyId }));
    if (updateListing.fulfilled.match(result)) {
      toast.success("Cập nhật listing thành công!");
      navigate("/admin/listings");
    } else {
      toast.error(result.payload || "Cập nhật listing thất bại!");
    }
  };

  if (loading || !form) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <form className="space-y-4 max-w-xl mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-2">Chỉnh sửa Listing</h2>
      <label className="block font-medium">Tiêu đề
        <Input name="title" placeholder="Tiêu đề" value={form.title || ""} onChange={handleChange} />
        {errors.title && <span className="text-red-500 text-xs">{errors.title}</span>}
      </label>
      <label className="block font-medium">Mô tả
        <Textarea name="description" placeholder="Mô tả chi tiết về phòng" value={form.description || ""} onChange={handleTextareaChange} rows={4} />
        {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block font-medium">Số khách
          <Input name="guests" type="number" min={1} value={form.guests || 1} onChange={handleChange} />
          {errors.guests && <span className="text-red-500 text-xs">{errors.guests}</span>}
        </label>
        <label className="block font-medium">Số khách tối đa
          <Input name="max_guests" type="number" min={1} value={form.max_guests || 1} onChange={handleChange} />
          {errors.max_guests && <span className="text-red-500 text-xs">{errors.max_guests}</span>}
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="block font-medium">Số giường
          <Input name="beds" type="number" min={1} value={form.beds || 1} onChange={handleChange} />
          {errors.beds && <span className="text-red-500 text-xs">{errors.beds}</span>}
        </label>
        <label className="block font-medium">Số phòng tắm
          <Input name="bathrooms" type="number" min={1} value={form.bathrooms || 1} onChange={handleChange} />
          {errors.bathrooms && <span className="text-red-500 text-xs">{errors.bathrooms}</span>}
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="block font-medium">Giờ check-in
          <Input name="check_in_time" type="time" value={form.check_in_time || "15:00"} onChange={handleChange} />
        </label>
        <label className="block font-medium">Giờ check-out
          <Input name="check_out_time" type="time" value={form.check_out_time || "11:00"} onChange={handleChange} />
        </label>
      </div>

      <label className="block font-medium">Thuộc bất động sản
        <select
          name="propertyId"
          value={typeof form.propertyId === "object" && form.propertyId !== null ? form.propertyId._id : form.propertyId || ""}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">-- Chọn bất động sản --</option>
          {properties.map((p: Property) => (
            <option key={p._id || p.id} value={p._id}>{p.name}</option>
          ))}
        </select>
        {errors.propertyId && <span className="text-red-500 text-xs">{errors.propertyId}</span>}
      </label>
      <label className="block font-medium">Giá/đêm
        <Input name="price_per_night" type="number" placeholder="Giá/đêm" value={form.price_per_night || 0} onChange={handleChange} min={0} />
        {errors.price_per_night && <span className="text-red-500 text-xs">{errors.price_per_night}</span>}
      </label>
      <label className="block font-medium">Trạng thái
        <select name="status" value={form.status || "draft"} onChange={handleChange} className="border rounded px-3 py-2 w-full">
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
          <option value="draft">Bản nháp</option>
          <option value="pending_approval">Chờ duyệt</option>
          <option value="verified">Đã kiểm duyệt</option>
        </select>
        {errors.status && <span className="text-red-500 text-xs">{errors.status}</span>}
      </label>
      <label className="block font-medium">Chính sách hủy
        <select name="cancel_policy" value={form.cancel_policy || "flexible"} onChange={handleChange} className="border rounded px-3 py-2 w-full">
          <option value="flexible">Linh hoạt</option>
          <option value="moderate">Vừa phải</option>
          <option value="strict">Nghiêm ngặt</option>
        </select>
        {errors.cancel_policy && <span className="text-red-500 text-xs">{errors.cancel_policy}</span>}
      </label>
      <label className="flex items-center gap-2 font-medium">
        <input type="checkbox" name="allow_pets" checked={form.allow_pets || false} onChange={handleChange} />
        Cho phép thú cưng
      </label>
      <label className="block font-medium">Ảnh đại diện
        {form.images && form.images.length > 0 ? (
          <img
            src={form.images[0]}
            alt={form.title}
            style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8, marginTop: 8 }}
          />
        ) : (
          <span className="text-gray-400 block mt-2">Không có ảnh</span>
        )}
        <div className="mt-2">
          <DropzoneUpload images={newImages} setImages={setNewImages} />
          <button
            type="button"
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
            disabled={uploadImagesLoading || newImages.length === 0}
            onClick={async () => {
              if (newImages.length === 0) return;
              const result = await dispatch(uploadListingImages(newImages));
              if (uploadListingImages.fulfilled.match(result)) {
                setForm((prev) => {
                  if (!prev) return prev;
                  return { ...prev, images: result.payload };
                });
                setNewImages([]);
              }
            }}
          >
            {uploadImagesLoading ? "Đang upload..." : "Cập nhật ảnh"}
          </button>
        </div>
      </label>
      <div className="space-y-2">
        <label className="block font-medium">Chọn tiện ích</label>
        <div className="grid grid-cols-2 gap-2">
          {amenities.map((a) => (
            <label key={a._id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={a._id}
                checked={form.amenities?.includes(a._id) || false}
                onChange={e => {
                  if (e.target.checked) {
                    handleAmenitiesChange([...(form.amenities || []), a._id]);
                  } else {
                    handleAmenitiesChange((form.amenities || []).filter(id => id !== a._id));
                  }
                }}
              />
              <span>{a.name}</span>
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={updateLoading}>Cập nhật Listing</Button>
    </form>
  );
} 