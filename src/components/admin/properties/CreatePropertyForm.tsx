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
  [key: string]: unknown;
};

// Type cho PlacesAutocomplete props
type PlacesAutocompleteRenderProps = {
  getInputProps: (options: Record<string, unknown>) => React.InputHTMLAttributes<HTMLInputElement>;
  suggestions: Suggestion[];
  getSuggestionItemProps: (suggestion: Suggestion, options?: Record<string, unknown>) => React.HTMLAttributes<HTMLDivElement>;
  loading: boolean;
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
        
        if (staffIds.length > 0 && propertyId) {
          try {
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
    } catch {
      toast.error("Có lỗi xảy ra!");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="w-full p-4">
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Tạo Property Mới
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">Thêm property mới vào hệ thống</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tên Property */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  Tên Property *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên property"
                  className="h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.name && <span className="text-red-500 text-sm font-medium">{errors.name}</span>}
              </div>

              {/* Mô tả */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  Mô tả *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Mô tả chi tiết về property"
                  rows={3}
                  className="text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
                {errors.description && <span className="text-red-500 text-sm font-medium">{errors.description}</span>}
              </div>

              {/* Địa chỉ */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  Địa chỉ *
                </Label>
                {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-red-700 dark:text-red-300 text-sm font-medium">
                        Google Maps API key chưa được cấu hình. Vui lòng tạo file .env và thêm VITE_GOOGLE_MAPS_API_KEY
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="flex-1">
                    {isGoogleMapsLoaded ? (
                      <PlacesAutocomplete
                        value={formData.location.address}
                        onChange={(address: string) => handleLocationChange("address", address)}
                        onSelect={(_address: string, placeId?: string, suggestion?: Suggestion) => {
                          if (suggestion) {
                            handleLocationChange("address", suggestion.description);
                            handleLocationChange("place_id", suggestion.placeId || "");
                            
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
                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }: PlacesAutocompleteRenderProps) => (
                          <div>
                            <Input
                              {...getInputProps({
                                placeholder: 'Địa chỉ đầy đủ',
                                className: 'w-full h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
                              })}
                            />
                            <div className="autocomplete-dropdown-container bg-white border rounded shadow z-50">
                              {loading && <div>Đang tìm kiếm...</div>}
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
                        className="w-full h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    )}
                  </div>
                </div>
                {errors["location.address"] && <span className="text-red-500 text-sm font-medium">{errors["location.address"]}</span>}
              </div>

              {/* Thành phố, Quận, Phường */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-base font-semibold text-gray-800 dark:text-gray-200">Thành phố</Label>
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
                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }: PlacesAutocompleteRenderProps) => (
                      <div>
                        <Input
                          {...getInputProps({
                            placeholder: 'Thành phố',
                            className: 'w-full h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
                          })}
                        />
                        <div className="autocomplete-dropdown-container bg-white border rounded shadow z-50">
                          {loading && <div>Đang tìm kiếm...</div>}
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
                  <Label htmlFor="district" className="text-base font-semibold text-gray-800 dark:text-gray-200">Quận/Huyện</Label>
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
                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }: PlacesAutocompleteRenderProps) => (
                      <div>
                        <Input
                          {...getInputProps({
                            placeholder: 'Quận/Huyện',
                            className: 'w-full h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
                          })}
                        />
                        <div className="autocomplete-dropdown-container bg-white border rounded shadow z-50">
                          {loading && <div>Đang tìm kiếm...</div>}
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
                  <Label htmlFor="ward" className="text-base font-semibold text-gray-800 dark:text-gray-200">Phường/Xã</Label>
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
                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }: PlacesAutocompleteRenderProps) => (
                      <div>
                        <Input
                          {...getInputProps({
                            placeholder: 'Phường/Xã',
                            className: 'w-full h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
                          })}
                        />
                        <div className="autocomplete-dropdown-container bg-white border rounded shadow z-50">
                          {loading && <div>Đang tìm kiếm...</div>}
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
                  <Label htmlFor="contactPhone" className="text-base font-semibold text-gray-800 dark:text-gray-200">Số điện thoại liên hệ</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    placeholder="Số điện thoại"
                    className="h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-base font-semibold text-gray-800 dark:text-gray-200">Email liên hệ</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    placeholder="Email"
                    className="h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="rounded border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <Label htmlFor="allowPets" className="text-base font-semibold text-gray-800 dark:text-gray-200">Cho phép thú cưng</Label>
              </div>

              {/* Upload Images */}
              <div className="space-y-2">
                <Label htmlFor="images" className="text-base font-semibold text-gray-800 dark:text-gray-200">Chọn ảnh property</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={e => setFiles(Array.from(e.target.files || []))}
                  className="h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <Button
                  type="button"
                  onClick={handleUploadImages}
                  disabled={uploadLoading || files.length === 0}
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {uploadLoading ? "Đang upload..." : "Upload ảnh"}
                </Button>
                {files && files.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">Đã chọn {files.length} file(s)</p>
                )}
                {errors.images && <span className="text-red-500 text-sm font-medium">{errors.images}</span>}
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
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  Nhân viên được gán
                </Label>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600">
                  {staffLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-300">Đang tải danh sách nhân viên...</span>
                    </div>
                  )}
                  {staffOptions.length === 0 && !staffLoading && (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Không có nhân viên nào</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {staffOptions.map(staff => {
                      const isChecked = staffIds.includes(staff._id);
                      
                      return (
                        <div key={staff._id} className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          isChecked 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              value={staff._id}
                              checked={isChecked}
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
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 dark:text-white text-sm">{staff.name}</div>
                              {staff.email && <div className="text-xs text-gray-600 dark:text-gray-400">{staff.email}</div>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Error message */}
              {(error || uploadError) && (
                <div className="text-red-500 text-sm font-medium">{error || uploadError}</div>
              )}

              {/* Submit button */}
              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/admin/properties")}
                  className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                  disabled={loading || uploadLoading}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" 
                  disabled={loading || uploadLoading}
                >
                  {loading || uploadLoading ? "Đang xử lý..." : "Tạo Property"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 