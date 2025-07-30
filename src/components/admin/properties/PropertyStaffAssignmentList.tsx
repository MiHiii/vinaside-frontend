import React, { useState, useEffect } from "react";
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface Assignment {
  _id: string;
  propertyId: {
    _id: string;
    name: string;
    type: string;
  };
  staffId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
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

interface PropertyStaffAssignmentListProps {
  isAdmin?: boolean;
  canManage?: boolean;
}

export default function PropertyStaffAssignmentList({ 
  isAdmin = false, 
  canManage = false 
}: PropertyStaffAssignmentListProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debug: Log user info
  console.log("Redux user:", user);
  console.log("LocalStorage user:", localStorage.getItem("user"));
  
  // State cho input values (không trigger API call)
  const [inputValues, setInputValues] = useState({
    propertyId: "",
    staffId: "",
  });
  
  // State cho filters (sẽ trigger API call)
  const [filters, setFilters] = useState({
    propertyId: "",
    staffId: "",
    page: 1,
    limit: 10
  });

  const loadAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      
      if (isAdmin) {
        // Admin có thể xem tất cả assignments
        response = await propertyStaffAssignmentApi.getAssignmentHistory(filters);
      } else {
        // Staff chỉ xem assignments của mình - sử dụng user ID thực
        console.log("User object:", user); // Debug log
        console.log("User ID:", user?._id); // Debug log
        
        // Fallback: Lấy user từ localStorage nếu Redux chưa có
        let userId = user?._id;
        if (!userId) {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              userId = parsedUser._id;
              console.log("Using localStorage user ID:", userId);
            } catch (e) {
              console.error("Error parsing localStorage user:", e);
            }
          }
        }
        
        if (!userId) {
          throw new Error("Không tìm thấy thông tin user");
        }
        response = await propertyStaffAssignmentApi.getPropertiesByStaff(userId);
      }
      
      setAssignments(response.data || []);
    } catch (error) {
      console.error("Load assignments error:", error); // Debug log
      setError("Không thể tải danh sách gán nhân viên");
      toast.error("Không thể tải danh sách gán nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [filters, isAdmin]);

  // Làm sạch filters khi component mount để đảm bảo không có giá trị không hợp lệ
  useEffect(() => {
    const cleanFilters = {
      propertyId: filters.propertyId.replace(/[^0-9a-fA-F]/gi, '').slice(0, 24),
      staffId: filters.staffId.replace(/[^0-9a-fA-F]/gi, '').slice(0, 24),
      page: filters.page,
      limit: filters.limit
    };
    
    // Chỉ cập nhật nếu có thay đổi
    if (cleanFilters.propertyId !== filters.propertyId || cleanFilters.staffId !== filters.staffId) {
      setFilters(cleanFilters);
    }
  }, []); // Chỉ chạy một lần khi component mount

  // Xử lý thay đổi input (tự động tìm kiếm khi đủ 24 ký tự)
  const handleInputChange = (key: string, value: string) => {
    let cleanValue = value;
    
    // Nếu là propertyId hoặc staffId, giới hạn độ dài và chỉ cho phép hex
    if (key === 'propertyId' || key === 'staffId') {
      // Loại bỏ các ký tự không phải hex và giới hạn 24 ký tự
      cleanValue = value.replace(/[^0-9a-fA-F]/gi, '').slice(0, 24);
    }
    
    setInputValues(prev => {
      const newInputValues = {
        ...prev,
        [key]: cleanValue
      };
      
      // Tự động tìm kiếm nếu đủ 24 ký tự
      if (key === 'propertyId' || key === 'staffId') {
        const otherKey = key === 'propertyId' ? 'staffId' : 'propertyId';
        const otherValue = prev[otherKey];
        
        // Nếu ID hiện tại đủ 24 ký tự hoặc cả hai đều rỗng
        if (cleanValue.length === 24 || (cleanValue === "" && otherValue === "")) {
          const newFilters = {
            propertyId: newInputValues.propertyId.length === 24 ? newInputValues.propertyId : "",
            staffId: newInputValues.staffId.length === 24 ? newInputValues.staffId : "",
            page: 1,
            limit: filters.limit
          };
          
          // Delay một chút để tránh gọi API quá nhiều
          setTimeout(() => {
            setFilters(newFilters);
          }, 500);
        }
      }
      
      return newInputValues;
    });
  };

  // Xử lý khi nhấn Enter hoặc click tìm kiếm
  const handleSearch = () => {
    // Làm sạch giá trị input
    const cleanPropertyId = inputValues.propertyId.trim().replace(/[^0-9a-fA-F]/gi, '').slice(0, 24);
    const cleanStaffId = inputValues.staffId.trim().replace(/[^0-9a-fA-F]/gi, '').slice(0, 24);
    
    // Chỉ gửi nếu đủ 24 ký tự hoặc rỗng
    const newFilters = {
      propertyId: cleanPropertyId.length === 24 ? cleanPropertyId : "",
      staffId: cleanStaffId.length === 24 ? cleanStaffId : "",
      page: 1,
      limit: filters.limit
    };
    
    // Kiểm tra xem có ít nhất một ID hợp lệ không
    const hasValidId = (cleanPropertyId.length === 24) || (cleanStaffId.length === 24);
    
    if (hasValidId || (cleanPropertyId === "" && cleanStaffId === "")) {
      setFilters(newFilters);
    } else {
      // Nếu không có ID hợp lệ, hiển thị thông báo
      toast.error("Vui lòng nhập đầy đủ 24 ký tự MongoDB ID hoặc để trống để xem tất cả");
    }
  };

  // Xử lý khi nhấn Enter trong input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Xử lý thay đổi limit (vẫn gọi API ngay lập tức)
  const handleLimitChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      limit: parseInt(value),
      page: 1
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử gán nhân viên</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {isAdmin ? "Tất cả Property Assignments" : "Properties của tôi"}
          </span>
          {isAdmin && (
            <Badge variant="outline">Admin View</Badge>
          )}
          {!isAdmin && (
            <Badge variant="secondary">Staff View</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search Filters - Chỉ hiển thị cho admin có quyền quản lý */}
        {isAdmin && canManage && (
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="propertyId">Property ID</Label>
                <Input
                  id="propertyId"
                  placeholder="Nhập Property ID (24 ký tự hex)"
                  value={inputValues.propertyId}
                  onChange={(e) => handleInputChange('propertyId', e.target.value)}
                  onKeyPress={handleKeyPress}
                  maxLength={24}
                />
              </div>
              <div>
                <Label htmlFor="staffId">Staff ID</Label>
                <Input
                  id="staffId"
                  placeholder="Nhập Staff ID (24 ký tự hex)"
                  value={inputValues.staffId}
                  onChange={(e) => handleInputChange('staffId', e.target.value)}
                  onKeyPress={handleKeyPress}
                  maxLength={24}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "Đang tìm..." : "Tìm kiếm"}
              </Button>
              <Button variant="outline" onClick={() => {
                setInputValues({ propertyId: "", staffId: "" });
                setFilters({ propertyId: "", staffId: "", page: 1, limit: filters.limit });
              }} disabled={loading}>
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {isAdmin ? "Không có assignment nào" : "Bạn chưa được assign property nào"}
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div
                key={assignment._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {assignment.staffId?.name?.charAt(0)?.toUpperCase() || 'N'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{assignment.staffId?.name || 'Không xác định'}</p>
                    <p className="text-sm text-gray-600">
                      {isAdmin ? (
                        <>
                          Được gán cho {assignment.propertyId?.name || 'Không xác định'}
                          {assignment.assignedBy && (
                            <span className="ml-2 text-xs text-gray-400">
                              bởi {assignment.assignedBy.name}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          Property: {assignment.propertyId?.name || 'Không xác định'}
                          <span className="ml-2 text-xs text-gray-400">
                            ({assignment.propertyId?.type || 'N/A'})
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {formatDate(assignment.assignedAt)}
                  </p>
                  <Badge 
                    variant={assignment.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {assignment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination - Chỉ hiển thị cho admin */}
        {isAdmin && assignments.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label htmlFor="limit">Hiển thị:</Label>
              <Select value={filters.limit.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-500">
              Trang {filters.page} - {assignments.length} kết quả
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 