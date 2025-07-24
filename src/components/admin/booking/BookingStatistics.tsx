
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchBookingStatisticsOverview,
  fetchBookingStatisticsFinancial,
  fetchBookingStatisticsCustomers,
} from "@/store/slices/bookingSlice";
import BookingCharts from "./BookingCharts";




// Helper to safely extract revenueByMonth
function getRevenueByMonth(statisticsFinancial: unknown): { month: string; revenue: number }[] {
  if (
    statisticsFinancial &&
    typeof statisticsFinancial === 'object' &&
    'financial' in statisticsFinancial &&
    statisticsFinancial.financial &&
    typeof statisticsFinancial.financial === 'object' &&
    Array.isArray((statisticsFinancial.financial as unknown as { revenueByMonth?: unknown }).revenueByMonth)
  ) {
    return (statisticsFinancial.financial as { revenueByMonth: { month: string; revenue: number }[] }).revenueByMonth;
  }
  return [];
}

export default function BookingStatisticsAdmin() {
  const dispatch = useAppDispatch();
  const statisticsOverview = useAppSelector(state => state.booking.statisticsOverview) || {};
  const statisticsFinancial = useAppSelector(state => state.booking.statisticsFinancial) || {};




  useEffect(() => {
    const params: { startDate?: string; endDate?: string } = {};
    
    dispatch(fetchBookingStatisticsOverview(params));
    dispatch(fetchBookingStatisticsFinancial(params));
    dispatch(fetchBookingStatisticsCustomers(params));
  }, [dispatch]);

  // PieChart trạng thái booking
  const statusData = useMemo(() => {
    const breakdown = (statisticsOverview.statusBreakdown ?? {}) as Record<string, number>;
    return [
      { name: "Chờ xác nhận", value: breakdown["pending"] ?? 0 },
      { name: "Đã xác nhận", value: breakdown["confirmed"] ?? 0 },
      { name: "Đã hoàn thành", value: breakdown["completed"] ?? 0 },
      { name: "Đã huỷ", value: breakdown["cancelled"] ?? 0 },
      { name: "Bị từ chối", value: breakdown["rejected"] ?? 0 },
    ];
  }, [statisticsOverview]);

  const bookingByMonth = useMemo(() => {
    if (
      statisticsFinancial &&
      typeof statisticsFinancial === 'object' &&
      'financial' in statisticsFinancial &&
      statisticsFinancial.financial &&
      typeof statisticsFinancial.financial === 'object' &&
      Array.isArray((statisticsFinancial.financial as unknown as { revenueByMonth?: unknown }).revenueByMonth)
    ) {
      return ((statisticsFinancial.financial as { revenueByMonth: { month: string; bookings: number }[] }).revenueByMonth).map((item) => ({
        month: item.month,
        bookings: item.bookings,
      }));
    }
    return [];
  }, [statisticsFinancial]);


 

  return (
    <div className="space-y-8">
      {/* Bộ lọc ngày */}


      {/* Tổng quan booking */}
    

      {/* Thống kê khách hàng */}
   

      {/* Cột phải */}
      <div className="flex flex-col gap-6">
        {/* Thống kê tài chính */}

        {/* Các biểu đồ booking */}
        <BookingCharts
          statusData={statusData}
          revenueData={getRevenueByMonth(statisticsFinancial)}
          bookingByMonth={Array.isArray(bookingByMonth) ? bookingByMonth : []}
        />
      </div>
    </div>
  );
}


// import React, { useEffect, useState, useMemo } from "react";// import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
// import {
//   fetchBookingStatisticsOverview,
//   fetchBookingStatisticsFinancial,
//   fetchBookingStatisticsCustomers,
// } from "@/store/slices/bookingSlice";
// import { RootState } from "@/store";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   LineChart,
//   Line,
//   Legend,
//   LabelList,
// } from "recharts";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent,
// } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "@/components/ui/table";

