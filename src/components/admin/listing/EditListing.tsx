import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchListingById, updateListing, selectListing, selectListingsLoading, selectCreateListingLoading, uploadListingImages, selectUploadListingImagesLoading } from "@/store/slices/listingSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Listing } from "@/types/listing";
import { DropzoneUpload } from "@/components/become-a-host/DropzoneUpload";
import { fetchProperties, selectProperties } from "@/store/slices/propertySlice";
import { fetchAmenities, selectAmenities } from "@/store/slices/amenitySlice";
import { fetchServices } from '@/store/slices/serviceSlice';
import { fetchSafetyFeatures } from '@/store/slices/safetyFeatureSlice';
import { fetchHouseRules } from '@/store/slices/houseRuleSlice';
import { fetchVouchers } from '@/store/slices/voucherSlice';
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
  const services = useAppSelector((state) => state.service.services);
  const safetyFeatures = useAppSelector((state) => state.safetyFeature.safetyFeatures);
  const houseRules = useAppSelector((state) => state.houseRule.houseRules);
  const vouchers = useAppSelector((state) => state.voucher.vouchers);
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
    dispatch(fetchServices({}));
    dispatch(fetchSafetyFeatures({}));
    dispatch(fetchHouseRules({}));
    dispatch(fetchVouchers({}));
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

  const handleServicesChange = (ids: string[]) => {
    setForm((prev) => prev ? { ...prev, service_ids: ids } : prev);
  };
  const handleSafetyFeaturesChange = (ids: string[]) => {
    setForm((prev) => prev ? { ...prev, safety_features: ids } : prev);
  };
  const handleHouseRulesChange = (ids: string[]) => {
    setForm((prev) => prev ? { ...prev, house_rules_selected: ids } : prev);
  };
  const handleVouchersChange = (ids: string[]) => {
    setForm((prev) => prev ? { ...prev, voucher_ids: ids } : prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const data = {
      ...form,
      propertyId: typeof form.propertyId === "object" && form.propertyId !== null ? form.propertyId._id : form.propertyId,
      price_per_night: Number(form.price_per_night),
      max_guests: Number(form.max_guests),
      voucher_ids: form.voucher_ids, // Thêm voucher_ids vào payload
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
    const result = await dispatch(updateListing({ id: form._id, ...form, propertyId, voucher_ids: form.voucher_ids }));
    if (updateListing.fulfilled.match(result)) {
      toast.success("Cập nhật listing thành công!");
      navigate("/admin/listings");
    } else {
      toast.error(result.payload || "Cập nhật listing thất bại!");
    }
  };

  if (loading || !form) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="min-h-screen  dark:bg-gray-900 p-4">
      <div className="w-full p-4">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Chỉnh sửa Phòng
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">Cập nhật thông tin chi tiết về phòng</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base text-gray-800 dark:text-gray-200">
              Tiêu đề *
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Nhập tiêu đề phòng"
              value={form.title || ""}
              onChange={handleChange}
              className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.title && <span className="text-red-500 text-sm font-medium">{errors.title}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base text-gray-800 dark:text-gray-200">
              Mô tả
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Mô tả chi tiết về phòng"
              value={form.description || ""}
              onChange={handleTextareaChange}
              rows={3}
              className="text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.description && <span className="text-red-500 text-sm font-medium">{errors.description}</span>}
      </div>
      <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guests" className="text-base text-gray-800 dark:text-gray-200">
                Số khách
              </Label>
              <Input
                id="guests"
                name="guests"
                type="number"
                min={1}
                value={form.guests || 1}
                onChange={handleChange}
                className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.guests && <span className="text-red-500 text-sm font-medium">{errors.guests}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_guests" className="text-base text-gray-800 dark:text-gray-200">
                Số khách tối đa *
              </Label>
              <Input
                id="max_guests"
                name="max_guests"
                type="number"
                min={1}
                value={form.max_guests || 1}
                onChange={handleChange}
                className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.max_guests && <span className="text-red-500 text-sm font-medium">{errors.max_guests}</span>}
            </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="beds" className="text-base text-gray-800 dark:text-gray-200">
                Số giường
              </Label>
              <Input
                id="beds"
                name="beds"
                type="number"
                min={1}
                value={form.beds || 1}
                onChange={handleChange}
                className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.beds && <span className="text-red-500 text-sm font-medium">{errors.beds}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms" className="text-base text-gray-800 dark:text-gray-200">
                Số phòng tắm
              </Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min={1}
                value={form.bathrooms || 1}
                onChange={handleChange}
                className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.bathrooms && <span className="text-red-500 text-sm font-medium">{errors.bathrooms}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check_in_time" className="text-base text-gray-800 dark:text-gray-200">
                Giờ check-in
              </Label>
              <Input
                id="check_in_time"
                name="check_in_time"
                type="time"
                value={form.check_in_time || "15:00"}
                onChange={handleChange}
                className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_out_time" className="text-base text-gray-800 dark:text-gray-200">
                Giờ check-out
              </Label>
              <Input
                id="check_out_time"
                name="check_out_time"
                type="time"
                value={form.check_out_time || "11:00"}
                onChange={handleChange}
                className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
      </div>

          <div className="space-y-2">
            <Label htmlFor="propertyId" className="text-base text-gray-800 dark:text-gray-200">
              Thuộc bất động sản *
            </Label>
        <select
              id="propertyId"
          name="propertyId"
          value={typeof form.propertyId === "object" && form.propertyId !== null ? form.propertyId._id : form.propertyId || ""}
          onChange={handleChange}
              className="w-full h-10 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 appearance-none cursor-pointer text-gray-900 dark:text-white"
        >
          <option value="">-- Chọn bất động sản --</option>
          {properties.map((p: Property) => (
            <option key={p._id || p.id} value={p._id}>{p.name}</option>
          ))}
        </select>
            {errors.propertyId && <span className="text-red-500 text-sm font-medium">{errors.propertyId}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price_per_night" className="text-base text-gray-800 dark:text-gray-200">
              Giá/đêm *
            </Label>
            <Input
              id="price_per_night"
              name="price_per_night"
              type="number"
              placeholder="Nhập giá/đêm"
              value={form.price_per_night || 0}
              onChange={handleChange}
              min={0}
              className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.price_per_night && <span className="text-red-500 text-sm font-medium">{errors.price_per_night}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* <div className="space-y-2">
              <Label htmlFor="status" className="text-base text-gray-800 dark:text-gray-200">
                Trạng thái *
              </Label>
              <select
                id="status"
                name="status"
                value={form.status || "draft"}
                onChange={handleChange}
                className="w-full h-10 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 appearance-none cursor-pointer text-gray-900 dark:text-white"
              >
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
          <option value="draft">Bản nháp</option>
          <option value="pending_approval">Chờ duyệt</option>
          <option value="verified">Đã kiểm duyệt</option>
        </select>
              {errors.status && <span className="text-red-500 text-sm font-medium">{errors.status}</span>}
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="cancel_policy" className="text-base text-gray-800 dark:text-gray-200">
                Chính sách hủy *
              </Label>
              <select
                id="cancel_policy"
                name="cancel_policy"
                value={form.cancel_policy || "flexible"}
                onChange={handleChange}
                className="w-full h-10 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 appearance-none cursor-pointer text-gray-900 dark:text-white"
              >
          <option value="flexible">Linh hoạt</option>
          <option value="moderate">Vừa phải</option>
          <option value="strict">Nghiêm ngặt</option>
        </select>
              {errors.cancel_policy && <span className="text-red-500 text-sm font-medium">{errors.cancel_policy}</span>}
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
            <input
              type="checkbox"
              id="allow_pets"
              name="allow_pets"
              checked={form.allow_pets || false}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <Label htmlFor="allow_pets" className="text-base text-gray-800 dark:text-gray-200">
        Cho phép thú cưng
            </Label>
          </div>
          <div className="space-y-3">
        <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <Label className="text-base font-medium text-gray-800 dark:text-gray-200">Chọn tiện ích</Label>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-blue-600 dark:text-blue-400">
            <input
              type="checkbox"
              checked={(form.amenities || []).length === amenities.length && amenities.length > 0}
              onChange={e => {
                if (e.target.checked) {
                  handleAmenitiesChange(amenities.map(a => a._id));
                } else {
                  handleAmenitiesChange([]);
                }
              }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span>Chọn tất cả</span>
          </label>
        </div>
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
          <div className="space-y-3">
        <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <Label className="text-base font-medium text-gray-800 dark:text-gray-200">Chọn dịch vụ</Label>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-green-600 dark:text-green-400">
            <input
              type="checkbox"
              checked={(form.service_ids || []).length === services.length && services.length > 0}
              onChange={e => {
                if (e.target.checked) {
                  handleServicesChange(services.map(s => s._id));
                } else {
                  handleServicesChange([]);
                }
              }}
                  className="w-4 h-4 text-green-600 bg-gray-100 border border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span>Chọn tất cả</span>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {services.map((s) => (
            <label key={s._id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={s._id}
                checked={form.service_ids?.includes(s._id) || false}
                onChange={e => {
                  if (e.target.checked) {
                    handleServicesChange([...(form.service_ids || []), s._id]);
                  } else {
                    handleServicesChange((form.service_ids || []).filter(id => id !== s._id));
                  }
                }}
              />
              <span>{s.name}</span>
            </label>
          ))}
        </div>
      </div>
          <div className="space-y-3">
        <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <Label className="text-base font-medium text-gray-800 dark:text-gray-200">Chọn tính năng an toàn</Label>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-red-600 dark:text-red-400">
            <input
              type="checkbox"
              checked={(form.safety_features || []).length === safetyFeatures.length && safetyFeatures.length > 0}
              onChange={e => {
                if (e.target.checked) {
                  handleSafetyFeaturesChange(safetyFeatures.map(sf => sf._id));
                } else {
                  handleSafetyFeaturesChange([]);
                }
              }}
                  className="w-4 h-4 text-red-600 bg-gray-100 border border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span>Chọn tất cả</span>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {safetyFeatures.map((sf) => (
            <label key={sf._id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={sf._id}
                checked={form.safety_features?.includes(sf._id) || false}
                onChange={e => {
                  if (e.target.checked) {
                    handleSafetyFeaturesChange([...(form.safety_features || []), sf._id]);
                  } else {
                    handleSafetyFeaturesChange((form.safety_features || []).filter(id => id !== sf._id));
                  }
                }}
              />
              <span>{sf.name}</span>
            </label>
          ))}
        </div>
      </div>
          <div className="space-y-3">
        <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <Label className="text-base font-medium text-gray-800 dark:text-gray-200">Chọn nội quy</Label>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-yellow-600 dark:text-yellow-400">
            <input
              type="checkbox"
              checked={(form.house_rules_selected || []).length === houseRules.length && houseRules.length > 0}
              onChange={e => {
                if (e.target.checked) {
                  handleHouseRulesChange(houseRules.map(hr => hr._id));
                } else {
                  handleHouseRulesChange([]);
                }
              }}
                  className="w-4 h-4 text-yellow-600 bg-gray-100 border border-gray-300 rounded focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span>Chọn tất cả</span>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {houseRules.map((hr) => (
            <label key={hr._id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={hr._id}
                checked={form.house_rules_selected?.includes(hr._id) || false}
                onChange={e => {
                  if (e.target.checked) {
                    handleHouseRulesChange([...(form.house_rules_selected || []), hr._id]);
                  } else {
                    handleHouseRulesChange((form.house_rules_selected || []).filter(id => id !== hr._id));
                  }
                }}
              />
              <span>{hr.name}</span>
            </label>
          ))}
        </div>
      </div>
          <div className="space-y-3">
        <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <Label className="text-base font-medium text-gray-800 dark:text-gray-200">Chọn voucher áp dụng</Label>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-purple-600 dark:text-purple-400">
            <input
              type="checkbox"
              checked={(form.voucher_ids || []).length === vouchers.length && vouchers.length > 0}
              onChange={e => {
                if (e.target.checked) {
                  handleVouchersChange(vouchers.map(v => v._id));
                } else {
                  handleVouchersChange([]);
                }
              }}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span>Chọn tất cả</span>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {vouchers.map((v) => (
            <label key={v._id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={v._id}
                checked={form.voucher_ids?.includes(v._id) || false}
                onChange={e => {
                  if (e.target.checked) {
                    handleVouchersChange([...(form.voucher_ids || []), v._id]);
                  } else {
                    handleVouchersChange((form.voucher_ids || []).filter(id => id !== v._id));
                  }
                }}
              />
              <span>{v.code} - {v.discount_percent}%</span>
            </label>
          ))}
        </div>
      </div>
      <label className="block font-medium">Ảnh đại diện
        {form.images && form.images.length > 0 ? (
          <div className="flex gap-2 mt-2 flex-wrap">
            {form.images.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`uploaded-${idx}`}
                style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8 }}
              />
            ))}
          </div>
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
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={updateLoading}
              className="h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-8"
            >
              {updateLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Đang cập nhật...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cập nhật Phòng
                </div>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/listings")}
              className="h-12 text-base border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 rounded-xl px-8"
            >
              Hủy
            </Button>
          </div>
    </form>
      </div>
    </div>
  );
} 