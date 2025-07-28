import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";
import { toast } from "react-hot-toast";
import PropertyStaffAssignmentList from "@/components/admin/properties/PropertyStaffAssignmentList";

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
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      // Load tất cả assignments để tính toán stats
      const allAssignments = await propertyStaffAssignmentApi.getAllAssignments();
      
      // Load recent assignments
      const recent = await propertyStaffAssignmentApi.getAssignmentHistory({
        page: 1,
        limit: 5
      });

      // Tính toán stats
      const uniqueProperties = new Set(allAssignments.data?.map((a: Assignment) => a.propertyId?._id || a.propertyId) || []);
      const uniqueStaff = new Set(allAssignments.data?.map((a: Assignment) => a.staffId?._id || a.staffId) || []);
      
      setStats({
        totalAssignments: allAssignments.data?.length || 0,
        activeAssignments: allAssignments.data?.length || 0, // Giả sử tất cả đều active
        totalProperties: uniqueProperties.size,
        totalStaff: uniqueStaff.size
      });

      setRecentAssignments(recent.data || []);
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
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản lý gán nhân viên</h1>
        <p className="text-gray-600">
          Tổng quan về việc gán nhân viên cho các tòa nhà
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số gán</CardTitle>
            <Badge variant="secondary">{stats?.totalAssignments || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAssignments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số lần gán nhân viên
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gán hiện tại</CardTitle>
            <Badge variant="outline">{stats?.activeAssignments || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeAssignments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Số gán đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tòa nhà</CardTitle>
            <Badge variant="secondary">{stats?.totalProperties || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
            <p className="text-xs text-muted-foreground">
              Số tòa nhà có nhân viên
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhân viên</CardTitle>
            <Badge variant="outline">{stats?.totalStaff || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStaff || 0}</div>
            <p className="text-xs text-muted-foreground">
              Số nhân viên được gán
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recent">Gán gần đây</TabsTrigger>
          <TabsTrigger value="history">Lịch sử đầy đủ</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gán nhân viên gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAssignments.length > 0 ? (
                <div className="space-y-4">
                  {recentAssignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
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
                            Được gán cho {assignment.propertyId?.name || 'Không xác định'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {formatDate(assignment.assignedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Không có gán nhân viên gần đây
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <PropertyStaffAssignmentList />
        </TabsContent>
      </Tabs>
    </div>
  );
} 