// // Định nghĩa type tạm thời sát backend
// interface StatusBreakdown {
//   pending?: number;
//   confirmed?: number;
//   cancelled?: number;
//   completed?: number;
//   rejected?: number;
//   confirmationRate?: number;
//   cancellationRate?: number;
// }
// interface Overview {
//   totalBookings?: number;
//   totalRevenue?: number;
//   totalNights?: number;
//   totalGuests?: number;
//   averageOccupancyRate?: number;
//   averageBookingValue?: number;
//   totalInfants?: number;
//   statusBreakdown?: StatusBreakdown | number;
// }
// interface Financial {
//   totalRevenue?: number;
//   totalServiceFees?: number;
//   totalTaxAmount?: number;
//   totalRefunds?: number;
//   netRevenue?: number;
//   averageBookingValue?: number;
//   revenueByMonth?: Array<{ month: string; revenue: number; bookings: number }>;
// }
// interface Customers {
//   totalCustomers?: number;
//   newCustomers?: number;
//   returningCustomers?: number;
//   averageNightsPerBooking?: number;
//   averageGuestsPerBooking?: number;
//   topCustomers?: Array<{
//     customerId: string;
//     customerName: string;
//     totalBookings: number;
//     totalSpent: number;
//   }>;
// }

// const COLORS = [
//   "#8884d8",
//   "#82ca9d",
//   "#ffc658",
//   "#ff8042",
//   "#0088FE",
//   "#FFBB28",
// ];

// function DatePicker({
//   value,
//   onChange,
//   label,
// }: {
//   value?: string;
//   onChange: (date: string) => void;
//   label: string;
// }) {
//   const [open, setOpen] = React.useState(false);
//   const dateValue = value ? new Date(value) : undefined;
//   return (
//     <div>
//       <label className="block text-sm font-medium mb-1">{label}</label>
//       <Popover open={open} onOpenChange={setOpen}>
//         <PopoverTrigger asChild>
//           <Button
//             variant="outline"
//             className="w-full justify-start text-left font-normal"
//           >
//             <CalendarIcon className="mr-2 h-4 w-4" />
//             {dateValue ? (
//               format(dateValue, "dd/MM/yyyy")
//             ) : (
//               <span className="text-gray-400">Chọn ngày</span>
//             )}
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className="w-auto p-0">
//           <Calendar
//             mode="single"
//             selected={dateValue}
//             onSelect={(date) => {
//               setOpen(false);
//               if (date) onChange(format(date, "yyyy-MM-dd"));
//             }}
//             initialFocus
//           />
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// }

// function formatCurrency(value?: number) {
//   if (typeof value !== "number") return "-";
//   return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
// }
// function formatPercent(value?: number) {
//   if (typeof value !== "number") return "-";
//   // Nếu giá trị > 1, chia cho 100 (ví dụ: 1771 => 17.71%)
//   const percent = value > 1 ? value / 100 : value;
//   return `${(percent * 100).toFixed(2)}%`;
// }

// const BookingStatisticsAdmin: React.FC = () => {
//   const dispatch = useAppDispatch();
//   const statisticsOverview = useAppSelector(
//     (state: RootState) => state.booking.statisticsOverview
//   ) as Overview | null;
//   const statisticsFinancial = useAppSelector(
//     (state: RootState) => state.booking.statisticsFinancial
//   ) as Financial | null;
//   const statisticsCustomers = useAppSelector(
//     (state: RootState) => state.booking.statisticsCustomers
//   ) as Customers | null;
//   const { loading, error } = useAppSelector(
//     (state: RootState) => state.booking
//   );

//   // Filter state
//   const [startDate, setStartDate] = useState<string>("");
//   const [endDate, setEndDate] = useState<string>("");

//   useEffect(() => {
//     const params: { startDate?: string; endDate?: string } = {};
//     if (startDate && endDate) {
//       params.startDate = startDate;
//       params.endDate = endDate;
//     }
//     dispatch(fetchBookingStatisticsOverview(params));
//     dispatch(fetchBookingStatisticsFinancial(params));
//     dispatch(fetchBookingStatisticsCustomers(params));
//   }, [dispatch, startDate, endDate]);

