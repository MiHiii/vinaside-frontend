import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchProperties,
  selectProperties,
  selectPropertiesLoading,
  selectPropertiesError,
  selectPropertiesTotal,
  getStaffByProperty,
  // createProperty
} from "@/store/slices/propertySlice";
import { selectStaffList } from "@/store/slices/userSlice";
import { useUserRole } from "@/hooks/useUserRole";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";
import { api } from "@/services/api";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Edit,
  Eye,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users as UsersIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PermissionGuard } from "@/components/common/PermissionGuard";

interface PropertiesFilters {
  search: string;
  type: string;
  status: string;
  page: number;
  limit: number;
}

interface StaffData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

interface AssignmentData {
  _id: string;
  propertyId: {
    _id: string;
    name: string;
    type: string;
    location?: {
      address: string;
      city?: string;
      district?: string;
      ward?: string;
      coordinates?: [number, number];
    };
    thumbnail?: string;
    images?: string[];
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  };
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

export default function AdminProperties() {
  const dispatch = useAppDispatch();
  const { isAdmin, isStaff } = useUserRole();
  const { user } = useSelector((state: RootState) => state.auth);

  const properties = useAppSelector(selectProperties);
  const loading = useAppSelector(selectPropertiesLoading);
  const error = useAppSelector(selectPropertiesError);
  const total = useAppSelector(selectPropertiesTotal);

  // Local state cho staff properties
  const [staffProperties, setStaffProperties] = useState<Property[]>([]);

  // Sử dụng staffProperties cho staff, properties cho admin
  const displayProperties = isStaff ? staffProperties : properties;
  console.log("Properties to render:", displayProperties);

  console.log("Properties state:", {
    properties,
    staffProperties,
    loading,
    error,
    total,
  });

  const [filters, setFilters] = useState<PropertiesFilters>({
    search: "",
    type: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const staffList = useAppSelector(selectStaffList);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [currentModalStaff, setCurrentModalStaff] = useState<StaffData[]>([]);

  // State để lưu trữ số nhân viên và danh sách staff cho từng property
  const [propertyStaffCounts, setPropertyStaffCounts] = useState<
    Record<string, number>
  >({});
  const [propertyStaffData, setPropertyStaffData] = useState<
    Record<string, AssignmentData[]>
  >({});
  const [loadingStaffCounts, setLoadingStaffCounts] = useState<
    Record<string, boolean>
  >({});

  // Ref để track các property đã load để tránh gọi API trùng lặp
  const loadedPropertiesRef = useRef<Set<string>>(new Set());

  const handleShowStaff = (propertyId: string) => {
    // Sử dụng dữ liệu staff đã load từ API mới
    const staffData = propertyStaffData[propertyId] || [];
    if (staffData.length === 0) {
      toast.error("Không có nhân viên nào được gán cho tòa nhà này");
      return;
    }

    // Lấy danh sách staff từ dữ liệu đã load
    // API trả về mảng các assignment, mỗi assignment có staffId object
    const staffList = staffData.map((assignment: AssignmentData) => ({
      _id: assignment.staffId._id,
      name: assignment.staffId.name,
      email: assignment.staffId.email,
      phone: assignment.staffId.phone,
      role: "Staff", // Mặc định role
    }));

    // Cập nhật state local để hiển thị trong modal
    setCurrentModalStaff(staffList);
    setStaffModalOpen(true);
  };

  // Hàm lấy số nhân viên cho một property
  const loadStaffCountForProperty = useCallback(
    async (propertyId: string) => {
      // Kiểm tra xem đã load property này chưa
      if (loadedPropertiesRef.current.has(propertyId)) return;

      // Đánh dấu đã load
      loadedPropertiesRef.current.add(propertyId);

      setLoadingStaffCounts((prev) => ({ ...prev, [propertyId]: true }));
      try {
        const result = await dispatch(getStaffByProperty(propertyId));
        if (getStaffByProperty.fulfilled.match(result)) {
          const staffData = result.payload?.data || [];
          const staffCount = staffData.length;
          setPropertyStaffCounts((prev) => ({
            ...prev,
            [propertyId]: staffCount,
          }));
          setPropertyStaffData((prev) => ({
            ...prev,
            [propertyId]: staffData,
          }));
        }
      } catch (error) {
        console.error(
          "Error loading staff count for property:",
          propertyId,
          error
        );
      } finally {
        setLoadingStaffCounts((prev) => ({ ...prev, [propertyId]: false }));
      }
    },
    [dispatch]
  );

  const loadProperties = useCallback(async () => {
    try {
      console.log("Current filters state:", filters); // Log state hiện tại của filters

      if (isAdmin) {
        // Admin có thể xem tất cả properties
        const result = await dispatch(
          fetchProperties({
            ...filters,
            search: filters.search.trim(), // Đảm bảo cắt khoảng trắng
          })
        );
        console.log("Admin API call result:", result); // Log kết quả API
      } else if (isStaff) {
        // Staff chỉ thấy properties được assign cho mình
        let userId = user?._id;
        if (!userId) {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              userId = parsedUser._id;
            } catch (e) {
              console.error("Error parsing localStorage user:", e);
            }
          }
        }

        if (!userId) {
          throw new Error("Không tìm thấy thông tin user");
        }

        console.log("Staff loading properties for user:", userId);
        const myAssignments =
          await propertyStaffAssignmentApi.getPropertiesByStaff(userId);
        console.log("Staff assignments:", myAssignments);

        // Chuyển đổi assignments thành properties format
        const staffAssignments =
          myAssignments.data?.data || myAssignments.data || [];
        console.log("Staff assignments:", staffAssignments);

        // Lấy thông tin chi tiết cho từng property
        const staffProperties = await Promise.all(
          staffAssignments.map(async (assignment: AssignmentData) => {
            try {
              // Gọi API lấy thông tin chi tiết property
              const propertyResponse = await api.get(
                `/properties/${assignment.propertyId._id}`
              );
              const propertyData = propertyResponse.data;

              if (propertyData.success && propertyData.data) {
                return {
                  ...propertyData.data,
                  staffIds: [assignment.staffId._id],
                };
              } else {
                // Fallback nếu API lỗi
                return {
                  ...assignment.propertyId,
                  _id: assignment.propertyId._id,
                  name: assignment.propertyId.name,
                  type: assignment.propertyId.type,
                  location: assignment.propertyId.location ?? {
                    address: "Địa chỉ chưa cập nhật",
                    city: "",
                    district: "",
                    ward: "",
                    coordinates: [0, 0],
                  },
                  thumbnail:
                    assignment.propertyId.thumbnail ??
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  images: assignment.propertyId.images ?? [
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  ],
                  createdAt:
                    assignment.propertyId.createdAt ??
                    assignment.createdAt ??
                    new Date().toISOString(),
                  updatedAt:
                    assignment.propertyId.updatedAt ??
                    assignment.updatedAt ??
                    new Date().toISOString(),
                  status: assignment.propertyId.status ?? "active",
                  staffIds: [assignment.staffId._id],
                };
              }
            } catch (error) {
              console.error("Error fetching property details:", error);
              // Fallback nếu API lỗi
              return {
                ...assignment.propertyId,
                _id: assignment.propertyId._id,
                name: assignment.propertyId.name,
                type: assignment.propertyId.type,
                location: assignment.propertyId.location ?? {
                  address: "Địa chỉ chưa cập nhật",
                  city: "",
                  district: "",
                  ward: "",
                  coordinates: [0, 0],
                },
                thumbnail:
                  assignment.propertyId.thumbnail ??
                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                images: assignment.propertyId.images ?? [
                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                ],
                createdAt:
                  assignment.propertyId.createdAt ??
                  assignment.createdAt ??
                  new Date().toISOString(),
                updatedAt:
                  assignment.propertyId.updatedAt ??
                  assignment.updatedAt ??
                  new Date().toISOString(),
                status: assignment.propertyId.status ?? "active",
                staffIds: [assignment.staffId._id],
              };
            }
          })
        );

        console.log("Converted staff properties:", staffProperties);

        // Update local state với staff properties
        console.log(
          "Updating local state with staff properties:",
          staffProperties
        );
        setStaffProperties(staffProperties);

        // Cập nhật total count cho staff
        if (isStaff) {
          // Dispatch action để update total count
          dispatch({
            type: "properties/setPropertiesTotal",
            payload: staffProperties.length,
          });
        }
      }
    } catch (error) {
      console.error("Error loading properties:", error);
      toast.error("Lỗi tải danh sách properties!");
    }
  }, [filters, dispatch, isAdmin, isStaff, user]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]); // Chạy khi loadProperties thay đổi

