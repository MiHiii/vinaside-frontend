import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";
import { toast } from "react-hot-toast";
import PropertyStaffAssignmentList from "@/components/admin/properties/PropertyStaffAssignmentList";
import { useUserRole } from "@/hooks/useUserRole";

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
  const { isAdmin, isStaff, hasPermission } = useUserRole();
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      // Chỉ admin mới có thể xem tất cả assignments
      if (isAdmin) {
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
          activeAssignments: allAssignments.data?.length || 0,
          totalProperties: uniqueProperties.size,
          totalStaff: uniqueStaff.size
        });

        setRecentAssignments(recent.data || []);
      } else if (isStaff) {
        // Staff chỉ thấy assignments của mình
        const myAssignments = await propertyStaffAssignmentApi.getPropertiesByStaff();
        
        setStats({
          totalAssignments: myAssignments.data?.length || 0,
          activeAssignments: myAssignments.data?.length || 0,
          totalProperties: myAssignments.data?.length || 0,
          totalStaff: 1 // Chỉ có mình
        });

        setRecentAssignments(myAssignments.data || []);
      }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isAdmin ? "Quản lý Staff & Properties" : "Properties của tôi"}
        </h1>
        {isAdmin && hasPermission('property_staff.edit') && (
          <Badge variant="outline" className="text-sm">
            Admin Mode
          </Badge>
        )}
        {isStaff && (
          <Badge variant="secondary" className="text-sm">
            Staff Mode
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      {!loading && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isAdmin ? "Tổng Assignments" : "Properties được assign"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isAdmin ? "Active Assignments" : "Properties đang quản lý"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAssignments}</div>
            </CardContent>
          </Card>
          
          {isAdmin && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProperties}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng Staff</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStaff}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assignments">
            {isAdmin ? "Tất cả Assignments" : "Properties của tôi"}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="management">Quản lý Staff</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="assignments" className="space-y-4">
          <PropertyStaffAssignmentList 
            isAdmin={isAdmin}
            canManage={hasPermission('property_staff.edit')}
          />
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="management" className="space-y-4">
            {/* Admin management content */}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 