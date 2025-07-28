import { api } from "./api";

export interface AssignStaffDto {
  propertyId: string;
  staffId: string;
  role?: string;
}

export interface UnassignStaffDto {
  propertyId: string;
  staffId: string;
}

export interface GetStaffAssignmentsDto {
  propertyId?: string;
  staffId?: string;
  page?: number;
  limit?: number;
}

export const propertyStaffAssignmentApi = {
  // Gán nhân viên cho property
  assignStaff: async (assignStaffDto: AssignStaffDto) => {
    const response = await api.post("/property-staff-assignment/assign", assignStaffDto);
    return response.data;
  },

  // Bỏ gán nhân viên khỏi property
  unassignStaff: async (unassignStaffDto: UnassignStaffDto) => {
    const response = await api.post("/property-staff-assignment/unassign", unassignStaffDto);
    return response.data;
  },

  // Lấy danh sách nhân viên theo property
  getStaffByProperty: async (propertyId: string) => {
    const response = await api.get(`/property-staff-assignment/property/${propertyId}/staff`);
    return response.data;
  },

  // Lấy danh sách property theo nhân viên
  getPropertiesByStaff: async (staffId: string) => {
    const response = await api.get(`/property-staff-assignment/staff/${staffId}/properties`);
    return response.data;
  },

  // Lấy lịch sử gán nhân viên
  getAssignmentHistory: async (queryDto: GetStaffAssignmentsDto) => {
    // Chỉ gửi các tham số có giá trị và MongoDB ID hợp lệ
    const cleanParams = Object.fromEntries(
      Object.entries(queryDto).filter(([key, value]) => {
        if (value === "" || value === undefined || value === null) return false;
        
        // Validate MongoDB ID cho propertyId và staffId
        if ((key === 'propertyId' || key === 'staffId') && typeof value === 'string') {
          // MongoDB ID phải có đúng 24 ký tự hex
          const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
          if (!mongoIdRegex.test(value)) {
            console.warn(`Invalid MongoDB ID for ${key}: ${value}`);
            return false;
          }
        }
        
        return true;
      })
    );
    
    console.log('Clean params:', cleanParams);
    const response = await api.get("/property-staff-assignment/history", { params: cleanParams });
    return response.data;
  },

  // Kiểm tra nhân viên có được gán cho property không
  checkStaffAssignment: async (staffId: string, propertyId: string) => {
    const response = await api.get(`/property-staff-assignment/check/${staffId}/${propertyId}`);
    return response.data;
  },

  // Lấy tất cả assignments
  getAllAssignments: async () => {
    const response = await api.get("/property-staff-assignment/all");
    return response.data;
  },
}; 