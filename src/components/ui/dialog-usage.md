# Dialog Component Usage Guide

## Props mới được thêm vào DialogContent

### Size Options

```tsx
size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full" | "custom"
```

- `sm`: max-w-sm (384px)
- `md`: max-w-md (448px) - **default**
- `lg`: max-w-lg (512px)
- `xl`: max-w-xl (576px)
- `2xl`: max-w-2xl (672px)
- `3xl`: max-w-3xl (768px)
- `4xl`: max-w-4xl (896px)
- `5xl`: max-w-5xl (1024px)
- `6xl`: max-w-6xl (1152px)
- `7xl`: max-w-7xl (1280px)
- `full`: max-w-[95vw] (95% viewport width)
- `custom`: Không áp dụng size mặc định, sử dụng className

### MaxHeight Options

```tsx
maxHeight?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full" | "custom"
```

- `sm`: max-h-sm (96px)
- `md`: max-h-md (112px)
- `lg`: max-h-lg (128px) - **default**
- `xl`: max-h-xl (144px)
- `2xl`: max-h-2xl (160px)
- `3xl`: max-h-3xl (176px)
- `4xl`: max-h-4xl (192px)
- `5xl`: max-h-5xl (208px)
- `6xl`: max-h-6xl (224px)
- `7xl`: max-h-7xl (240px)
- `full`: max-h-[95vh] (95% viewport height)
- `custom`: Không áp dụng maxHeight mặc định

### Close Button Options

```tsx
showCloseButton?: boolean // default: true
closeButtonPosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left" // default: "top-right"
```

### Overlay Options

```tsx
overlayBlur?: boolean // default: false
overlayOpacity?: "light" | "medium" | "dark" // default: "medium"
```

- `light`: bg-black/30 (30% opacity)
- `medium`: bg-black/50 (50% opacity)
- `dark`: bg-black/70 (70% opacity)

## Ví dụ sử dụng

### Modal nhỏ (form đăng nhập)

```tsx
<DialogContent
  size="md"
  maxHeight="lg"
  overlayBlur={false}
  overlayOpacity="medium"
>
  <DialogHeader>
    <DialogTitle>Đăng nhập</DialogTitle>
  </DialogHeader>
  {/* Form content */}
</DialogContent>
```

### Modal trung bình (chi tiết sản phẩm)

```tsx
<DialogContent
  size="2xl"
  maxHeight="xl"
  overlayBlur={true}
  overlayOpacity="medium"
>
  <DialogHeader>
    <DialogTitle>Chi tiết sản phẩm</DialogTitle>
  </DialogHeader>
  {/* Product details */}
</DialogContent>
```

### Modal lớn (danh sách booking)

```tsx
<DialogContent
  size="full"
  maxHeight="full"
  overlayBlur={true}
  overlayOpacity="medium"
  showCloseButton={true}
  closeButtonPosition="top-right"
  className="overflow-y-auto"
>
  <DialogHeader>
    <DialogTitle>Danh sách Booking</DialogTitle>
  </DialogHeader>
  {/* Booking list */}
</DialogContent>
```

### Modal tùy chỉnh hoàn toàn

```tsx
<DialogContent
  size="custom"
  maxHeight="custom"
  className="max-w-[1200px] max-h-[800px] w-full"
  overlayBlur={true}
  overlayOpacity="dark"
  showCloseButton={false}
>
  {/* Custom content */}
</DialogContent>
```

### Modal không có close button

```tsx
<DialogContent size="lg" showCloseButton={false}>
  <DialogHeader>
    <DialogTitle>Loading...</DialogTitle>
  </DialogHeader>
  <div className="text-center py-8">
    <p>Đang tải dữ liệu...</p>
  </div>
</DialogContent>
```

## Lưu ý

1. Khi sử dụng `size="custom"` hoặc `maxHeight="custom"`, bạn cần tự định nghĩa kích thước trong `className`
2. `overlayBlur` sẽ thêm hiệu ứng blur cho background
3. `overlayOpacity` chỉ ảnh hưởng đến độ trong suốt của overlay, không ảnh hưởng đến content
4. Tất cả props đều có giá trị mặc định, bạn chỉ cần truyền những props cần thay đổi
