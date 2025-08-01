import { User } from "./user";
import { BookingStatus, PaymentStatus, CancelPolicy } from "./enum";

export interface BookingData {
  _id: string;
  listingId:
    | string
    | {
        images?: string[];
        title?: string;
        location?: string;
        city?: string;
        country?: string;
      };
  propertyId: string;
  price_per_night: number;
  total_price: number;
  final_amount: number;
  deposit_paid_amount?: number;
  checkInDate: string;
  check_out_date: string;
  guests: number;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  cancel_policy?: keyof typeof CancelPolicy;
  // Bổ sung các trường dịch vụ kèm theo
  selected_services?: Array<{
    service_id?: string;
    service_name?: string;
    service_price?: number;
    quantity?: number;
    total_price?: number;
  }>;
  services_total_amount?: number;
}

export interface BookingDetail extends BookingData {
  guestId: User | string;
  infants: number;
  nights: number;
  service_fee: number;
  tax_amount: number;
  commissionRate: number;
  finalPayoutAmount: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  special_requests: string;
  isDeleted: boolean;
  createdBy: string;
  updatedBy: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
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

export function isListingObj(listing: unknown): listing is {
  images?: string[];
  title?: string;
  location?: string;
  city?: string;
  country?: string;
} {
  return (
    listing !== null &&
    typeof listing === "object" &&
    ("images" in listing || "title" in listing)
  );
}
