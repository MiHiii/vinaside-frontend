export interface BookingData {
  _id: string;
  listingId: string;
  propertyId: string;
  price_per_night: number;
  total_price: number;
  final_amount: number;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
}