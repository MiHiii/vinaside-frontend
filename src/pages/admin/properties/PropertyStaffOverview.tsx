import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";
import { toast } from "react-hot-toast";
import PropertyStaffAssignmentList from "@/components/admin/properties/PropertyStaffAssignmentList";
import { Users, Building2, UserCheck, Activity, Calendar, ArrowRight, TrendingUp, Users2, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface AssignmentStats {
  totalAssignments: number;
  activeAssignments: number;
  totalProperties: number;
  totalStaff: number;
}

interface RecentAssignment {
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

export default function PropertyStaffOverview() {
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [allAssignments, setAllAssignments] = useState<RecentAssignment[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadOverviewData();
  }, []);

  // Tính toán assignments cho trang hiện tại
  useEffect(() => {
    if (allAssignments.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentAssignments = allAssignments.slice(startIndex, endIndex);
      setRecentAssignments(currentAssignments);
    }
  }, [allAssignments, currentPage]);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      // Load tất cả assignments để tính toán stats và pagination
      const allAssignmentsResponse = await propertyStaffAssignmentApi.getAllAssignments();
      const allAssignmentsData = allAssignmentsResponse.data || [];
      
      // Tính toán stats
      const uniqueProperties = new Set(allAssignmentsData.map((a: Assignment) => a.propertyId?._id || a.propertyId) || []);
      const uniqueStaff = new Set(allAssignmentsData.map((a: Assignment) => a.staffId?._id || a.staffId) || []);
      
      setStats({
        totalAssignments: allAssignmentsData.length || 0,
        activeAssignments: allAssignmentsData.length || 0, // Giả sử tất cả đều active
        totalProperties: uniqueProperties.size,
        totalStaff: uniqueStaff.size
      });

      // Lưu tất cả assignments để pagination
      setAllAssignments(allAssignmentsData);
      
      // Tính toán tổng số trang
      const total = allAssignmentsData.length || 0;
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch {
      toast.error("Không thể tải dữ liệu tổng quan");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="flex justify-center items-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Quản lý gán nhân viên
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tổng quan về việc gán nhân viên cho các tòa nhà và quản lý hiệu quả nguồn lực
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
                  {stats?.totalAssignments || 0}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">{stats?.totalAssignments || 0}</div>
                <p className="text-sm text-gray-600 font-medium">Tổng số gán</p>
                <p className="text-xs text-gray-500">Tổng số lần gán nhân viên</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
                  {stats?.activeAssignments || 0}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">{stats?.activeAssignments || 0}</div>
                <p className="text-sm text-gray-600 font-medium">Gán hiện tại</p>
                <p className="text-xs text-gray-500">Số gán đang hoạt động</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200">
                  {stats?.totalProperties || 0}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">{stats?.totalProperties || 0}</div>
                <p className="text-sm text-gray-600 font-medium">Tòa nhà</p>
                <p className="text-xs text-gray-500">Số tòa nhà có nhân viên</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200">
                  {stats?.totalStaff || 0}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">{stats?.totalStaff || 0}</div>
                <p className="text-sm text-gray-600 font-medium">Nhân viên</p>
                <p className="text-xs text-gray-500">Số nhân viên được gán</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <Tabs defaultValue="recent" className="w-full">
            <div className="border-b border-gray-200/50">
              <TabsList className="grid w-full grid-cols-2 bg-transparent border-none p-0 h-16">
                <TabsTrigger 
                  value="recent" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-none border-none h-full text-base font-medium transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Gán gần đây
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-none border-none h-full text-base font-medium transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Lịch sử đầy đủ
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="recent" className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Gán nhân viên gần đây</h2>
              </div>
              
              {recentAssignments.length > 0 ? (
                <div className="space-y-4">
                  {recentAssignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      className="group relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">
                                  {assignment.staffId?.name?.charAt(0)?.toUpperCase() || 'N'}
                                </span>
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="space-y-1">
                              <p className="font-semibold text-gray-900 text-lg">
                                {assignment.staffId?.name || 'Không xác định'}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>Được gán cho {assignment.propertyId?.name || 'Không xác định'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Users2 className="w-3 h-3" />
                                <span>Gán bởi {assignment.assignedBy?.name || 'Hệ thống'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(assignment.assignedAt)}</span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Sau
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có gán nhân viên gần đây</h3>
                  <p className="text-gray-500">Chưa có hoạt động gán nhân viên nào được thực hiện</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Lịch sử gán nhân viên</h2>
              </div>
              <PropertyStaffAssignmentList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 