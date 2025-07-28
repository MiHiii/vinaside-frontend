import React, { useState, useEffect } from "react";
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";

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

export default function PropertyStaffAssignmentList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
      const response = await propertyStaffAssignmentApi.getAssignmentHistory(filters);
      setAssignments(response.data || []);
    } catch {
      setError("Không thể tải danh sách gán nhân viên");
      toast.error("Không thể tải danh sách gán nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [filters]);

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
        <CardTitle>Lịch sử gán nhân viên</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                     {/* <div>
              <Label htmlFor="propertyId">Tòa nhà</Label>
              <div className="relative">
                <Input
                  id="propertyId"
                  placeholder="Nhập MongoDB ID tòa nhà và nhấn Ent"
                  value={inputValues.propertyId}
                  onChange={(e) => handleInputChange('propertyId', e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                {inputValues.propertyId && (
                  <button
                    type="button"
                    onClick={() => handleInputChange('propertyId', '')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
           </div> */}
                      <div>
              <Label htmlFor="staffId">Nhân viên</Label>
              <div className="relative">
                <Input
                  id="staffId"
                  placeholder="Nhập ID nhân viên ..."
                  value={inputValues.staffId}
                  onChange={(e) => handleInputChange('staffId', e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                {inputValues.staffId && (
                  <button
                    type="button"
                    onClick={() => handleInputChange('staffId', '')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          <div>
            <Label htmlFor="limit">Số lượng hiển thị</Label>
            <Select
              value={filters.limit.toString()}
              onValueChange={handleLimitChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        


        {/* Error message */}
        {error && (
          <div className="text-red-500 text-center py-4 mb-4">
            {error}
          </div>
        )}

        {/* Assignments list */}
        <div className="space-y-4">
          {assignments.length > 0 ? (
            assignments.map((assignment) => (
              <div
                key={assignment._id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">
                          {assignment.propertyId?.name || 'Tòa nhà không xác định'}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {assignment.staffId?.name || 'Nhân viên không xác định'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {assignment.staffId?.email || 'Email không xác định'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>
                          Gán bởi: {assignment.assignedBy?.name || 'Không xác định'}
                        </span>
                        <span>
                          Ngày gán: {formatDate(assignment.assignedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không có lịch sử gán nhân viên nào
            </div>
          )}
        </div>

        {/* Pagination */}
        {assignments.length > 0 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <Button
              variant="outline"
              disabled={filters.page <= 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Trước
            </Button>
            <span className="text-sm text-gray-600">
              Trang {filters.page}
            </span>
            <Button
              variant="outline"
              disabled={assignments.length < filters.limit}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Sau
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 