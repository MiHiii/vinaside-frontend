import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { 
  fetchProperties, 
  selectProperties, 
  selectPropertiesLoading, 
  selectPropertiesError, 
  selectPropertiesTotal,
  // createProperty
} from "@/store/slices/propertySlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Edit, 
  Eye, 
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

interface PropertiesFilters {
  search: string;
  type: string;
  status: string;
  page: number;
  limit: number;
}

export default function AdminProperties() {
  const dispatch = useAppDispatch();
  const properties = useAppSelector(selectProperties);
  console.log("Properties to render:", properties);
  const loading = useAppSelector(selectPropertiesLoading);
  const error = useAppSelector(selectPropertiesError);
  const total = useAppSelector(selectPropertiesTotal);

  console.log("Properties state:", { properties, loading, error, total });

  const [filters, setFilters] = useState<PropertiesFilters>({
    search: "",
    type: "",
    status: "",
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    loadProperties();
  }, [filters]); // Chạy khi filters thay đổi

  const loadProperties = async () => {
    try {
      console.log("Current filters state:", filters); // Log state hiện tại của filters
      const result = await dispatch(fetchProperties({
        ...filters,
        search: filters.search.trim(), // Đảm bảo cắt khoảng trắng
      }));
      console.log("API call result:", result); // Log kết quả API
    } catch (error) {
      console.error("Error loading properties:", error);
      toast.error("Lỗi tải danh sách properties!");
    }
  };

  const handleFilterChange = (field: keyof PropertiesFilters, value: string | number) => {
    console.log(`Filter changed: ${field} = ${value}`); // Log khi filter thay đổi
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field === "page" ? Number(value) : 1, // Ép kiểu về number
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Properties</h1>
          <p className="text-gray-600">Quản lý tất cả properties và bất động sản</p>
        </div>
        <div className="flex gap-2">
          {/* <Button 
            variant="outline"
            onClick={() => {
              console.log("Manual test API call");
              loadProperties();
            }}
          >
            Test API
          </Button> */}
          {/* <Button 
            variant="outline"
            onClick={async () => {
              console.log("Creating test property");
              const testProperty = {
                name: "Test Property",
                type: "homestay",
                description: "Test property description",
                location: {
                  lat: 10.762622,
                  lng: 106.660172,
                  address: "123 Test Street, Ho Chi Minh City",
                  city: "Ho Chi Minh City",
                  district: "District 1",
                  ward: "Ben Nghe"
                },
                checkInTime: "14:00",
                checkOutTime: "12:00",
                contactPhone: "0123456789",
                contactEmail: "test@example.com",
                allowPets: false,
                staffIds: [],
                images: []
              };
              
              try {
                const result = await dispatch(createProperty(testProperty));
                if (createProperty.fulfilled.match(result)) {
                  toast.success("Tạo test property thành công!");
                  loadProperties();
                } else {
                  toast.error("Tạo test property thất bại!");
                }
              } catch (error) {
                console.error("Error creating test property:", error);
                toast.error("Lỗi tạo test property!");
              }
            }}
          >
            Tạo Test Property
          </Button> */}
          <Link to="/admin/properties/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm Property
            </Button>
          </Link>
          {/* <Link to="/admin/properties/deleted">
            <Button variant="outline">
              Danh sách đã xóa
            </Button>
          </Link> */}
        </div>
      </div>

      {/* Filters + Tổng số properties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange("limit", Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              >
                <option value={10}>10 items/page</option>
                <option value={20}>20 items/page</option>
                <option value={50}>50 items/page</option>
              </select>
            </div>
            <div className="flex flex-col items-center justify-center border border-gray-300 bg-white rounded-md px-4 py-0 w-full min-h-[36px]">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-sm text-gray-600">Tổng số properties</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ảnh</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property._id}>
                      <TableCell>
                        <Link to={`/admin/properties/${property._id}`} title="Xem chi tiết">
                          {property.thumbnail ? (
                            <img
                              src={property.thumbnail}
                              alt={property.name}
                              style={{ width: 48, height: 32, objectFit: "cover", borderRadius: 4 }}
                              className="cursor-pointer hover:opacity-80"
                            />
                          ) : property.images && property.images.length > 0 ? (
                            <img
                              src={property.images[0]}
                              alt={property.name}
                              style={{ width: 48, height: 32, objectFit: "cover", borderRadius: 4 }}
                              className="cursor-pointer hover:opacity-80"
                            />
                          ) : (
                            <span className="text-gray-400">Không có ảnh</span>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link to={`/admin/properties/${property._id}`} title="Xem chi tiết">
                          <div className="max-w-xs truncate cursor-pointer hover:underline" title={property.name}>
                            {property.name}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={property.location?.address}>
                          {property.location?.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {property.staffIds?.length || 0} staff
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {property.createdAt
                            ? new Date(property.createdAt).toLocaleDateString("vi-VN")
                            : ""
                          }
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/properties/${property._id}`} title="Xem chi tiết">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/admin/properties/edit/${property._id}`} title="Chỉnh sửa">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {properties.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Không có properties nào
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > filters.limit && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handleFilterChange("page", Math.max(1, filters.page - 1))}
            disabled={filters.page === 1}
            className="flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-sm">
            Trang {filters.page} / {Math.ceil(total / filters.limit)}
          </span>
          <Button
            variant="outline"
            onClick={() => handleFilterChange("page", filters.page + 1)}
            disabled={filters.page >= Math.ceil(total / filters.limit)}
            className="flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
} 