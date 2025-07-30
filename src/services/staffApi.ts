import { api } from "./api";

export interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role?: string;
  createdAt?: string;
  is_verified?: boolean;
}

export interface StaffWithProperties extends StaffMember {
  properties?: Array<{
    _id: string;
    name: string;
    location?: {
      address: string;
      city?: string;
      district?: string;
    };
    thumbnail?: string;
    status?: string;
  }>;
}

export const staffApi = {
  // Lấy danh sách tất cả nhân viên
  getAllStaff: () => {
    return api.get<{
      success: boolean;
      data: {
        data: StaffMember[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          itemsPerPage: number;
        };
      };
      statusCode: number;
      message: string;
    }>("/users/staff");
  },

  // Lấy thông tin nhân viên theo ID
  getStaffById: (staffId: string) => {
    return api.get<StaffMember>(`/staff/${staffId}`);
  },

  // Lấy danh sách homestay mà nhân viên quản lý
  getPropertiesByStaff: (staffId: string) => {
    return api.get<{
      success: boolean;
      data: Array<{
        _id: string;
        propertyId: {
          _id: string;
          name: string;
          type: string;
        };
        staffId: string;
        assignedBy: {
          _id: string;
          name: string;
          email: string;
        };
        status: string;
        assignedAt: string;
        notes?: string;
        createdAt: string;
        updatedAt: string;
      }>;
      statusCode: number;
      message: string;
    }>(`/property-staff-assignment/staff/${staffId}/properties`);
  },

  // Tạo nhân viên mới
  createStaff: (staffData: Omit<StaffMember, "_id" | "createdAt" | "updatedAt">) => {
    return api.post<StaffMember>("/staff", staffData);
  },

  // Cập nhật thông tin nhân viên
  updateStaff: (staffId: string, staffData: Partial<StaffMember>) => {
    return api.put<StaffMember>(`/staff/${staffId}`, staffData);
  },

  // Xóa nhân viên
  deleteStaff: (staffId: string) => {
    return api.delete(`/staff/${staffId}`);
  },

  // Gán homestay cho nhân viên
  assignPropertyToStaff: (staffId: string, propertyId: string, role?: string) => {
    return api.post("/property-staff-assignment", {
      staffId,
      propertyId,
      role: role || "Staff"
    });
  },

  // Hủy gán homestay cho nhân viên
  unassignPropertyFromStaff: (staffId: string, propertyId: string) => {
    return api.delete(`/property-staff-assignment/${staffId}/${propertyId}`);
  }
}; 