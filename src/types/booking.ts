import { User } from "./user";
import { IProperty } from "./listing";

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface BookingData {
  _id: string;
  listingId: string;
  propertyId: string;
  price_per_night: number;
  total_price: number;
  final_amount: number;
  checkInDate: string;
  check_out_date: string;
  guests: number;
}

export interface Booking extends BookingData {
  status: BookingStatus;
  guest: User;
  staff?: User;
  property?: IProperty;
  createdAt: string;
  updatedAt: string;
}

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
