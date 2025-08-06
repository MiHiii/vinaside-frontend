import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { createListing, selectCreateListingLoading, selectCreateListingError, clearCreateError, uploadListingImages, selectUploadListingImagesLoading } from "@/store/slices/listingSlice";
import { fetchProperties, selectProperties } from "@/store/slices/propertySlice";
import { fetchAmenities, selectAmenities } from "@/store/slices/amenitySlice";
import { fetchServices } from '@/store/slices/serviceSlice';
import { fetchSafetyFeatures } from '@/store/slices/safetyFeatureSlice';
import { fetchHouseRules } from '@/store/slices/houseRuleSlice';
import { fetchVouchers } from '@/store/slices/voucherSlice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { ListingStatus } from "@/types/enum";

interface CreateListingFormData {
  title: string;
  description: string;
  address: string;
  price_per_night: number;
  property_type: string;
  guests: number;
  max_guests: number;
  allow_infants: boolean;
  max_infants: number;
  beds: number;
  bathrooms: number;
  check_in_time: string;
  check_out_time: string;
  cancel_policy: string;
  allow_pets: boolean;
  property_id: string; // Thay đổi từ host_id
  status: string;
  images: string[];
  amenities: string[];
  service_ids: string[];         // dịch vụ
  safety_features: string[];     // tính năng an toàn
  house_rules_selected: string[];// nội quy
  voucher_ids: string[];         // voucher áp dụng
}

// Status options using ListingStatus enum
// const statusOptions = [
//   { value: ListingStatus.ACTIVE, label: "Hoạt động" },
//   { value: ListingStatus.INACTIVE, label: "Không hoạt động" },
// ];

const cancelPolicies = [
  { value: "flexible", label: "Linh hoạt" },
  { value: "moderate", label: "Vừa phải" },
  { value: "strict", label: "Nghiêm ngặt" },
];

const createListingSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  property_id: z.string().min(1, "Phải chọn property"),
  price_per_night: z.preprocess(
    (val) => Number(val),
    z.number().gt(100000, "Giá/đêm phải lớn hơn 100.000")
  ),
  guests: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Số khách phải lớn hơn hoặc bằng 1")
  ),
  max_guests: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Số khách tối đa phải lớn hơn hoặc bằng 1")
  ),
  beds: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Số giường phải lớn hơn hoặc bằng 1")
  ),
  bathrooms: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Số phòng tắm phải lớn hơn hoặc bằng 1")
  ),
  cancel_policy: z.string().min(1, "Chính sách hủy là bắt buộc"),
  status: z.string().min(1, "Trạng thái là bắt buộc"),
  images: z.array(z.string()).min(1, "Cần upload ít nhất 1 ảnh"),
  amenities: z.array(z.string()).min(1, "Cần chọn ít nhất 1 tiện ích"),
});

