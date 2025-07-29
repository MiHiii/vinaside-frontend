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
  assignStaffToProperty,
  unassignStaffFromProperty,
  getStaffByProperty
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
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { useGoogleMaps } from "@/hooks/useGoogleMaps";


interface AssignmentData {
  _id: string;
  propertyId: string;
  staffId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role?: string;
  };
  assignedBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Thêm type LocationWithPlaceId

type LocationWithPlaceId = {
  lat: number;
  lng: number;
  address: string;
  place_id?: string;
  city?: string;
  district?: string;
  ward?: string;
};

interface EditPropertyFormData {
  name: string;
  description: string;
  location: LocationWithPlaceId;
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
    place_id: z.string().optional(),
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

type Suggestion = {
  description: string;
  placeId: string;
  [key: string]: unknown;
};

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
  const isGoogleMapsLoaded = useGoogleMaps();

  const [formData, setFormData] = useState<EditPropertyFormData>({
    name: "",
    description: "",
    location: {
      lat: 0,
      lng: 0,
      address: "",
      place_id: "",
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
  const [staffRoles, setStaffRoles] = useState<Record<string, string>>({});
  const [originalStaffIds, setOriginalStaffIds] = useState<string[]>([]);

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
        location: property.location as LocationWithPlaceId,
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

  // Khi property thay đổi, lấy dữ liệu nhân viên đã được gán
  useEffect(() => {
    if (property && property._id) {
      // Lấy danh sách nhân viên đã được gán cho property này
      dispatch(getStaffByProperty(property._id)).then((result) => {
        if (getStaffByProperty.fulfilled.match(result)) {
          const staffData = result.payload?.data || [];
          
          // Lọc ra những assignment có staffId hợp lệ
          const validAssignments = staffData.filter((assignment: AssignmentData) => 
            assignment && assignment.staffId && assignment.staffId._id
          );
          
          const assignedStaffIds = validAssignments.map((assignment: AssignmentData) => assignment.staffId._id);
          const assignedStaffRoles = validAssignments.reduce((acc: Record<string, string>, assignment: AssignmentData) => {
            if (assignment.staffId && assignment.staffId._id) {
              acc[assignment.staffId._id] = assignment.staffId.role || 'Staff';
            }
            return acc;
          }, {});
          
          setStaffIds(assignedStaffIds);
          setStaffRoles(assignedStaffRoles);
          setOriginalStaffIds(assignedStaffIds); // Lưu danh sách nhân viên ban đầu
        }
      }).catch((error) => {
        console.error('Error calling getStaffByProperty:', error);
      });
    }
  }, [property, dispatch]);



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

      // Xử lý thay đổi nhân viên - thêm mới và bỏ gán
      if (id) {
        try {
          // Tìm những nhân viên bị loại bỏ
          const removedStaffIds = originalStaffIds.filter(staffId => !staffIds.includes(staffId));
          
          // Tìm những nhân viên mới được thêm vào
          const newStaffIds = staffIds.filter(staffId => !originalStaffIds.includes(staffId));
          
          // Bỏ gán những nhân viên bị loại
          for (const staffId of removedStaffIds) {
            const result = await dispatch(unassignStaffFromProperty({ 
              id, 
              staffIds: [staffId]
            }));
            if (unassignStaffFromProperty.rejected.match(result)) {
              toast.error(`Bỏ gán nhân viên ${staffId} thất bại!`);
            }
          }
          
          // Gán những nhân viên mới
          for (const staffId of newStaffIds) {
            const role = staffRoles[staffId] || 'Staff';
            const result = await dispatch(assignStaffToProperty({ 
              id, 
              staffIds: [staffId],
              role 
            }));
            if (assignStaffToProperty.rejected.match(result)) {
              toast.error(`Gán nhân viên ${staffId} thất bại!`);
            }
          }
          
          if (removedStaffIds.length > 0 || newStaffIds.length > 0) {
            toast.success("Cập nhật nhân viên thành công!");
          }
        } catch {
          toast.error("Cập nhật nhân viên thất bại!");
        }
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
    <div className="min-h-screen">
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
              {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                <div className="text-red-500 text-sm mb-2">
                  ⚠️ Google Maps API key chưa được cấu hình. Vui lòng tạo file .env và thêm VITE_GOOGLE_MAPS_API_KEY
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
                    
                    // Luôn lấy lat/lng từ geocodeByAddress để đảm bảo có tọa độ
                    geocodeByAddress(suggestion.description)
                      .then((results: google.maps.GeocoderResult[]) => getLatLng(results[0]))
                      .then((latLng: { lat: number; lng: number }) => {
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
                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                   getInputProps: (options: any) => any;
                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                   suggestions: Array<Suggestion>;
                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                   getSuggestionItemProps: (suggestion: Suggestion, options?: any) => any;
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
                                   .then((latLng: { lat: number; lng: number }) => {
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
                      placeholder={!import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? "Google Maps API key chưa được cấu hình" : "Đang tải Google Maps..."}
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    getInputProps: (options: any) => any;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    suggestions: Array<Suggestion>;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    getSuggestionItemProps: (suggestion: Suggestion, options?: any) => any;
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
                              {...getSuggestionItemProps(suggestion, {
                                className,
                                onClick: () => {
                                  handleLocationChange("city", suggestion.description);
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    getInputProps: (options: any) => any;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    suggestions: Array<Suggestion>;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    getSuggestionItemProps: (suggestion: Suggestion, options?: any) => any;
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
                              {...getSuggestionItemProps(suggestion, {
                                className,
                                onClick: () => {
                                  handleLocationChange("district", suggestion.description);
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    getInputProps: (options: any) => any;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    suggestions: Array<Suggestion>;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    getSuggestionItemProps: (suggestion: Suggestion, options?: any) => any;
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
                              {...getSuggestionItemProps(suggestion, {
                                className,
                                onClick: () => {
                                  handleLocationChange("ward", suggestion.description);
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

            {/* Debug section */}
         

            {/* Nhân viên được gán */}
            <div className="space-y-2">
              <Label>Nhân viên được gán</Label>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
                {staffLoading && <div className="text-xs text-gray-500">Đang tải danh sách nhân viên...</div>}
                {staffOptions.length === 0 && !staffLoading && <div className="text-xs text-gray-500">Không có nhân viên nào</div>}
                {staffOptions.map(staff => {
                  const isChecked = staffIds.includes(staff._id);
                  
                  return (
                    <div key={staff._id} className="flex items-center gap-2 p-2 border rounded">
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
                        className="accent-blue-500 h-4 w-4 rounded"
                      />
                      <div className="flex-1">
                        <span className="font-medium">{staff.name}</span>
                        {staff.email && <span className="text-sm text-gray-600 ml-2">({staff.email})</span>}
                      </div>
                      {isChecked && (
                        <Input
                          type="text"
                          placeholder="Role"
                          value={staffRoles[staff._id] || 'Staff'}
                          onChange={(e) => setStaffRoles(prev => ({ ...prev, [staff._id]: e.target.value }))}
                          className="w-24 h-8 text-sm"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
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