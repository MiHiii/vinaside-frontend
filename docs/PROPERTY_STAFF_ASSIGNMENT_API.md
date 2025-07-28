# Property Staff Assignment API

## Tổng quan

API mới cho việc quản lý gán nhân viên cho tòa nhà đã được thay thế API cũ. API mới cung cấp các chức năng:

- Gán nhân viên cho tòa nhà
- Bỏ gán nhân viên khỏi tòa nhà
- Xem danh sách nhân viên theo tòa nhà
- Xem danh sách tòa nhà theo nhân viên
- Xem lịch sử gán nhân viên
- Kiểm tra trạng thái gán

## Endpoints

### 1. Gán nhân viên cho tòa nhà
```
POST /property-staff-assignment/assign
```

**Body:**
```json
{
  "propertyId": "property_id_here",
  "staffIds": ["staff_id_1", "staff_id_2"]
}
```

### 2. Bỏ gán nhân viên khỏi tòa nhà
```
POST /property-staff-assignment/unassign
```

**Body:**
```json
{
  "propertyId": "property_id_here",
  "staffIds": ["staff_id_1", "staff_id_2"]
}
```

### 3. Lấy danh sách nhân viên theo tòa nhà
```
GET /property-staff-assignment/property/{propertyId}/staff
```

### 4. Lấy danh sách tòa nhà theo nhân viên
```
GET /property-staff-assignment/staff/{staffId}/properties
```

### 5. Lấy lịch sử gán nhân viên
```
GET /property-staff-assignment/history?propertyId={propertyId}&staffId={staffId}&page={page}&limit={limit}
```

### 6. Kiểm tra trạng thái gán
```
GET /property-staff-assignment/check/{staffId}/{propertyId}
```

### 7. Lấy tất cả assignments
```
GET /property-staff-assignment/all
```

## Sử dụng trong Frontend

### 1. Import API service
```typescript
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";
```

### 2. Gán nhân viên
```typescript
const result = await propertyStaffAssignmentApi.assignStaff({
  propertyId: "property_id",
  staffIds: ["staff_id_1", "staff_id_2"]
});
```

### 3. Bỏ gán nhân viên
```typescript
const result = await propertyStaffAssignmentApi.unassignStaff({
  propertyId: "property_id",
  staffIds: ["staff_id_1"]
});
```

### 4. Lấy danh sách nhân viên theo tòa nhà
```typescript
const staff = await propertyStaffAssignmentApi.getStaffByProperty("property_id");
```

### 5. Lấy lịch sử gán
```typescript
const history = await propertyStaffAssignmentApi.getAssignmentHistory({
  propertyId: "property_id",
  page: 1,
  limit: 10
});
```

## Redux Store

### Thunks mới
- `assignStaffToProperty`
- `unassignStaffFromProperty`
- `getStaffByProperty`
- `getPropertiesByStaff`
- `checkStaffAssignment`

### Selectors mới
- `selectStaffByProperty`
- `selectStaffByPropertyLoading`
- `selectStaffByPropertyError`
- `selectPropertiesByStaff`
- `selectPropertiesByStaffLoading`
- `selectPropertiesByStaffError`
- `selectStaffAssignmentCheck`
- `selectStaffAssignmentCheckLoading`
- `selectStaffAssignmentCheckError`

## Components mới

### 1. PropertyStaffAssignment
Component để quản lý việc gán nhân viên cho một tòa nhà cụ thể.

### 2. PropertyStaffAssignmentList
Component để hiển thị danh sách tất cả assignments với filter và pagination.

### 3. PropertyStaffOverview
Component tổng quan về việc quản lý gán nhân viên.

## Pages mới

### 1. PropertyStaffManagement
Trang quản lý nhân viên cho một tòa nhà cụ thể.

### 2. PropertyStaffOverview
Trang tổng quan về việc quản lý gán nhân viên.

## Migration từ API cũ

### Thay đổi trong EditPropertyForm
```typescript
// Cũ
await dispatch(assignStaffToProperty({ id, staffIds }));

// Mới
const result = await dispatch(assignStaffToProperty({ id, staffIds }));
if (assignStaffToProperty.rejected.match(result)) {
  toast.error("Gán nhân viên thất bại!");
} else {
  toast.success("Gán nhân viên thành công!");
}
```

### Thay đổi trong CreatePropertyForm
API cũ vẫn hoạt động cho việc tạo property với staffIds, nhưng khuyến nghị sử dụng API mới để gán nhân viên sau khi tạo property.

## Lưu ý

1. API mới yêu cầu quyền `property_staff.edit` để gán/bỏ gán nhân viên
2. API mới yêu cầu quyền `property_staff.view` để xem thông tin
3. Tất cả các thao tác đều được log lại trong lịch sử
4. API mới hỗ trợ pagination cho các endpoint lấy danh sách
5. API mới trả về thông tin chi tiết hơn bao gồm thông tin người gán và thời gian gán 