//   // PieChart trạng thái booking
//   const statusData = useMemo(() => {
//     const breakdown = statisticsOverview?.statusBreakdown as
//       | StatusBreakdown
//       | undefined;
//     if (!breakdown) return [];
//     return [
//       { name: "Chờ xác nhận", value: breakdown.pending || 0 },
//       { name: "Đã xác nhận", value: breakdown.confirmed || 0 },
//       { name: "Đã hoàn thành", value: breakdown.completed || 0 },
//       { name: "Đã huỷ", value: breakdown.cancelled || 0 },
//       { name: "Bị từ chối", value: breakdown.rejected || 0 },
//     ];
//   }, [statisticsOverview]);

//   // BarChart doanh thu theo tháng
//   const revenueData = statisticsFinancial?.revenueByMonth || [];

//   // LineChart số booking theo tháng
//   const bookingByMonth = useMemo(() => {
//     if (!Array.isArray(statisticsFinancial?.revenueByMonth)) return [];
//     return statisticsFinancial.revenueByMonth.map((item) => ({
//       month: item.month,
//       bookings: item.bookings,
//     }));
//   }, [statisticsFinancial]);

//   // Top khách hàng
//   const topCustomers = statisticsCustomers?.topCustomers || [];

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
//         <DatePicker value={startDate} onChange={setStartDate} label="Từ ngày" />
//         <DatePicker value={endDate} onChange={setEndDate} label="Đến ngày" />
//       </div>
//       {loading && <p>Đang tải dữ liệu...</p>}
//       {error && (
//         <p className="text-red-500">
//           {typeof error === "string" ? error : JSON.stringify(error)}
//         </p>
//       )}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Tổng quan booking */}
//         <div>
//           <h3 className="font-semibold text-lg mb-1">Tổng quan booking</h3>

//           <div className="rounded-lg border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Chỉ số</TableHead>
//                   <TableHead>Giá trị</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 <TableRow>
//                   <TableCell>Tổng booking</TableCell>
//                   <TableCell className="font-bold">
//                     {statisticsOverview?.totalBookings ?? "-"}
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Doanh thu</TableCell>
//                   <TableCell className="font-bold text-green-600">
//                     {formatCurrency(statisticsOverview?.totalRevenue)}
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Tổng đêm</TableCell>
//                   <TableCell>
//                     {statisticsOverview?.totalNights ?? "-"}
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Tổng khách</TableCell>
//                   <TableCell>
//                     {statisticsOverview?.totalGuests ?? "-"}
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Tỉ lệ lấp đầy</TableCell>
//                   <TableCell>
//                     {formatPercent(statisticsOverview?.averageOccupancyRate)}
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Giá trị booking TB</TableCell>
//                   <TableCell>
//                     {formatCurrency(statisticsOverview?.averageBookingValue)}
//                   </TableCell>
//                 </TableRow>
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//         {/* Thống kê tài chính */}
//         <div>
//           <h3 className="font-semibold text-lg mb-1">Thống kê tài chính</h3>
//           <div className="rounded-lg border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Chỉ số</TableHead>
//                   <TableHead>Giá trị</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 <TableRow>
//                   <TableCell>Doanh thu</TableCell>
//                   <TableCell className="font-bold text-green-600">
//                     {formatCurrency(statisticsFinancial?.totalRevenue)}
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Phí dịch vụ</TableCell>
//                   <TableCell>
//                     {formatCurrency(statisticsFinancial?.totalServiceFees)}
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Thuế</TableCell>
//                   <TableCell>
//                     {formatCurrency(statisticsFinancial?.totalTaxAmount)}
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Hoàn tiền</TableCell>
//                   <TableCell>
//                     {formatCurrency(statisticsFinancial?.totalRefunds)}
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Doanh thu thực</TableCell>
//                   <TableCell className="font-bold">
//                     {formatCurrency(statisticsFinancial?.netRevenue)}
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Giá trị booking TB</TableCell>
//                   <TableCell>
//                     {formatCurrency(statisticsFinancial?.averageBookingValue)}
//                   </TableCell>
//                 </TableRow>
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Thống kê khách hàng */}
//         <div>
//           <h3 className="font-semibold text-lg mb-1">Thống kê khách hàng</h3>

