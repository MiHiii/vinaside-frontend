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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

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

const statusOptions = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
  { value: "draft", label: "Bản nháp" },
  { value: "pending_approval", label: "Chờ duyệt" },
  { value: "verified", label: "Đã kiểm duyệt" },
];

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
    status: "draft",
    images: [],
    amenities: [],
    service_ids: [],
    safety_features: [],
    house_rules_selected: [],
    voucher_ids: [],
  });
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
          status: "draft",
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Admin - Thêm phòng mới</CardTitle>
          <p className="text-gray-600">Tạo phòng mới và gán cho host</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Chọn Property */}
            <div className="space-y-2">
              <Label htmlFor="property_id">Chọn Property *</Label>
              <Select value={formData.property_id} onValueChange={(value) => handleInputChange("property_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn property cho phòng này" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50">
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
              {errors.property_id && <span className="text-red-500 text-xs">{errors.property_id}</span>}
            </div>

            {/* Tiêu đề */}
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Nhập tiêu đề phòng"
              />
              {errors.title && <span className="text-red-500 text-xs">{errors.title}</span>}
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Mô tả chi tiết về phòng"
                rows={4}
              />
              {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
            </div>

            {/* Giá */}
            <div className="space-y-2">
              <Label htmlFor="price">Giá mỗi đêm (VNĐ) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price_per_night}
                onChange={(e) => handleInputChange("price_per_night", Number(e.target.value))}
                placeholder="0"
                min="0"
              />
              {errors.price_per_night && <span className="text-red-500 text-xs">{errors.price_per_night}</span>}
            </div>

            {/* Số khách */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guests">Số khách *</Label>
                <Input
                  id="guests"
                  type="number"
                  value={formData.guests}
                  onChange={(e) => handleInputChange("guests", Number(e.target.value))}
                  min="1"
                />
                {errors.guests && <span className="text-red-500 text-xs">{errors.guests}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_guests">Số khách tối đa *</Label>
                <Input
                  id="max_guests"
                  type="number"
                  value={formData.max_guests}
                  onChange={(e) => handleInputChange("max_guests", Number(e.target.value))}
                  min="1"
                />
                {errors.max_guests && <span className="text-red-500 text-xs">{errors.max_guests}</span>}
              </div>
            </div>

            {/* Giường và phòng tắm */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="beds">Số giường *</Label>
                <Input
                  id="beds"
                  type="number"
                  value={formData.beds}
                  onChange={(e) => handleInputChange("beds", Number(e.target.value))}
                  min="1"
                />
                {errors.beds && <span className="text-red-500 text-xs">{errors.beds}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Số phòng tắm *</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange("bathrooms", Number(e.target.value))}
                  min="1"
                />
                {errors.bathrooms && <span className="text-red-500 text-xs">{errors.bathrooms}</span>}
              </div>
            </div>

            {/* Thời gian check-in/out */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="check_in_time">Giờ check-in</Label>
                <Input
                  id="check_in_time"
                  type="time"
                  value={formData.check_in_time}
                  onChange={(e) => handleInputChange("check_in_time", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_out_time">Giờ check-out</Label>
                <Input
                  id="check_out_time"
                  type="time"
                  value={formData.check_out_time}
                  onChange={(e) => handleInputChange("check_out_time", e.target.value)}
                />
              </div>
            </div>

            {/* Chính sách hủy */}
            <div className="space-y-2">
              <Label htmlFor="cancel_policy">Chính sách hủy</Label>
              <Select value={formData.cancel_policy} onValueChange={(value) => handleInputChange("cancel_policy", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chính sách hủy" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50">
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
              {errors.cancel_policy && <span className="text-red-500 text-xs">{errors.cancel_policy}</span>}
            </div>

            {/* Trạng thái */}
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái *</Label>
              <Select value={formData.status} onValueChange={value => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50">
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
              {errors.status && <span className="text-red-500 text-xs">{errors.status}</span>}
            </div>

            {/* Chọn Amenities */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Chọn tiện ích</Label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
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
                      checked={formData.amenities.includes(a._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, amenities: [...prev.amenities, a._id] }));
                        } else {
                          setFormData(prev => ({ ...prev, amenities: prev.amenities.filter(id => id !== a._id) }));
                        }
                      }}
                    />
                    <span>{a.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chọn Dịch vụ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Chọn dịch vụ</Label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
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
                      checked={formData.service_ids.includes(s._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, service_ids: [...prev.service_ids, s._id] }));
                        } else {
                          setFormData(prev => ({ ...prev, service_ids: prev.service_ids.filter(id => id !== s._id) }));
                        }
                      }}
                    />
                    <span>{s.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chọn Tính năng an toàn */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Chọn tính năng an toàn</Label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
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
                      checked={formData.safety_features.includes(sf._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, safety_features: [...prev.safety_features, sf._id] }));
                        } else {
                          setFormData(prev => ({ ...prev, safety_features: prev.safety_features.filter(id => id !== sf._id) }));
                        }
                      }}
                    />
                    <span>{sf.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chọn Nội quy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Chọn nội quy</Label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
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
                      checked={formData.house_rules_selected.includes(hr._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, house_rules_selected: [...prev.house_rules_selected, hr._id] }));
                        } else {
                          setFormData(prev => ({ ...prev, house_rules_selected: prev.house_rules_selected.filter(id => id !== hr._id) }));
                        }
                      }}
                    />
                    <span>{hr.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chọn Voucher */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Chọn voucher áp dụng</Label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
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
                      checked={formData.voucher_ids.includes(v._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, voucher_ids: [...prev.voucher_ids, v._id] }));
                        } else {
                          setFormData(prev => ({ ...prev, voucher_ids: prev.voucher_ids.filter(id => id !== v._id) }));
                        }
                      }}
                    />
                    <span>{v.code} - {v.discount_percent}%</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {/* Submit button */}


            <Button type="button" onClick={handleUpload} disabled={uploadLoading}>
              {uploadLoading ? "Đang upload..." : "Upload ảnh"}
            </Button>

            {formData.images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {formData.images.map((url, idx) => (
                  <img key={idx} src={url} alt="uploaded" style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 4 }} />
                ))}
              </div>
            )}
            {errors.images && <span className="text-red-500 text-xs">{errors.images}</span>}

            <input type="file" multiple onChange={handleFileChange} />

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate("/admin/listings")}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={createLoading}
              >
                {createLoading ? "Đang tạo..." : "Tạo phòng"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 