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
  getStaffByProperty,
} from "@/store/slices/propertySlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import {
  fetchStaffList,
  selectStaffList,
  selectStaffLoading,
} from "@/store/slices/userSlice";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
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
  name: z.string().min(1, "Tên property là bắt buộc").max(255, "Tên property không được vượt quá 255 ký tự"),
  description: z.string().min(1, "Mô tả là bắt buộc").max(255, "Mô tả không được vượt quá 255 ký tự"),
  location: z.object({
    address: z.string().min(1, "Địa chỉ là bắt buộc").max(200, "Địa chỉ không được vượt quá 200 ký tự"),
    place_id: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    ward: z.string().optional(),
    lat: z.preprocess((val) => Number(val), z.number().optional()),
    lng: z.preprocess((val) => Number(val), z.number().optional()),
  }),
  contactPhone: z
    .string()
    .min(10, 'Số điện thoại phải đủ 10 số')
    .max(10, 'Số điện thoại phải đủ 10 số')
    .regex(/^[0-9]{10}$/, 'Số điện thoại chỉ gồm 10 số'),
  contactEmail: z.string()
    .email('Email sai định dạng')
    .max(255, 'Email không được vượt quá 255 ký tự')
    .optional(),
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
      dispatch(getStaffByProperty(property._id))
        .then((result) => {
          if (getStaffByProperty.fulfilled.match(result)) {
            const staffData = result.payload?.data || [];

            // Lọc ra những assignment có staffId hợp lệ
            const validAssignments = staffData.filter(
              (assignment: AssignmentData) =>
                assignment && assignment.staffId && assignment.staffId._id
            );

            const assignedStaffIds = validAssignments.map(
              (assignment: AssignmentData) => assignment.staffId._id
            );
            const assignedStaffRoles = validAssignments.reduce(
              (acc: Record<string, string>, assignment: AssignmentData) => {
                if (assignment.staffId && assignment.staffId._id) {
                  acc[assignment.staffId._id] =
                    assignment.staffId.role || "Staff";
                }
                return acc;
              },
              {}
            );

            setStaffIds(assignedStaffIds);
            setStaffRoles(assignedStaffRoles);
            setOriginalStaffIds(assignedStaffIds); // Lưu danh sách nhân viên ban đầu
          }
        })
        .catch((error) => {
          console.error("Error calling getStaffByProperty:", error);
        });
    }
  }, [property, dispatch]);

  const handleInputChange = (
    field: keyof EditPropertyFormData,
    value: string | boolean
  ) => {
    // Validation cho các trường cụ thể
    if (field === "name" && typeof value === "string" && value.length > 255) {
      return; // Không cho phép vượt quá 255 ký tự
    }
    if (
      field === "description" &&
      typeof value === "string" &&
      value.length > 255
    ) {
      return; // Không cho phép vượt quá 255 ký tự
    }
    if (field === "contactPhone" && typeof value === "string") {
      // Chỉ cho phép số, tối đa 10 số
      if (!/^[0-9]*$/.test(value) || value.length > 10) {
        return;
      }
    }
    if (field === "contactEmail" && typeof value === "string" && value) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (
    field: keyof typeof formData.location,
    value: string | number
  ) => {
    // Validation cho địa chỉ
    if (
      field === "address" &&
      typeof value === "string" &&
      value.length > 200
    ) {
      return; // Không cho phép vượt quá 200 ký tự
    }

    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
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
      resultZod.error.errors.forEach((err) => {
        if (err.path.length === 1)
          fieldErrors[err.path[0] as string] = err.message;
        if (err.path.length === 2 && err.path[0] === "location")
          fieldErrors["location." + err.path[1]] = err.message;
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
      const result = await dispatch(
        updateProperty({
          id,
          ...formData,
          images: imageUrls,
          thumbnail,
        })
      );

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
          const removedStaffIds = originalStaffIds.filter(
            (staffId) => !staffIds.includes(staffId)
          );

          // Tìm những nhân viên mới được thêm vào
          const newStaffIds = staffIds.filter(
            (staffId) => !originalStaffIds.includes(staffId)
          );

          // Bỏ gán những nhân viên bị loại
          for (const staffId of removedStaffIds) {
            const result = await dispatch(
              unassignStaffFromProperty({
                id,
                staffIds: [staffId],
              })
            );
            if (unassignStaffFromProperty.rejected.match(result)) {
              toast.error(`Bỏ gán nhân viên ${staffId} thất bại!`);
            }
          }

          // Gán những nhân viên mới
          for (const staffId of newStaffIds) {
            const role = staffRoles[staffId] || "Staff";
            const result = await dispatch(
              assignStaffToProperty({
                id,
                staffIds: [staffId],
                role,
              })
            );
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
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="w-full p-4">
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Chỉnh sửa HomeStay
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                  Cập nhật thông tin chi tiết về HomeStay
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tên Property */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-base font-semibold text-gray-800 dark:text-gray-200"
                >
                  Tên HomeStay *
                </Label>
                                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nhập tên HomeStay"
                    maxLength={255}
                    className="h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                {errors.name && (
                  <span className="text-red-500 text-sm font-medium">
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Mô tả */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-base font-semibold text-gray-800 dark:text-gray-200"
                >
                  Mô tả
                </Label>
                                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Mô tả chi tiết về HomeStay"
                    rows={3}
                    maxLength={255}
                    className="text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                {errors.description && (
                  <span className="text-red-500 text-sm font-medium">
                    {errors.description}
                  </span>
                )}
              </div>

              {/* Địa chỉ */}
              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="text-base font-semibold text-gray-800 dark:text-gray-200"
                >
                  Địa chỉ *
                </Label>
                {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <span className="text-red-700 dark:text-red-300 text-sm font-medium">
                        Google Maps API key chưa được cấu hình. Vui lòng tạo
                        file .env và thêm VITE_GOOGLE_MAPS_API_KEY
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="flex-1">
                    {isGoogleMapsLoaded ? (
                      <PlacesAutocomplete
                        value={formData.location.address}
                        onChange={(address: string) =>
                          handleLocationChange("address", address)
                        }
                        onSelect={(
                          _address: string,
                          placeId?: string,
                          suggestion?: Suggestion
                        ) => {
                          if (suggestion) {
                            handleLocationChange(
                              "address",
                              suggestion.description
                            );
                            handleLocationChange(
                              "place_id",
                              suggestion.placeId || ""
                            );

                            // Luôn lấy lat/lng từ geocodeByAddress để đảm bảo có tọa độ
                            geocodeByAddress(suggestion.description)
                              .then((results: google.maps.GeocoderResult[]) => {
                                const result = results[0];
                                getLatLng(result).then(
                                  (latLng: { lat: number; lng: number }) => {
                                    handleLocationChange("lat", latLng.lat);
                                    handleLocationChange("lng", latLng.lng);
                                    console.log("Đã lấy tọa độ:", latLng);
                                  }
                                );

                                // Parse address components để tự động điền các trường
                                const addressComponents =
                                  result.address_components;
                                let city = "";
                                let district = "";
                                let ward = "";

                                addressComponents.forEach(
                                  (
                                    component: google.maps.GeocoderAddressComponent
                                  ) => {
                                    const types = component.types;

                                    // Thành phố
                                    if (
                                      types.includes(
                                        "administrative_area_level_1"
                                      ) ||
                                      types.includes("locality") ||
                                      types.includes("sublocality_level_1")
                                    ) {
                                      city = component.long_name;
                                    }

                                    // Quận/Huyện
                                    if (
                                      types.includes(
                                        "administrative_area_level_2"
                                      ) ||
                                      types.includes("sublocality_level_2")
                                    ) {
                                      district = component.long_name;
                                    }

                                    // Phường/Xã
                                    if (
                                      types.includes(
                                        "administrative_area_level_3"
                                      ) ||
                                      types.includes("sublocality_level_3") ||
                                      types.includes("sublocality")
                                    ) {
                                      ward = component.long_name;
                                    }
                                  }
                                );

                                // Tự động điền các trường
                                if (city) handleLocationChange("city", city);
                                if (district)
                                  handleLocationChange("district", district);
                                if (ward) handleLocationChange("ward", ward);

                                console.log("Đã tự động điền:", {
                                  city,
                                  district,
                                  ward,
                                });
                              })
                              .catch((error: unknown) => {
                                console.error("Error getting lat/lng:", error);
                                toast.error("Không thể lấy tọa độ từ địa chỉ!");
                              });
                          } else {
                            handleLocationChange("address", _address);
                            handleLocationChange("place_id", placeId || "");
                          }
                        }}
                        searchOptions={{
                          componentRestrictions: { country: ["vn"] },
                          language: "vi",
                        }}
                      >
                        {({
                          getInputProps,
                          suggestions,
                          getSuggestionItemProps,
                          loading,
                        }: {
                          getInputProps: (options: Record<string, unknown>) => React.InputHTMLAttributes<HTMLInputElement>;
                          suggestions: Array<Suggestion>;
                          getSuggestionItemProps: (
                            suggestion: Suggestion,
                            options?: Record<string, unknown>
                          ) => React.HTMLAttributes<HTMLDivElement>;
                          loading: boolean;
                        }) => (
                          <div>
                            <Input
                              {...getInputProps({
                                placeholder: "Địa chỉ đầy đủ",
                                className:
                                  "w-full h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                              })}
                            />
                            <div className="autocomplete-dropdown-container bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                              {loading && (
                                <div className="p-3 text-gray-600 dark:text-gray-300 text-center">
                                  Đang tìm kiếm...
                                </div>
                              )}
                              {suggestions.map((suggestion: Suggestion) => {
                                const className = suggestion.active
                                  ? "suggestion-item--active bg-blue-100 dark:bg-blue-900/50 px-4 py-3 cursor-pointer border-l-4 border-blue-500"
                                  : "suggestion-item px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 border-l-4 border-transparent";
                                return (
                                  <div
                                    {...getSuggestionItemProps(suggestion, {
                                      className,
                                      onClick: () => {
                                        handleLocationChange(
                                          "address",
                                          suggestion.description
                                        );
                                        handleLocationChange(
                                          "place_id",
                                          suggestion.placeId || ""
                                        );

                                        // Luôn lấy lat/lng từ geocodeByAddress để đảm bảo có tọa độ
                                        geocodeByAddress(suggestion.description)
                                          .then(
                                            (
                                              results: google.maps.GeocoderResult[]
                                            ) => {
                                              const result = results[0];
                                              getLatLng(result).then(
                                                (latLng: {
                                                  lat: number;
                                                  lng: number;
                                                }) => {
                                                  handleLocationChange(
                                                    "lat",
                                                    latLng.lat
                                                  );
                                                  handleLocationChange(
                                                    "lng",
                                                    latLng.lng
                                                  );
                                                  console.log(
                                                    "Đã lấy tọa độ:",
                                                    latLng
                                                  );
                                                }
                                              );

                                              // Parse address components để tự động điền các trường
                                              const addressComponents =
                                                result.address_components;
                                              let city = "";
                                              let district = "";
                                              let ward = "";

                                              addressComponents.forEach(
                                                (
                                                  component: google.maps.GeocoderAddressComponent
                                                ) => {
                                                  const types = component.types;

                                                  // Thành phố
                                                  if (
                                                    types.includes(
                                                      "administrative_area_level_1"
                                                    ) ||
                                                    types.includes(
                                                      "locality"
                                                    ) ||
                                                    types.includes(
                                                      "sublocality_level_1"
                                                    )
                                                  ) {
                                                    city = component.long_name;
                                                  }

                                                  // Quận/Huyện
                                                  if (
                                                    types.includes(
                                                      "administrative_area_level_2"
                                                    ) ||
                                                    types.includes(
                                                      "sublocality_level_2"
                                                    )
                                                  ) {
                                                    district =
                                                      component.long_name;
                                                  }

                                                  // Phường/Xã
                                                  if (
                                                    types.includes(
                                                      "administrative_area_level_3"
                                                    ) ||
                                                    types.includes(
                                                      "sublocality_level_3"
                                                    ) ||
                                                    types.includes(
                                                      "sublocality"
                                                    )
                                                  ) {
                                                    ward = component.long_name;
                                                  }
                                                }
                                              );

                                              // Tự động điền các trường
                                              if (city)
                                                handleLocationChange(
                                                  "city",
                                                  city
                                                );
                                              if (district)
                                                handleLocationChange(
                                                  "district",
                                                  district
                                                );
                                              if (ward)
                                                handleLocationChange(
                                                  "ward",
                                                  ward
                                                );

                                              console.log("Đã tự động điền:", {
                                                city,
                                                district,
                                                ward,
                                              });
                                            }
                                          )
                                          .catch((error: unknown) => {
                                            console.error(
                                              "Error getting lat/lng:",
                                              error
                                            );
                                            toast.error(
                                              "Không thể lấy tọa độ từ địa chỉ!"
                                            );
                                          });
                                      },
                                    })}
                                    key={suggestion.placeId}
                                  >
                                    <span className="text-gray-900 dark:text-gray-100">
                                      {suggestion.description}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </PlacesAutocomplete>
                    ) : (
                      <Input
                        placeholder={
                          !import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                            ? "Google Maps API key chưa được cấu hình"
                            : "Đang tải Google Maps..."
                        }
                        disabled
                        className="w-full h-10 text-base border-2 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                      />
                    )}
                  </div>
                </div>
                {errors["location.address"] && (
                  <span className="text-red-500 text-sm font-medium">
                    {errors["location.address"]}
                  </span>
                )}
              </div>

              {/* Thành phố, Quận, Phường */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="city"
                      className="text-base font-semibold text-gray-800 dark:text-gray-200"
                    >
                      Thành phố
                    </Label>
                    <Input
                      id="city"
                      value={formData.location.city}
                      onChange={(e) =>
                        handleLocationChange("city", e.target.value)
                      }
                      placeholder="Thành phố"
                      className="w-full h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="district"
                      className="text-base font-semibold text-gray-800 dark:text-gray-200"
                    >
                      Quận/Huyện
                    </Label>
                    <Input
                      id="district"
                      value={formData.location.district}
                      onChange={(e) =>
                        handleLocationChange("district", e.target.value)
                      }
                      placeholder="Quận/Huyện"
                      className="w-full h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="ward"
                      className="text-base font-semibold text-gray-800 dark:text-gray-200"
                    >
                      Phường/Xã
                    </Label>
                    <Input
                      id="ward"
                      value={formData.location.ward}
                      onChange={(e) =>
                        handleLocationChange("ward", e.target.value)
                      }
                      placeholder="Phường/Xã"
                      className="w-full h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin liên hệ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="contactPhone"
                    className="text-base font-semibold text-gray-800 dark:text-gray-200"
                  >
                    Số điện thoại liên hệ *
                  </Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      handleInputChange("contactPhone", e.target.value)
                    }
                    placeholder="Số điện thoại (VD: 0123456789)"
                    maxLength={10}
                    className="h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="contactEmail"
                    className="text-base font-semibold text-gray-800 dark:text-gray-200"
                  >
                    Email liên hệ
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      handleInputChange("contactEmail", e.target.value)
                    }
                    placeholder="Email (VD: contact@example.com)"
                    maxLength={255}
                    className="h-10 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Hiển thị ảnh property */}
              {property && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    Ảnh hiện tại
                  </Label>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600">
                    {property.thumbnail ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Ảnh đại diện
                          </Label>
                          <img
                            src={property.thumbnail}
                            alt="Thumbnail"
                            className="h-32 w-full rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600 shadow-md"
                          />
                        </div>
                        {property.images && property.images.length > 0 && (
                          <div>
                            <Label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                              Gallery ảnh ({property.images.length} ảnh)
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {property.images.map(
                                (url: string, idx: number) => (
                                  <div key={idx} className="relative group">
                                    <img
                                      src={url}
                                      alt={`Ảnh ${idx + 1}`}
                                      className="h-20 w-full object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm transition-transform duration-200 group-hover:scale-105"
                                    />
                                    <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1 py-0.5 rounded">
                                      {idx + 1}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          className="w-16 h-16 text-gray-400 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                          Không có ảnh nào
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Thay ảnh mới */}
              <div className="space-y-3">
                <Label
                  htmlFor="newImages"
                  className="text-base font-semibold text-gray-800 dark:text-gray-200"
                >
                  Chọn ảnh mới
                </Label>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600 border-dashed">
                  <div className="text-center">
                    <svg
                      className="w-10 h-10 text-gray-400 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                      Kéo thả ảnh vào đây hoặc click để chọn
                    </p>
                    <Input
                      id="newImages"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        setNewFiles(Array.from(e.target.files || []))
                      }
                      className="hidden"
                    />
                    <label
                      htmlFor="newImages"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Chọn ảnh
                    </label>
                  </div>
                  {newFiles && newFiles.length > 0 && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-green-700 dark:text-green-300 font-medium">
                          Đã chọn {newFiles.length} file(s) mới
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Debug section */}

              {/* Nhân viên được gán */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  Nhân viên được gán
                </Label>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600">
                  {staffLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-300">
                        Đang tải danh sách nhân viên...
                      </span>
                    </div>
                  )}
                  {staffOptions.length === 0 && !staffLoading && (
                    <div className="text-center py-8">
                      <svg
                        className="w-16 h-16 text-gray-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Không có nhân viên nào
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {staffOptions.map((staff) => {
                      const isChecked = staffIds.includes(staff._id);

                      return (
                        <div
                          key={staff._id}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            isChecked
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              value={staff._id}
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setStaffIds((prev) => [...prev, staff._id]);
                                  setStaffRoles((prev) => ({
                                    ...prev,
                                    [staff._id]: "Staff",
                                  }));
                                } else {
                                  setStaffIds((prev) =>
                                    prev.filter((id) => id !== staff._id)
                                  );
                                  setStaffRoles((prev) => {
                                    const newRoles = { ...prev };
                                    delete newRoles[staff._id];
                                    return newRoles;
                                  });
                                }
                              }}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                {staff.name}
                              </div>
                              {staff.email && (
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {staff.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span className="text-red-700 dark:text-red-300 font-medium">
                      {error}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/properties")}
                  className="flex-1 h-12 text-base font-semibold border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Cập nhật HomeStay
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