//           <div className="rounded-lg border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Chỉ số</TableHead>
//                   <TableHead>Giá trị</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 <TableRow>
//                   <TableCell>Tổng khách</TableCell>
//                   <TableCell>
//                     {statisticsCustomers?.totalCustomers ?? "-"}
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Khách mới</TableCell>
//                   <TableCell>
//                     {statisticsCustomers?.newCustomers ?? "-"}
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Khách quay lại</TableCell>
//                   <TableCell>
//                     {statisticsCustomers?.returningCustomers ?? "-"}
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Đêm TB/booking</TableCell>
//                   <TableCell>
//                     {statisticsCustomers?.averageNightsPerBooking ?? "-"}
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell>Khách TB/booking</TableCell>
//                   <TableCell>
//                     {statisticsCustomers?.averageGuestsPerBooking ?? "-"}
//                   </TableCell>
//                 </TableRow>
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//         {/* Top khách hàng */}
//         <div>
//           <h3 className="font-semibold text-lg mb-1">Top khách hàng</h3>

//           <div className="rounded-lg border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Tên khách</TableHead>
//                   <TableHead>Số booking</TableHead>
//                   <TableHead>Tổng chi tiêu</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {topCustomers.length > 0 ? (
//                   topCustomers.map((item) => (
//                     <TableRow key={item.customerId}>
//                       <TableCell>{item.customerName}</TableCell>
//                       <TableCell>{item.totalBookings}</TableCell>
//                       <TableCell>
//                         {item.totalSpent?.toLocaleString("vi-VN", {
//                           style: "currency",
//                           currency: "VND",
//                         }) ?? 0}
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell
//                       colSpan={3}
//                       className="text-center text-muted-foreground"
//                     >
//                       Không có dữ liệu top khách hàng
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* BarChart doanh thu theo tháng */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Doanh thu theo tháng</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {revenueData && revenueData.length > 0 ? (
//               <ResponsiveContainer width="100%" height={220}>
//                 <BarChart data={revenueData}>
//                   <XAxis dataKey="month" />
//                   <YAxis
//                     tickFormatter={(value) =>
//                       value.toLocaleString("vi-VN", {
//                         style: "currency",
//                         currency: "VND",
//                         maximumFractionDigits: 0,
//                       })
//                     }
//                   />
//                   <Tooltip
//                     formatter={(value) =>
//                       value.toLocaleString("vi-VN", {
//                         style: "currency",
//                         currency: "VND",
//                         maximumFractionDigits: 0,
//                       })
//                     }
//                   />
//                   <Legend />
//                   <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu">
//                     <LabelList
//                       dataKey="revenue"
//                       position="top"
//                       formatter={(value) =>
//                         value != null
//                           ? Number(value).toLocaleString("vi-VN", {
//                               style: "currency",
//                               currency: "VND",
//                               maximumFractionDigits: 0,
//                             })
//                           : ""
//                       }
//                     />
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="text-center text-muted-foreground">
//                 Không có dữ liệu
//               </div>
//             )}
//           </CardContent>
//         </Card>
//         {/* LineChart số booking theo tháng */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Số booking theo tháng</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {bookingByMonth && bookingByMonth.length > 0 ? (
//               <ResponsiveContainer width="100%" height={220}>
//                 <LineChart data={bookingByMonth}>
//                   <XAxis dataKey="month" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Line
//                     type="monotone"
//                     dataKey="bookings"
//                     stroke="#82ca9d"
//                     name="Số booking"
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="text-center text-muted-foreground">
//                 Không có dữ liệu
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Trạng thái Booking</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {statusData && statusData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={220}>
//               <PieChart>
//                 <Pie
//                   data={statusData}
//                   dataKey="value"
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={70}
//                   label
//                 >
//                   {statusData.map((entry, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={COLORS[index % COLORS.length]}
//                     />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           ) : (
//             <div className="text-center text-muted-foreground">
//               Không có dữ liệu
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default BookingStatisticsAdmin;