  // Load số nhân viên cho từng property khi properties thay đổi
  useEffect(() => {
    // Reset dữ liệu cũ và ref khi properties thay đổi
    setPropertyStaffCounts({});
    setLoadingStaffCounts({});
    loadedPropertiesRef.current.clear();

    // Sử dụng displayProperties thay vì properties
    if (displayProperties && displayProperties.length > 0) {
      displayProperties.forEach((property) => {
        if (property._id) {
          loadStaffCountForProperty(property._id);
        }
      });
    }
  }, [displayProperties, loadStaffCountForProperty]);

  const handleFilterChange = (
    field: keyof PropertiesFilters,
    value: string | number
  ) => {
    console.log(`Filter changed: ${field} = ${value}`); // Log khi filter thay đổi
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === "page" ? Number(value) : 1, // Ép kiểu về number
    }));
  };

  // Pagination calculations
  const currentPage = filters.page;
  const itemsPerPage = filters.limit;
  const totalPages = Math.ceil((total || 0) / itemsPerPage) || 0;
  const startItem = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total || 0);
  const paginatedStaffProperties = React.useMemo(() => {
    if (!isStaff) return displayProperties;
    const start = (currentPage - 1) * itemsPerPage;
    return (displayProperties || []).slice(start, start + itemsPerPage);
  }, [isStaff, displayProperties, currentPage, itemsPerPage]);

  return (
    <div className="p-4">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Quản lý HomeStay
              </h1>
              <p className="text-gray-400 text-sm">Quản lý tất cả homestay</p>
            </div>
            <div className="flex gap-3">
              <PermissionGuard permission="property.create">
                <Link to="/admin/properties/create">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 h-10 px-4 rounded-lg font-medium">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm HomeStay
                  </Button>
                </Link>
              </PermissionGuard>
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">
                Danh sách HomeStay
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 top- pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  placeholder="Tìm kiếm theo tên..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 w-full h-10 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <div className="text-lg font-medium mb-2">Có lỗi xảy ra</div>
              <div className="text-sm text-gray-600">{error}</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="border-none">
                <TableHeader>
                  <TableRow className="border-none bg-gray-50">
                    <TableHead className="border-none text-gray-700 font-semibold py-4 px-6 text-sm tracking-wide">
                      Ảnh
                    </TableHead>
                    <TableHead className="border-none text-gray-700 font-semibold py-4 px-6 text-sm tracking-wide">
                      Tên
                    </TableHead>
                    <TableHead className="border-none text-gray-700 font-semibold py-4 px-6 text-sm tracking-wide">
                      Địa chỉ
                    </TableHead>
                    <TableHead className="border-none text-gray-700 font-semibold py-4 px-6 text-sm tracking-wide">
                      Nhân Viên
                    </TableHead>
                    <TableHead className="border-none text-gray-700 font-semibold py-4 px-6 text-sm tracking-wide">
                      Ngày tạo
                    </TableHead>
                    <TableHead className="text-right border-none text-gray-700 font-semibold py-4 px-6 text-sm tracking-wide">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(isStaff
                    ? paginatedStaffProperties
                    : displayProperties
                  )?.map((property, index) => (
                    <TableRow
                      key={property._id}
                      className={`border-none hover:bg-blue-50 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <TableCell className="border-none py-4 px-6">
                        <Link
                          to={`/admin/properties/${property._id}`}
                          title="Xem chi tiết"
                        >
                          <img
                            src={
                              property.thumbnail ||
                              property.images?.[0] ||
                              "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                            }
                            alt={property.name}
                            style={{
                              width: 76,
                              height: 55,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                            className="cursor-pointer hover:opacity-80 transition-all duration-200 shadow-sm"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
                            }}
                          />
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium border-none py-4 px-6">
                        <Link
                          to={`/admin/properties/${property._id}`}
                          title="Xem chi tiết"
                        >
                          <div
                            className="max-w-xs truncate cursor-pointer hover:text-blue-600 transition-colors duration-200 font-semibold text-gray-800"
                            title={property.name}
                          >
                            {property.name}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="border-none py-4 px-6">
                        <div
                          className="max-w-xs truncate text-gray-600 text-sm"
                          title={
                            property.location?.address ||
                            "Địa chỉ chưa cập nhật"
                          }
                        >
                          {property.location?.address ||
                            "Địa chỉ chưa cập nhật"}
                        </div>
                      </TableCell>
                      <TableCell className="border-none py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-50 hover:bg-blue-100 border-none rounded-lg px-3 py-1.5 transition-all duration-200"
                            type="button"
                            onClick={() => handleShowStaff(property._id || "")}
                            disabled={
                              loadingStaffCounts[property._id || ""] ||
                              (propertyStaffCounts[property._id || ""] || 0) ===
                                0
                            }
                            title={
                              property.staffIds &&
                              property.staffIds.length > 0 &&
                              staffList.length > 0
                                ? staffList
                                    .filter((s) =>
                                      property.staffIds.includes(s._id)
                                    )
                                    .map((s) => s.name || s.email || s._id)
                                    .join(", ")
                                : ""
                            }
                          >
                            <UsersIcon className="w-4 h-4 text-blue-500" />
                            <span className="inline-block min-w-[24px] text-center font-semibold text-sm bg-blue-600 text-white rounded-full px-2 py-0.5">
                              {loadingStaffCounts[property._id || ""] ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                              ) : (
                                propertyStaffCounts[property._id || ""] || 0
                              )}
                            </span>
                            <span className="ml-1 text-xs text-blue-700 font-medium">
                              staff
                            </span>
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="border-none py-4 px-6">
                        <div className="text-sm text-gray-500 font-medium">
                          {property.createdAt
                            ? new Date(property.createdAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : ""}
                        </div>
                      </TableCell>
                      <TableCell className="text-right border-none py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <PermissionGuard permission="property.view">
                            <Link
                              to={`/admin/properties/${property._id}`}
                              title="Xem chi tiết"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-lg h-8 w-8"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </PermissionGuard>
                          <PermissionGuard permission="property.edit">
                            <Link
                              to={`/admin/properties/edit/${property._id}`}
                              title="Chỉnh sửa"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-green-50 hover:text-green-600 transition-all duration-200 rounded-lg h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {(!displayProperties || displayProperties.length === 0) && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="text-xl font-semibold text-gray-700 mb-2">
                    Không có properties nào
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    Hãy thêm property đầu tiên để bắt đầu
                  </div>
                  <Link to="/admin/properties/create">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200">
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm Property Đầu Tiên
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (displayProperties?.length || 0) > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-200/50 gap-3 bg-white rounded-lg shadow-sm mt-4">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            Hiển thị {startItem} đến {endItem} trong tổng số {total || 0}{" "}
            homestay
            {totalPages > 1 && ` (Trang ${currentPage} / ${totalPages})`}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                handleFilterChange("page", Math.max(1, currentPage - 1))
              }
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("page", pageNum)}
                  className={`h-8 w-8 p-0 ${
                    currentPage === pageNum
                      ? "bg-gray-800 text-white hover:bg-gray-700 border-gray-800"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              onClick={() =>
                handleFilterChange(
                  "page",
                  Math.min(totalPages, currentPage + 1)
                )
              }
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal hiển thị staff */}
      <Dialog open={staffModalOpen} onOpenChange={setStaffModalOpen}>
        <DialogContent className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Danh sách nhân viên
            </DialogTitle>
          </DialogHeader>
          {currentModalStaff.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-base font-medium text-gray-600">
                Chưa có nhân viên nào
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentModalStaff.map((staff, idx) => (
                <div
                  key={staff._id || idx}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="font-semibold text-base text-gray-800 mb-2">
                    {staff.name || staff.email || staff._id}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Email:</span>{" "}
                      {staff.email || "-"}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">SĐT:</span>{" "}
                      {staff.phone || "-"}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Role:</span>{" "}
                      {staff.role || "-"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
