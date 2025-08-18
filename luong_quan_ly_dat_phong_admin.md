# Luồng Quản Lý Đặt Phòng - Admin

## 1. DASHBOARD TỔNG QUAN
### 1.1 Màn hình chính
- **Tổng số đặt phòng hôm nay**
- **Số phòng đang có khách**
- **Số phòng trống**
- **Doanh thu ngày**
- **Đặt phòng chờ xác nhận**

### 1.2 Thông báo real-time
- Đặt phòng mới
- Hủy đặt phòng
- Check-in/Check-out
- Sự cố phòng

## 2. QUẢN LÝ ĐẶT PHÒNG

### 2.1 Xem danh sách đặt phòng
```
Admin → Booking Management → Danh sách đặt phòng
├── Lọc theo:
│   ├── Trạng thái (Chờ xác nhận/Đã xác nhận/Đang ở/Hoàn thành/Hủy)
│   ├── Ngày check-in/check-out
│   ├── Loại phòng
│   ├── Khách hàng
│   └── Nhân viên xử lý
├── Sắp xếp theo:
│   ├── Thời gian đặt
│   ├── Ngày check-in
│   └── Giá tiền
└── Tìm kiếm theo:
    ├── Mã đặt phòng
    ├── Tên khách hàng
    ├── Số điện thoại
    └── Email
```

### 2.2 Xử lý đặt phòng mới
```
1. Nhận thông báo đặt phòng mới
2. Xem chi tiết đặt phòng
   ├── Thông tin khách hàng
   ├── Thông tin phòng
   ├── Ngày check-in/check-out
   ├── Số khách
   └── Yêu cầu đặc biệt
3. Kiểm tra tính khả dụng
   ├── Phòng có sẵn không?
   ├── Có xung đột lịch không?
   └── Đáp ứng yêu cầu không?
4. Quyết định:
   ├── Xác nhận đặt phòng
   ├── Từ chối (có lý do)
   └── Yêu cầu thêm thông tin
5. Thông báo kết quả cho khách
```

### 2.3 Xác nhận đặt phòng
```
1. Chọn đặt phòng cần xác nhận
2. Kiểm tra lại thông tin
3. Xác nhận đặt phòng
4. Hệ thống tự động:
   ├── Cập nhật trạng thái phòng
   ├── Gửi email xác nhận
   ├── Tạo hóa đơn
   └── Cập nhật lịch
5. Gán nhân viên phụ trách
```

### 2.4 Chỉnh sửa đặt phòng
```
1. Tìm đặt phòng cần chỉnh sửa
2. Chọn "Chỉnh sửa"
3. Có thể thay đổi:
   ├── Ngày check-in/check-out
   ├── Loại phòng
   ├── Số khách
   ├── Yêu cầu đặc biệt
   └── Ghi chú
4. Kiểm tra tính khả dụng mới
5. Lưu thay đổi
6. Thông báo cho khách (nếu cần)
```

### 2.5 Hủy đặt phòng
```
1. Tìm đặt phòng cần hủy
2. Chọn "Hủy đặt phòng"
3. Nhập lý do hủy
4. Xác nhận hủy
5. Hệ thống tự động:
   ├── Cập nhật trạng thái phòng
   ├── Hoàn tiền (nếu đã thanh toán)
   ├── Gửi email thông báo
   └── Cập nhật báo cáo
```

## 3. QUẢN LÝ CHECK-IN/CHECK-OUT

### 3.1 Check-in
```
1. Khách đến nhận phòng
2. Admin xác nhận:
   ├── Thông tin khách hàng
   ├── Giấy tờ tùy thân
   ├── Thanh toán (nếu chưa)
   └── Ký nhận
3. Giao phòng:
   ├── Giao chìa khóa
   ├── Hướng dẫn sử dụng
   └── Ghi chú đặc biệt
4. Cập nhật hệ thống:
   ├── Trạng thái phòng: "Có khách"
   ├── Thời gian check-in
   └── Nhân viên phụ trách
```

### 3.2 Check-out
```
1. Khách trả phòng
2. Admin kiểm tra:
   ├── Tình trạng phòng
   ├── Thiết bị/hư hỏng
   ├── Thanh toán bổ sung
   └── Thu hồi chìa khóa
3. Xử lý thanh toán cuối
4. Cập nhật hệ thống:
   ├── Trạng thái phòng: "Cần vệ sinh"
   ├── Thời gian check-out
   └── Ghi chú vệ sinh
5. Lên lịch vệ sinh phòng
```

## 4. QUẢN LÝ PHÒNG

### 4.1 Xem trạng thái phòng
```
Dashboard → Quản lý phòng
├── Tổng quan:
│   ├── Số phòng trống
│   ├── Số phòng có khách
│   ├── Số phòng bảo trì
│   └── Số phòng vệ sinh
├── Chi tiết từng phòng:
│   ├── Trạng thái hiện tại
│   ├── Khách đang ở
│   ├── Ngày check-out
│   └── Lịch sử đặt phòng
```

### 4.2 Lịch phòng
```
1. Xem lịch tổng quan
2. Lọc theo:
   ├── Từng phòng
   ├── Loại phòng
   ├── Thời gian
   └── Trạng thái
3. Thao tác:
   ├── Xem chi tiết đặt phòng
   ├── Thêm đặt phòng thủ công
   ├── Chỉnh sửa đặt phòng
   └── Đánh dấu bảo trì/vệ sinh
```

## 5. BÁO CÁO VÀ THỐNG KÊ

### 5.1 Báo cáo đặt phòng
```
├── Báo cáo theo ngày/tuần/tháng
├── Thống kê:
│   ├── Tỷ lệ lấp đầy phòng
│   ├── Doanh thu theo phòng
│   ├── Thời gian lưu trú trung bình
│   └── Tỷ lệ hủy đặt phòng
├── Xuất báo cáo (PDF/Excel)
└── Gửi báo cáo tự động
```

### 5.2 Phân tích xu hướng
```
├── Đặt phòng theo mùa
├── Phòng được ưa chuộng
├── Khách hàng thường xuyên
├── Hiệu suất nhân viên
└── Dự báo nhu cầu
```

## 6. CÀI ĐẶT VÀ CẤU HÌNH

### 6.1 Cài đặt đặt phòng
```
├── Chính sách hủy phòng
├── Thời gian check-in/check-out
├── Yêu cầu đặt cọc
├── Phí phát sinh
└── Quy tắc đặt phòng
```

### 6.2 Phân quyền nhân viên
```
├── Nhân viên lễ tân
├── Nhân viên quản lý
├── Nhân viên vệ sinh
└── Admin toàn quyền
```

## 7. TÍCH HỢP VÀ THÔNG BÁO

### 7.1 Thông báo tự động
```
├── Email xác nhận đặt phòng
├── SMS nhắc nhở check-in
├── Thông báo check-out
├── Cảnh báo sự cố
└── Báo cáo định kỳ
```

### 7.2 Tích hợp thanh toán
```
├── Thanh toán online
├── Thanh toán tại quầy
├── Quản lý hóa đơn
├── Hoàn tiền
└── Báo cáo tài chính
```
