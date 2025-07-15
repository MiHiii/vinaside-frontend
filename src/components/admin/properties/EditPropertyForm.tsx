import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { 
  updateProperty, 
  fetchPropertyById,
  selectPropertyDetail,
  selectPropertiesLoading, 
  selectPropertiesError, 
  clearCreateError,
  uploadPropertyImages,
  assignStaffToProperty
} from "@/store/slices/propertySlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { fetchStaffList, selectStaffList, selectStaffLoading } from "@/store/slices/userSlice";

interface EditPropertyFormData {
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    district: string;
    ward: string;
  };
  contactPhone: string;
  contactEmail: string;
  allowPets: boolean;
  status: string;
  isVerified: boolean;
}

const editPropertySchema = z.object({
  name: z.string().min(1, "Tên property là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  location: z.object({
    address: z.string().min(1, "Địa chỉ là bắt buộc"),
    city: z.string().optional(),
    district: z.string().optional(),
    ward: z.string().optional(),
    lat: z.preprocess((val) => Number(val), z.number().optional()),
    lng: z.preprocess((val) => Number(val), z.number().optional()),
  }),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  allowPets: z.boolean().optional(),
  status: z.string().optional(),
  isVerified: z.boolean().optional(),
});

export default function EditPropertyForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  // Đổi selector property sang propertyDetail
  const property = useAppSelector(selectPropertyDetail);
  const loading = useAppSelector(selectPropertiesLoading);
  const error = useAppSelector(selectPropertiesError);
  const staffOptions = useAppSelector(selectStaffList);
  const staffLoading = useAppSelector(selectStaffLoading);

  const [formData, setFormData] = useState<EditPropertyFormData>({
    name: "",
    description: "",
    location: {
      lat: 0,
      lng: 0,
      address: "",
      city: "",
      district: "",
      ward: "",
    },
    contactPhone: "",
    contactEmail: "",
    allowPets: false,
    status: "pending",
    isVerified: false,
  });

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [staffIds, setStaffIds] = useState<string[]>([]);

  // Load property data khi component mount
  useEffect(() => {
    if (id) {
      dispatch(fetchPropertyById(id));
    }
  }, [dispatch, id]);

  // Update form data khi property được load
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || "",
        description: property.description || "",
        location: {
          lat: property.location?.lat || 0,
          lng: property.location?.lng || 0,
          address: property.location?.address || "",
          city: property.location?.city || "",
          district: property.location?.district || "",
          ward: property.location?.ward || "",
        },
        contactPhone: property.contactPhone || "",
        contactEmail: property.contactEmail || "",
        allowPets: property.allowPets || false,
        status: property.status || "pending",
        isVerified: property.isVerified || false,
      });
    }
  }, [property]);

  useEffect(() => {
    dispatch(fetchStaffList());
  }, [dispatch]);

  // Khi property thay đổi, set staffIds
  useEffect(() => {
    if (property && property.staffIds) {
      setStaffIds(Array.isArray(property.staffIds) ? property.staffIds.map((s: {_id: string} | string) => typeof s === 'string' ? s : s._id) : []);
    }
  }, [property]);

  const handleInputChange = (field: keyof EditPropertyFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field: keyof typeof formData.location, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      toast.error("Không tìm thấy ID property!");
      return;
    }

    // Clear previous errors
    dispatch(clearCreateError());

    // Validate bằng zod
    const resultZod = editPropertySchema.safeParse(formData);
    if (!resultZod.success) {
      const fieldErrors: Record<string, string> = {};
      resultZod.error.errors.forEach(err => {
        if (err.path.length === 1) fieldErrors[err.path[0] as string] = err.message;
        if (err.path.length === 2 && err.path[0] === "location") fieldErrors["location." + err.path[1]] = err.message;
      });
      setErrors(fieldErrors);
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    } else {
      setErrors({});
    }

    try {
      let imageUrls = property?.images || [];
      let thumbnail = property?.thumbnail || "";
      // Nếu có file mới, upload và lấy url mới
      if (newFiles.length > 0) {
        const uploadResult = await dispatch(uploadPropertyImages(newFiles));
        if (uploadPropertyImages.fulfilled.match(uploadResult)) {
          imageUrls = uploadResult.payload || [];
          thumbnail = imageUrls[0] || "";
        } else {
          toast.error("Upload ảnh thất bại!");
          return;
        }
      }
      const result = await dispatch(updateProperty({
        id,
        ...formData,
        images: imageUrls,
        thumbnail
      }));
      
      if (updateProperty.fulfilled.match(result)) {
        toast.success("Cập nhật property thành công!");
        navigate("/admin/properties");
      } else {
        toast.error(result.payload || "Cập nhật property thất bại!");
      }

      // Gửi staffIds nếu thay đổi
      if (id && staffIds[0]) {
        await dispatch(assignStaffToProperty({ id, staffIds }));
      }
    } catch {
      toast.error("Có lỗi xảy ra!");
    }
  };

  if (loading && !property) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Chỉnh sửa Property</CardTitle>
          <p className="text-gray-600">Cập nhật thông tin property</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tên Property */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên Property *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nhập tên property"
              />
              {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Mô tả chi tiết về property"
                rows={4}
              />
              {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
            </div>

            {/* Địa chỉ */}
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ *</Label>
              <Input
                id="address"
                value={formData.location.address}
                onChange={(e) => handleLocationChange("address", e.target.value)}
                placeholder="Địa chỉ đầy đủ"
              />
              {errors["location.address"] && <span className="text-red-500 text-xs">{errors["location.address"]}</span>}
            </div>

            {/* Thành phố, Quận, Phường */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Thành phố</Label>
                <Input
                  id="city"
                  value={formData.location.city}
                  onChange={(e) => handleLocationChange("city", e.target.value)}
                  placeholder="Thành phố"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Quận/Huyện</Label>
                <Input
                  id="district"
                  value={formData.location.district}
                  onChange={(e) => handleLocationChange("district", e.target.value)}
                  placeholder="Quận/Huyện"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ward">Phường/Xã</Label>
                <Input
                  id="ward"
                  value={formData.location.ward}
                  onChange={(e) => handleLocationChange("ward", e.target.value)}
                  placeholder="Phường/Xã"
                />
              </div>
            </div>

            {/* Thông tin liên hệ */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Số điện thoại liên hệ</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  placeholder="Số điện thoại"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email liên hệ</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  placeholder="Email"
                />
              </div>
            </div>

            {/* Cho phép thú cưng */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowPets"
                checked={formData.allowPets}
                onChange={(e) => handleInputChange("allowPets", e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="allowPets">Cho phép thú cưng</Label>
            </div>

            {/* Hiển thị ảnh property */}
            {property && (
              <div className="space-y-2">
                <Label>Ảnh đại diện (thumbnail)</Label>
                {property.thumbnail ? (
                  <img src={property.thumbnail} alt="Thumbnail" className="h-32 rounded object-cover border" />
                ) : (
                  <div className="text-gray-400 italic">Không có ảnh đại diện</div>
                )}
                {property.images && property.images.length > 0 && (
                  <div>
                    <Label>Gallery ảnh</Label>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {property.images.map((url: string, idx: number) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Ảnh ${idx + 1}`}
                          className="h-20 w-28 object-cover rounded border"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Thay ảnh mới */}
            <div className="space-y-2">
              <Label htmlFor="newImages">Chọn ảnh mới (thay thế toàn bộ ảnh cũ)</Label>
              <Input
                id="newImages"
                type="file"
                multiple
                accept="image/*"
                onChange={e => setNewFiles(Array.from(e.target.files || []))}
              />
              {newFiles && newFiles.length > 0 && (
                <p className="text-sm text-gray-600">Đã chọn {newFiles.length} file(s) mới</p>
              )}
            </div>

            {/* Nhân viên được gán */}
            <div className="space-y-2">
              <Label>Nhân viên được gán</Label>
              <select
                value={staffIds[0] || ""}
                onChange={e => setStaffIds([e.target.value])}
                className="border border-gray-300 rounded-md px-3 py-2"
                disabled={staffLoading}
              >
                <option value="">-- Chọn nhân viên --</option>
                {staffOptions.map(staff => (
                  <option key={staff._id} value={staff._id}>
                    {staff.name} {staff.email ? `(${staff.email})` : ""}
                  </option>
                ))}
              </select>
              {staffLoading && <div className="text-xs text-gray-500">Đang tải danh sách nhân viên...</div>}
            </div>

            {/* Error message */}
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {/* Submit button */}
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate("/admin/properties")}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={loading}
              >
                {loading ? "Đang cập nhật..." : "Cập nhật Property"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 