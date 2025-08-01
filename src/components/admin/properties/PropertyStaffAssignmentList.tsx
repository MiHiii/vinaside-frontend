import React, { useState, useEffect } from "react";
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { toast } from "react-hot-toast";
import { Users, Building2, Calendar, UserCheck, ChevronLeft, ChevronRight, Filter, X, BarChart3 } from "lucide-react";

interface Assignment {
  _id: string;
  propertyId: {
    _id: string;
    name: string;
    type: string;
    images?: string[];
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
}

export default function PropertyStaffAssignmentList({ 
  isAdmin = false
}: PropertyStaffAssignmentListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // State cho input values (không trigger API call)
  const [inputValues, setInputValues] = useState({
    staffId: "",
  });
  
  // State cho filters (sẽ trigger API call)
  const [filters, setFilters] = useState({
    staffId: "",
    page: 1,
    limit: 10
  });

  // Mock stats data - bạn có thể thay thế bằng API call thực tế
  const stats = {
    totalAssignments: 15,
    activeAssignments: 15,
    totalProperties: 4,
    totalStaff: 6
  };

  const loadAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Sending filters to API:', filters);
      const response = await propertyStaffAssignmentApi.getAssignmentHistory(filters);
      console.log('API response:', response);
      setAssignments(response.data || []);
    } catch (error) {
      console.error('API error:', error);
      setError("Không thể tải danh sách gán nhân viên");
      toast.error("Không thể tải danh sách gán nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [filters, isAdmin]);

  // Xử lý thay đổi input (chỉ cập nhật state, không tự động tìm kiếm)
  const handleInputChange = (key: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Xử lý khi nhấn Enter hoặc click tìm kiếm
  const handleSearch = () => {
    const newFilters = {
      staffId: inputValues.staffId.trim(),
      page: 1,
      limit: filters.limit
    };
    
    setFilters(newFilters);
  };

  // Xử lý khi nhấn Enter trong input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Xử lý thay đổi limit (vẫn gọi API ngay lập tức)
  const handleLimitChange = (value: string) => {
    setFilters(prev => ({...prev,
      limit: parseInt(value),
      page: 1
    }));
    setCurrentPage(1); // Reset về trang 1 khi thay đổi limit
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

  // Tính toán pagination
  const totalPages = Math.ceil(assignments.length / filters.limit);
  const startIndex = (currentPage - 1) * filters.limit;
  const endIndex = startIndex + filters.limit;
  const currentAssignments = assignments.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Staff & Properties</h1>
              <p className="text-gray-600">Theo dõi và quản lý việc gán nhân viên cho các tòa nhà</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              Admin Mode
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Assignments</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAssignments}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Assignments</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeAssignments}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Properties</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProperties}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Staff</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStaff}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Bộ lọc tìm kiếm</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="staffId" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              ID nhân viên
            </Label>
            <div className="relative">
              <Input
                id="staffId"
                placeholder="Nhập ID nhân viên (24 ký tự)..."
                value={inputValues.staffId}
                onChange={(e) => handleInputChange('staffId', e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-white/60 backdrop-blur-sm border border-white/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              />
              {inputValues.staffId && (
                <button
                  type="button"
                  onClick={() => handleInputChange('staffId', '')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Số lượng hiển thị
            </Label>
            <Select
              value={filters.limit.toString()}
              onValueChange={handleLimitChange}
            >
              <SelectTrigger className="bg-white/60 backdrop-blur-sm border border-white/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:bg-white/80 hover:border-blue-300 shadow-sm hover:shadow-md">
                <SelectValue className="text-gray-700 font-medium" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border border-white/30 shadow-xl rounded-xl overflow-hidden">
                <SelectItem 
                  value="10" 
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 focus:bg-gradient-to-r focus:from-blue-50 focus:to-purple-50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">10 bản ghi</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </div>
                </SelectItem>
                <SelectItem 
                  value="20" 
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 focus:bg-gradient-to-r focus:from-blue-50 focus:to-purple-50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">20 bản ghi</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </div>
                </SelectItem>
                <SelectItem 
                  value="30" 
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 focus:bg-gradient-to-r focus:from-blue-50 focus:to-purple-50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">30 bản ghi</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </div>
                </SelectItem>
                <SelectItem  
                  value="40" 
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 focus:bg-gradient-to-r focus:from-blue-50 focus:to-purple-50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">40 bản ghi</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            {error}
          </div>
        </div>
      )}

      {/* Assignments list */}
      <div className="space-y-4">
        {currentAssignments.length > 0 ? (
          currentAssignments.map((assignment) => (
            <div
              key={assignment._id}
              className="group relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {assignment.propertyId?.images && assignment.propertyId.images.length > 0 ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-white">
                          <img 
                            src={assignment.propertyId.images[0]} 
                            alt={assignment.propertyId.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {assignment.propertyId?.name || 'Tòa nhà không xác định'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Building2 className="w-4 h-4" />
                            <span>Được gán cho</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {assignment.staffId?.name || 'Nhân viên không xác định'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {assignment.staffId?.email || 'Email không xác định'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          <span>Gán bởi: {assignment.assignedBy?.name || 'Không xác định'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(assignment.assignedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có lịch sử gán nhân viên</h3>
            <p className="text-gray-500">Chưa có hoạt động gán nhân viên nào được thực hiện</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {assignments.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
            Trước
          </Button>
          
          <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg">
            Trang {currentPage} / {totalPages}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Sau
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}