export default function CreateListing() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const createLoading = useAppSelector(selectCreateListingLoading);
  const error = useAppSelector(selectCreateListingError);
  const properties = useAppSelector(selectProperties);
  const amenities = useAppSelector(selectAmenities);
  const uploadLoading = useAppSelector(selectUploadListingImagesLoading);

  const [formData, setFormData] = useState<CreateListingFormData>({
    title: "",
    description: "",
    address: "",
    price_per_night: 0,
    property_type: "",
    guests: 1,
    max_guests: 1,
    allow_infants: false,
    max_infants: 0,
    beds: 1,
    bathrooms: 1,
    check_in_time: "15:00",
    check_out_time: "11:00",
    cancel_policy: "flexible",
    allow_pets: false,
    property_id: "",
    status: ListingStatus.ACTIVE,
    images: [],
    amenities: [],
    service_ids: [],
    safety_features: [],
    house_rules_selected: [],
    voucher_ids: [],
  });
  
  console.log("Initial formData status:", formData.status);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. Thêm các trường vào formData
  const services = useAppSelector((state) => state.service.services);
  const safetyFeatures = useAppSelector((state) => state.safetyFeature.safetyFeatures);
  const houseRules = useAppSelector((state) => state.houseRule.houseRules);
  const vouchers = useAppSelector((state) => state.voucher.vouchers);

  // 2. Fetch danh sách dịch vụ, tính năng an toàn, nội quy, voucher
  useEffect(() => {
    dispatch(fetchProperties({ limit: 100 }));
    dispatch(fetchAmenities({ limit: 100 }));
    dispatch(fetchServices({}));
    dispatch(fetchSafetyFeatures({}));
    dispatch(fetchHouseRules({}));
    dispatch(fetchVouchers({}));
  }, [dispatch]);

  const handleInputChange = (field: keyof CreateListingFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return toast.error("Chọn ảnh trước!");
    const result = await dispatch(uploadListingImages(files));
    if (uploadListingImages.fulfilled.match(result)) {
      setFormData(prev => ({ ...prev, images: result.payload }));
      toast.success("Upload ảnh thành công!");
    } else {
      toast.error(result.payload || "Upload ảnh thất bại!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearCreateError());
    
    console.log("Current formData status:", formData.status);
    console.log("ListingStatus.ACTIVE value:", ListingStatus.ACTIVE);
    
    const resultZod = createListingSchema.safeParse(formData);
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

    console.log("formData submit:", formData);

    try {
      const { property_id, ...rest } = formData;
      const listingData = {
        ...rest,
        propertyId: property_id,
        status: formData.status, // Đảm bảo status được include
        location: {
          type: "Point",
          coordinates: [0, 0], // Sẽ thêm sau khi có map
        },
        amenities: formData.amenities,
        house_rules_selected: formData.house_rules_selected, // Sẽ thêm sau
        safety_features: formData.safety_features, // Sẽ thêm sau
        other_rules: [], // Sẽ thêm sau
        voucher_ids: formData.voucher_ids, // Thêm voucher_ids vào payload
      };

      console.log("listingData being sent:", listingData);
      console.log("Status being sent:", listingData.status);

      const result = await dispatch(createListing(listingData));
      
      if (createListing.fulfilled.match(result)) {
        toast.success("Tạo phòng thành công!");
        navigate("/admin/listings");
        setFormData({
          title: "",
          description: "",
          address: "",
          price_per_night: 0,
          property_type: "",
          guests: 1,
          max_guests: 1,
          allow_infants: false,
          max_infants: 0,
          beds: 1,
          bathrooms: 1,
          check_in_time: "15:00",
          check_out_time: "11:00",
          cancel_policy: "flexible",
          allow_pets: false,
          property_id: "",
          status: ListingStatus.ACTIVE,
          images: [],
          amenities: [],
          service_ids: [],
          safety_features: [],
          house_rules_selected: [],
          voucher_ids: [],
        });
        setFiles([]);
      } else {
        toast.error(result.payload || "Tạo phòng thất bại!");
      }
    } catch {
      toast.error("Có lỗi xảy ra!");
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 p-4">
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
                  Tạo Phòng Mới
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">Tạo phòng mới và gán cho host</p>
              </div>
            </div>
          </div>
            {/* Chọn Property */}
            <div className="space-y-2">
              <Label htmlFor="property_id" className="text-base text-gray-800 dark:text-gray-200">Chọn Property *</Label>
              <Select value={formData.property_id} onValueChange={(value) => handleInputChange("property_id", value)}>
                <SelectTrigger className="w-full h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Chọn homestay cho phòng này" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50 dark:bg-gray-700">
                  {properties.map((property) => (
                    <SelectItem
                      key={property.id}
                      value={property.id}
                      className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                    >
                      {property.name} ({property.location?.address || ""})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.property_id && <span className="text-red-500 text-sm font-medium">{errors.property_id}</span>}
            </div>

            {/* Tiêu đề */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base text-gray-800 dark:text-gray-200">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Nhập tiêu đề phòng"
                className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.title && <span className="text-red-500 text-sm font-medium">{errors.title}</span>}
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base text-gray-800 dark:text-gray-200">Mô tả *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Mô tả chi tiết về phòng"
                rows={3}
                className="text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.description && <span className="text-red-500 text-sm font-medium">{errors.description}</span>}
            </div>

            {/* Giá */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-base text-gray-800 dark:text-gray-200">Giá mỗi đêm (VNĐ) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price_per_night}
                onChange={(e) => handleInputChange("price_per_night", Number(e.target.value))}
                placeholder="0"
                min="0"
                className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.price_per_night && <span className="text-red-500 text-sm font-medium">{errors.price_per_night}</span>}
            </div>

            {/* Số khách */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guests" className="text-base text-gray-800 dark:text-gray-200">Số khách *</Label>
                <Input
                  id="guests"
                  type="number"
                  value={formData.guests}
                  onChange={(e) => handleInputChange("guests", Number(e.target.value))}
                  min="1"
                  className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.guests && <span className="text-red-500 text-sm font-medium">{errors.guests}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_guests" className="text-base text-gray-800 dark:text-gray-200">Số khách tối đa *</Label>
                <Input
                  id="max_guests"
                  type="number"
                  value={formData.max_guests}
                  onChange={(e) => handleInputChange("max_guests", Number(e.target.value))}
                  min="1"
                  className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.max_guests && <span className="text-red-500 text-sm font-medium">{errors.max_guests}</span>}
              </div>
            </div>

            {/* Giường và phòng tắm */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="beds" className="text-base text-gray-800 dark:text-gray-200">Số giường *</Label>
                <Input
                  id="beds"
                  type="number"
                  value={formData.beds}
                  onChange={(e) => handleInputChange("beds", Number(e.target.value))}
                  min="1"
                  className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.beds && <span className="text-red-500 text-sm font-medium">{errors.beds}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms" className="text-base text-gray-800 dark:text-gray-200">Số phòng tắm *</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange("bathrooms", Number(e.target.value))}
                  min="1"
                  className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.bathrooms && <span className="text-red-500 text-sm font-medium">{errors.bathrooms}</span>}
              </div>
            </div>

            {/* Thời gian check-in/out */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="check_in_time" className="text-base text-gray-800 dark:text-gray-200">Giờ check-in</Label>
                <Input
                  id="check_in_time"
                  type="time"
                  value={formData.check_in_time}
                  onChange={(e) => handleInputChange("check_in_time", e.target.value)}
                  className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_out_time" className="text-base text-gray-800 dark:text-gray-200">Giờ check-out</Label>
                <Input
                  id="check_out_time"
                  type="time"
                  value={formData.check_out_time}
                  onChange={(e) => handleInputChange("check_out_time", e.target.value)}
                  className="h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Chính sách hủy */}
            <div className="space-y-2">
              <Label htmlFor="cancel_policy" className="text-base text-gray-800 dark:text-gray-200">Chính sách hủy</Label>
              <Select value={formData.cancel_policy} onValueChange={(value) => handleInputChange("cancel_policy", value)}>
                <SelectTrigger className="w-full h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Chọn chính sách hủy" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50 dark:bg-gray-700">
                  {cancelPolicies.map((policy) => (
                    <SelectItem
                      key={policy.value}
                      value={policy.value}
                      className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                    >
                      {policy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cancel_policy && <span className="text-red-500 text-sm font-medium">{errors.cancel_policy}</span>}
            </div>

            {/* Trạng thái */}
            {/* <div className="space-y-2">
              <Label htmlFor="status" className="text-base text-gray-800 dark:text-gray-200">Trạng thái *</Label>
              <Select value={formData.status} onValueChange={value => handleInputChange("status", value)}>
                <SelectTrigger className="w-full h-10 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50 dark:bg-gray-700">
                  {statusOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <span className="text-red-500 text-sm font-medium">{errors.status}</span>}
            </div> */}

            {/* Chọn Amenities */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <Label className="text-base text-gray-800 dark:text-gray-200">Chọn tiện ích</Label>
              </div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.amenities.length === amenities.length && amenities.length > 0}
                    onChange={e => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, amenities: amenities.map(a => a._id) }));
                      } else {
                        setFormData(prev => ({ ...prev, amenities: [] }));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span>Chọn tất cả</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {amenities.map((a) => (
                  <label key={a._id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <input
                      type="checkbox"
                      value={a._id}
                      checked={formData.amenities.includes(a._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, amenities: [...prev.amenities, a._id] }));
                        } else {
                          setFormData(prev => ({ ...prev, amenities: prev.amenities.filter(id => id !== a._id) }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{a.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chọn Dịch vụ */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <Label className="text-base text-gray-800 dark:text-gray-200">Chọn dịch vụ</Label>
              </div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.service_ids.length === services.length && services.length > 0}
                    onChange={e => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, service_ids: services.map(s => s._id) }));
                      } else {
                        setFormData(prev => ({ ...prev, service_ids: [] }));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span>Chọn tất cả</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {services.map((s) => (
                  <label key={s._id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <input
                      type="checkbox"
                      value={s._id}
                      checked={formData.service_ids.includes(s._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, service_ids: [...prev.service_ids, s._id] }));
                        } else {
                          setFormData(prev => ({ ...prev, service_ids: prev.service_ids.filter(id => id !== s._id) }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chọn Tính năng an toàn */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <Label className="text-base text-gray-800 dark:text-gray-200">Chọn tính năng an toàn</Label>
              </div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.safety_features.length === safetyFeatures.length && safetyFeatures.length > 0}
                    onChange={e => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, safety_features: safetyFeatures.map(sf => sf._id) }));
                      } else {
                        setFormData(prev => ({ ...prev, safety_features: [] }));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span>Chọn tất cả</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {safetyFeatures.map((sf) => (
                  <label key={sf._id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <input
                      type="checkbox"
                      value={sf._id}
                      checked={formData.safety_features.includes(sf._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, safety_features: [...prev.safety_features, sf._id] }));
                        } else {
                          setFormData(prev => ({ ...prev, safety_features: prev.safety_features.filter(id => id !== sf._id) }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{sf.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chọn Nội quy */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <Label className="text-base text-gray-800 dark:text-gray-200">Chọn nội quy</Label>
              </div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.house_rules_selected.length === houseRules.length && houseRules.length > 0}
                    onChange={e => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, house_rules_selected: houseRules.map(hr => hr._id) }));
                      } else {
                        setFormData(prev => ({ ...prev, house_rules_selected: [] }));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span>Chọn tất cả</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {houseRules.map((hr) => (
                  <label key={hr._id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <input
                      type="checkbox"
                      value={hr._id}
                      checked={formData.house_rules_selected.includes(hr._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, house_rules_selected: [...prev.house_rules_selected, hr._id] }));
                        } else {
                          setFormData(prev => ({ ...prev, house_rules_selected: prev.house_rules_selected.filter(id => id !== hr._id) }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{hr.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chọn Voucher */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <Label className="text-base text-gray-800 dark:text-gray-200">Chọn voucher áp dụng</Label>
              </div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.voucher_ids.length === vouchers.length && vouchers.length > 0}
                    onChange={e => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, voucher_ids: vouchers.map(v => v._id) }));
                      } else {
                        setFormData(prev => ({ ...prev, voucher_ids: [] }));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span>Chọn tất cả</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {vouchers.map((v) => (
                  <label key={v._id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <input
                      type="checkbox"
                      value={v._id}
                      checked={formData.voucher_ids.includes(v._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, voucher_ids: [...prev.voucher_ids, v._id] }));
                        } else {
                          setFormData(prev => ({ ...prev, voucher_ids: prev.voucher_ids.filter(id => id !== v._id) }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{v.code} - {v.discount_percent}%</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Upload ảnh */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <Label className="text-base text-gray-800 dark:text-gray-200">Upload ảnh</Label>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600 border-dashed">
                <div className="text-center">
                  <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">Kéo thả ảnh vào đây hoặc click để chọn</p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition-colors duration-200">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Chọn ảnh
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-700 dark:text-green-300 font-medium">
                        Đã chọn {files.length} file(s)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                type="button" 
                onClick={handleUpload} 
                disabled={uploadLoading}
                className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
              >
                {uploadLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang upload...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload ảnh
                  </>
                )}
              </Button>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {formData.images.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={url} 
                        alt="uploaded" 
                        className="h-20 w-full object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1 py-0.5 rounded">
                        {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.images && <span className="text-red-500 text-sm font-medium">{errors.images}</span>}
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-700 dark:text-red-300 font-medium">{error}</span>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate("/admin/listings")}
                className="flex-1 h-12 text-base font-semibold border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hủy
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={createLoading}
              >
                {createLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Tạo Phòng
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
   
  );
} 