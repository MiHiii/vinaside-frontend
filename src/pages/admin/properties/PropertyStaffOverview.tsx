import React, { useState, useEffect } from "react";

import { Tabs, TabsContent } from "@/components/ui/tabs";

import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";
import { toast } from "react-hot-toast";
import PropertyStaffAssignmentList from "@/components/admin/properties/PropertyStaffAssignmentList";
import { useUserRole } from "@/hooks/useUserRole";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';





export default function PropertyStaffOverview() {
  const { isAdmin, isStaff } = useUserRole();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      // Admin and staff functionality simplified - stats removed
      if (isAdmin) {
        // Admin functionality
      } else if (isStaff) {
        // Staff chỉ thấy assignments của mình
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
        
        const myAssignments = await propertyStaffAssignmentApi.getPropertiesByStaff(userId);
        
        console.log("=== DEBUG INFO ===");
        console.log("User ID:", userId);
        console.log("User Object:", user);
        console.log("Is Staff:", isStaff);
        console.log("API Response:", myAssignments);
        console.log("Response Data:", myAssignments.data);
        console.log("Response Data.data:", myAssignments.data?.data);
        console.log("==================");
        
        // Stats calculation removed since stats cards are not displayed
      }
    } catch {
      toast.error("Không thể tải dữ liệu tổng quan");
    } finally {
      setLoading(false);
    }
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
    

      

      {/* Tabs */}
      <Tabs defaultValue="assignments" className="space-y-4">
        {/* <TabsList>
          <TabsTrigger value="assignments">
            {isAdmin ? "Tất cả Assignments" : "Properties của tôi"}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="management">Quản lý Staff</TabsTrigger>
          )}
        </TabsList>
         */}
        <TabsContent value="assignments" className="space-y-4">
          <PropertyStaffAssignmentList 
            isAdmin={isAdmin}
           
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