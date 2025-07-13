import { BookingData } from './booking';
import { User } from './user';
import { IProperty, IListing } from './listing';
import { BookingStatus } from './enum';

export interface Booking extends BookingData {
  status: BookingStatus;
  guest_name: User;
  staff?: User;
  property?: IProperty;
  createdAt: string;
  updatedAt: string;
}

export interface BookingDetail {
  _id: string;
  propertyId: IProperty | string;
  listingId: IListing | string;
  guestId: User | string;
  checkInDate: string;
  check_out_date: string;
  guests: number;
  infants: number;
  nights: number;
  price_per_night: number;
  total_price: number;
  service_fee: number;
  tax_amount: number;
  final_amount: number;
  commissionRate: number;
  finalPayoutAmount: number;
  status: string;
  payment_status: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  special_requests: string;
  isDeleted: boolean;
  createdBy: string;
  updatedBy: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // fallback cho các trường động
}
