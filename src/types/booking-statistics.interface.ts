import { User } from "./user";

export interface BookingStatisticsOverview {
  totalBookings: number;
  totalRevenue: number;
  totalGuests: number;
  [key: string]: number;
}

export interface BookingStatisticsFinancial {
  totalRevenue: number;
  revenueByMonth: { [month: string]: number };
}

export interface BookingStatisticsCustomers {
  totalCustomers: number;
  topCustomers: Array<{
    user: User;
    totalBookings: number;
    totalSpent: number;
  }>;
}
