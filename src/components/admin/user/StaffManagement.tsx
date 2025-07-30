import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "react-hot-toast";
import { staffApi, StaffWithProperties, StaffMember } from "@/services/staffApi";
import { 
  Users, 
  Building2, 
  Search, 
  UserPlus,
  Mail,
  MapPin,
  Phone
} from "lucide-react";

export default function StaffManagement() {
  const [staffMembers, setStaffMembers] = useState<StaffWithProperties[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStaff, setFilteredStaff] = useState<StaffWithProperties[]>([]);

  // Load staff data
  useEffect(() => {
    const loadStaffData = async () => {
      setLoading(true);
      try {
        // Lấy danh sách tất cả nhân viên
        const allStaffResponse = await staffApi.getAllStaff();
        const allStaff = (allStaffResponse.data as any).data.data as StaffMember[]; // Array of staff members

        // Lấy thông tin homestay cho từng nhân viên
        const staffWithProperties = await Promise.all(
          allStaff.map(async (staff: StaffWithProperties) => {
            try {
              const propertiesResponse = await staffApi.getPropertiesByStaff(staff._id);
              
              // Transform assignments to properties format
              const assignments = (propertiesResponse.data as any).data;
              
              // Filter out assignments with null propertyId
              const validAssignments = assignments.filter((assignment: any) => assignment.propertyId !== null);
              
              const properties = validAssignments.map((assignment: any) => ({
                _id: assignment.propertyId._id,
                name: assignment.propertyId.name,
                type: assignment.propertyId.type,
                status: assignment.status,
                assignedAt: assignment.assignedAt
              }));
              
              return {
                ...staff,
                properties: properties
              };
            } catch (error) {
              console.error(`Error loading properties for staff ${staff._id}:`, error);
              return {
                ...staff,
                properties: []
              };
            }
          })
        );

        setStaffMembers(staffWithProperties);
        setFilteredStaff(staffWithProperties);
      } catch (error) {
        console.error("Error loading staff data:", error);
        toast.error("Không thể tải danh sách nhân viên");
      } finally {
        setLoading(false);
      }
    };

    loadStaffData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStaff(staffMembers);
    } else {
      const filtered = staffMembers.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStaff(filtered);
    }
  }, [searchTerm, staffMembers]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300 text-lg">Đang tải danh sách nhân viên...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Quản lý Nhân viên
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Quản lý thông tin nhân viên và homestay được gán
                </p>
              </div>
            </div>
       
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng nhân viên</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{staffMembers.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Đang quản lý</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {staffMembers.filter(staff => staff.properties && staff.properties.length > 0).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chưa gán</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {staffMembers.filter(staff => !staff.properties || staff.properties.length === 0).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
       
          </div>
        </div>

        {/* Staff List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Danh sách nhân viên ({filteredStaff.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStaff.map((staff) => (
              <div key={staff._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={staff.avatar_url} alt={staff.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-semibold">
                      {getInitials(staff.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Staff Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {staff.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {staff.email}
                          </div>
                          {staff.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {staff.phone}
                            </div>
                          )}
                        </div>
                      </div>


                    </div>

                    {/* Properties */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Homestay quản lý ({staff.properties?.length || 0})
                        </span>
                      </div>

                      {staff.properties && staff.properties.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {staff.properties.map((property) => (
                            <div
                              key={property._id}
                              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex items-start gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Building2 className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {property.name}
                                  </h4>
                                  {property.location?.address && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <MapPin className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {property.location.address}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                          <UserPlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Chưa được gán homestay nào
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredStaff.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Không tìm thấy nhân viên
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Thử thay đổi từ khóa tìm kiếm hoặc thêm nhân viên mới
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 