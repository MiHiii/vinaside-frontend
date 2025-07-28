import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { createProperty, selectCreatePropertyLoading, selectCreatePropertyError, clearCreateError, uploadPropertyImages, selectUploadImagesLoading, selectUploadImagesError, assignStaffToProperty } from "@/store/slices/propertySlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { fetchStaffList, selectStaffList, selectStaffLoading } from "@/store/slices/userSlice";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

interface CreatePropertyFormData {
  name: string;
  description: string;
  type: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    place_id: string;
    city: string;
    district: string;
    ward: string;
  };
  checkInTime: string;
  checkOutTime: string;
  contactPhone: string;
  contactEmail: string;
  allowPets: boolean;
  thumbnail: string;
  images: string[];
}

// const propertyTypes = [
//   { value: "apartment", label: "Căn hộ" },
//   { value: "mini_apartment", label: "Mini căn hộ" },
//   { value: "homestay", label: "Homestay" },
//   { value: "villa", label: "Villa" },
// ];

const createPropertySchema = z.object({
  name: z.string().min(1, "Tên property là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  type: z.string().min(1, "Loại bất động sản là bắt buộc"),
  location: z.object({
    address: z.string().min(1, "Địa chỉ là bắt buộc"),
    lat: z.preprocess((val) => Number(val), z.number().optional()),
    lng: z.preprocess((val) => Number(val), z.number().optional()),
    place_id: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    ward: z.string().optional(),
  }),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  allowPets: z.boolean().optional(),
  thumbnail: z.string().optional(),
  images: z.array(z.string()).min(1, "Cần upload ít nhất 1 ảnh"),
});

type Suggestion = {
  description: string;
  placeId: string;
  [key: string]: any;
};

export default function CreatePropertyForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector(selectCreatePropertyLoading);
  const error = useAppSelector(selectCreatePropertyError);
  const uploadLoading = useAppSelector(selectUploadImagesLoading);
  const uploadError = useAppSelector(selectUploadImagesError);
  const staffOptions = useAppSelector(selectStaffList);
  const staffLoading = useAppSelector(selectStaffLoading);
  const isGoogleMapsLoaded = useGoogleMaps();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreatePropertyFormData>({
    name: "",
    description: "",
    type: "apartment",
    location: {
      lat: 0,
      lng: 0,
      address: "",
      place_id: "",
      city: "",
      district: "",
      ward: "",
    },
    checkInTime: "14:00",
    checkOutTime: "12:00",
    contactPhone: "",
    contactEmail: "",
    allowPets: false,
    thumbnail: "",
    images: [],
  });

  const [files, setFiles] = useState<File[]>([]);
  const [staffIds, setStaffIds] = useState<string[]>([]);
  const [staffRoles, setStaffRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchStaffList());
  }, [dispatch]);

  const handleInputChange = (field: keyof CreatePropertyFormData, value: string | boolean) => {
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

  const handleUploadImages = async () => {
    if (files.length === 0) return toast.error("Chọn ảnh trước!");
    const uploadResult = await dispatch(uploadPropertyImages(files));
    if (uploadPropertyImages.fulfilled.match(uploadResult)) {
      const urls = uploadResult.payload || [];
      setFormData(prev => ({
        ...prev,
        images: urls,
        thumbnail: urls[0] || ""
      }));
      toast.success("Upload ảnh thành công!");
    } else {
      toast.error(uploadResult.payload || "Upload ảnh thất bại!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearCreateError());
    const resultZod = createPropertySchema.safeParse(formData);
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
      // Không upload ảnh ở đây nữa, chỉ lấy URL đã upload
      const result = await dispatch(createProperty({
        ...formData,
        staffIds,
        images: formData.images,
        thumbnail: formData.images[0] || "",
        location: {
          ...formData.location,
          lat: formData.location.lat,
          lng: formData.location.lng,
        }
      }));
      
      if (createProperty.fulfilled.match(result)) {
        const propertyId = result.payload._id;
        
        // Gán nhân viên với role sau khi tạo property thành công
        if (staffIds.length > 0 && propertyId) {
          try {
            // Gán từng nhân viên với role tương ứng
            for (const staffId of staffIds) {
              const role = staffRoles[staffId] || 'Staff';
              await dispatch(assignStaffToProperty({ 
                id: propertyId, 
                staffIds: [staffId],
                role 
              }));
            }
            toast.success("Tạo property và gán nhân viên thành công!");
          } catch {
            toast.success("Tạo property thành công nhưng gán nhân viên thất bại!");
          }
        } else {
          toast.success("Tạo property thành công!");
        }
        
        navigate("/admin/properties");
      } else {
        toast.error(result.payload || "Tạo property thất bại!");
      }
    } catch  {
      toast.error("Có lỗi xảy ra!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Tạo Property Mới</CardTitle>
          <p className="text-gray-600">Thêm property mới vào hệ thống</p>
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
              <div className="flex gap-2">
                <div className="flex-1">
                  {isGoogleMapsLoaded ? (
                    <PlacesAutocomplete
                    value={formData.location.address}
                    onChange={(address: string) => handleLocationChange("address", address)}
                    // Custom onSelect để lấy cả placeId
                                    onSelect={(_address: string, placeId?: string, suggestion?: Suggestion) => {
                  if (suggestion) {
                    handleLocationChange("address", suggestion.description);
                    handleLocationChange("place_id", suggestion.placeId || "");
                    
                    // Luôn lấy lat/lng từ geocodeByAddress để đảm bảo có tọa độ
                    geocodeByAddress(suggestion.description)
                      .then((results: google.maps.GeocoderResult[]) => getLatLng(results[0]))
                      .then((latLng: {lat: number, lng: number}) => {
                        handleLocationChange("lat", latLng.lat);
                        handleLocationChange("lng", latLng.lng);
                        console.log('Đã lấy tọa độ:', latLng);
                      })
                      .catch((error: unknown) => {
                        console.error('Error getting lat/lng:', error);
                        toast.error("Không thể lấy tọa độ từ địa chỉ!");
                      });
                  } else {
                    handleLocationChange("address", _address);
                    handleLocationChange("place_id", placeId || "");
                  }
                }}
                                    searchOptions={{
                  componentRestrictions: { country: ['vn'] },
                  language: 'vi'
                }}
                  >
                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }: {
                      getInputProps: (options: Record<string, unknown>) => any; // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      suggestions: Suggestion[]; // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      getSuggestionItemProps: (suggestion: Suggestion, options?: any) => any; // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      loading: boolean;
                    }) => (
                      <div>
                        <Input
                          {...getInputProps({
                            placeholder: 'Địa chỉ đầy đủ',
                            className: 'w-full',
                          })}
                        />
                        <div className="autocomplete-dropdown-container bg-white border rounded shadow z-50">
                          {loading && <div>Đang tìm kiếm...</div>}
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {suggestions.map((suggestion: Suggestion) => {
                            const className = suggestion.active
                              ? 'suggestion-item--active bg-blue-100 px-2 py-1 cursor-pointer'
                              : 'suggestion-item px-2 py-1 cursor-pointer';
                            return (
                              <div
                                {...getSuggestionItemProps(suggestion, {
                                  className,
                                  onClick: () => {
                                    handleLocationChange("address", suggestion.description);
                                    handleLocationChange("place_id", suggestion.placeId || "");
                                    
                                    // Luôn lấy lat/lng từ geocodeByAddress để đảm bảo có tọa độ
                                    geocodeByAddress(suggestion.description)
                                      .then((results: google.maps.GeocoderResult[]) => getLatLng(results[0]))
                                      .then((latLng: {lat: number, lng: number}) => {
                                        handleLocationChange("lat", latLng.lat);
                                        handleLocationChange("lng", latLng.lng);
                                        console.log('Đã lấy tọa độ:', latLng);
                                      })
                                      .catch((error: unknown) => {
                                        console.error('Error getting lat/lng:', error);
                                        toast.error("Không thể lấy tọa độ từ địa chỉ!");
                                      });
                                  }
                                })}
                                key={suggestion.placeId}
                              >
                                <span>{suggestion.description}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </PlacesAutocomplete>
                  ) : (
                    <Input
                      placeholder="Đang tải Google Maps..."
                      disabled
                      className="w-full"
                    />
                  )}
                </div>
              </div>
              {errors["location.address"] && <span className="text-red-500 text-xs">{errors["location.address"]}</span>}
            </div>

            {/* Thành phố, Quận, Phường */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Thành phố</Label>
                <PlacesAutocomplete
                  value={formData.location.city}
                  onChange={(city: string) => handleLocationChange("city", city)}
                  onSelect={(city: string) => handleLocationChange("city", city)}
                  searchOptions={{
                    types: ['(cities)'],
                    componentRestrictions: { country: ['vn'] },
                    language: 'vi'
                  }}
                >
                  {({ getInputProps, suggestions, getSuggestionItemProps, loading }: {
                    getInputProps: (options: Record<string, unknown>) => any; // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    suggestions: Suggestion[]; // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    getSuggestionItemProps: (suggestion: Suggestion, options?: any) => any; // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    loading: boolean;
                  }) => (
                    <div>
                      <Input
                        {...getInputProps({
                          placeholder: 'Thành phố',
                          className: 'w-full',
                        })}
                      />
                      <div className="autocomplete-dropdown-container bg-white border rounded shadow z-50">
                        {loading && <div>Đang tìm kiếm...</div>}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {suggestions.map((suggestion: Suggestion) => {
                          const className = suggestion.active
                            ? 'suggestion-item--active bg-blue-100 px-2 py-1 cursor-pointer'
                            : 'suggestion-item px-2 py-1 cursor-pointer';
                          return (
                            <div
                              {...getSuggestionItemProps(suggestion, { className })}
                              key={suggestion.placeId}
                            >
                              <span>{suggestion.description}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </PlacesAutocomplete>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Quận/Huyện</Label>
                <PlacesAutocomplete
                  value={formData.location.district}
                  onChange={(district: string) => handleLocationChange("district", district)}
                  onSelect={(district: string) => handleLocationChange("district", district)}
                  searchOptions={{
                    types: ['geocode'],
                    componentRestrictions: { country: ['vn'] },
                    language: 'vi'
                  }}
                >
                  {({ getInputProps, suggestions, getSuggestionItemProps, loading }: {
                    getInputProps: (options: Record<string, unknown>) => any; // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    suggestions: Suggestion[]; // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    getSuggestionItemProps: (suggestion: Suggestion, options?: any) => any; // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    loading: boolean;
                  }) => (
                    <div>
                      <Input
                        {...getInputProps({
                          placeholder: 'Quận/Huyện',
                          className: 'w-full',
                        })}
                      />
                      <div className="autocomplete-dropdown-container bg-white border rounded shadow z-50">
                        {loading && <div>Đang tìm kiếm...</div>}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {suggestions.map((suggestion: Suggestion) => {
                          const className = suggestion.active
                            ? 'suggestion-item--active bg-blue-100 px-2 py-1 cursor-pointer'
                            : 'suggestion-item px-2 py-1 cursor-pointer';
                          return (
                            <div
                              {...getSuggestionItemProps(suggestion, { className })}
                              key={suggestion.placeId}
                            >
                              <span>{suggestion.description}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </PlacesAutocomplete>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ward">Phường/Xã</Label>
                <PlacesAutocomplete
                  value={formData.location.ward}
                  onChange={(ward: string) => handleLocationChange("ward", ward)}
                  onSelect={(ward: string) => handleLocationChange("ward", ward)}
                  searchOptions={{
                    types: ['geocode'],
                    componentRestrictions: { country: ['vn'] },
                    language: 'vi'
                  }}
                >
                  {({ getInputProps, suggestions, getSuggestionItemProps, loading }: {
                    getInputProps: (options: Record<string, unknown>) => any; // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    suggestions: Suggestion[]; // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    getSuggestionItemProps: (suggestion: Suggestion, options?: any) => any; // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    loading: boolean;
                  }) => (
                    <div>
                      <Input
                        {...getInputProps({
                          placeholder: 'Phường/Xã',
                          className: 'w-full',
                        })}
                      />
                      <div className="autocomplete-dropdown-container bg-white border rounded shadow z-50">
                        {loading && <div>Đang tìm kiếm...</div>}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {suggestions.map((suggestion: Suggestion) => {
                          const className = suggestion.active
                            ? 'suggestion-item--active bg-blue-100 px-2 py-1 cursor-pointer'
                            : 'suggestion-item px-2 py-1 cursor-pointer';
                          return (
                            <div
                              {...getSuggestionItemProps(suggestion, { className })}
                              key={suggestion.placeId}
                            >
                              <span>{suggestion.description}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </PlacesAutocomplete>
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

            {/* Upload Images */}
            <div className="space-y-2">
              <Label htmlFor="images">Chọn ảnh property</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={e => setFiles(Array.from(e.target.files || []))}
              />
              <Button
                type="button"
                onClick={handleUploadImages}
                disabled={uploadLoading || files.length === 0}
                className="mt-2"
              >
                {uploadLoading ? "Đang upload..." : "Upload ảnh"}
              </Button>
              {files && files.length > 0 && (
                <p className="text-sm text-gray-600">Đã chọn {files.length} file(s)</p>
              )}
              {errors.images && <span className="text-red-500 text-xs">{errors.images}</span>}
            </div>

            {/* Uploaded URLs */}
            {formData.images && formData.images.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {formData.images.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Uploaded ${idx + 1}`}
                    className="w-28 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}

            {/* Nhân viên được gán */}
            <div className="space-y-2">
              <Label>Nhân viên được gán</Label>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
                {staffLoading && <div className="text-xs text-gray-500">Đang tải danh sách nhân viên...</div>}
                {staffOptions.length === 0 && !staffLoading && <div className="text-xs text-gray-500">Không có nhân viên nào</div>}
                {staffOptions.map(staff => (
                  <div key={staff._id} className="flex items-center gap-2 p-2 border rounded">
                    <input
                      type="checkbox"
                      value={staff._id}
                      checked={staffIds.includes(staff._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setStaffIds(prev => [...prev, staff._id]);
                          setStaffRoles(prev => ({ ...prev, [staff._id]: 'Staff' }));
                        } else {
                          setStaffIds(prev => prev.filter(id => id !== staff._id));
                          setStaffRoles(prev => {
                            const newRoles = { ...prev };
                            delete newRoles[staff._id];
                            return newRoles;
                          });
                        }
                      }}
                      className="accent-blue-500 h-4 w-4 rounded"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{staff.name}</span>
                      {staff.email && <span className="text-sm text-gray-600 ml-2">({staff.email})</span>}
                    </div>
                    {staffIds.includes(staff._id) && (
                      <Input
                        type="text"
                        placeholder="Role"
                        value={staffRoles[staff._id] || 'Staff'}
                        onChange={(e) => setStaffRoles(prev => ({ ...prev, [staff._id]: e.target.value }))}
                        className="w-24 h-8 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Error message */}
            {(error || uploadError) && (
              <div className="text-red-500 text-sm">{error || uploadError}</div>
            )}

            {/* Submit button */}
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate("/admin/properties")}
                className="flex-1"
                disabled={loading || uploadLoading}
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={loading || uploadLoading}
              >
                {loading || uploadLoading ? "Đang xử lý..." : "Tạo Property"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 