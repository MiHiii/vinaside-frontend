export interface Property {
  id: string;
  _id?: string;
  name: string;
  type: string;
  staffIds: string[];
  description?: string;
  thumbnail?: string;
  images: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    district?: string;
    ward?: string;
  };
  checkInTime?: string;
  checkOutTime?: string;
  contactPhone?: string;
  contactEmail?: string;
  status: string;
  isVerified: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  allowPets: boolean;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
}

export interface CreatePropertyDto {
  name: string;
  type: string;
  staffIds?: string[];
  description?: string;
  thumbnail?: string;
  images?: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    district?: string;
    ward?: string;
  };
  checkInTime?: string;
  checkOutTime?: string;
  contactPhone?: string;
  contactEmail?: string;
  allowPets?: boolean;
}

export type UpdatePropertyDto = Partial<CreatePropertyDto>;

export interface QueryPropertyDto {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  type?: string;
  status?: string;
  isVerified?: boolean;
  isDeleted?: boolean;
  staffId?: string;
}

export interface PropertyStatistics {
  propertyInfo: {
    name: string;
    description: string;
    thumbnail?: string;
    location: {
      address: string;
      district?: string;
      city?: string;
    };
    createdAt: string;
  };
  reviewAnalysis: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { [key: string]: number };
    recentReviews?: Array<{
      id: string;
      userName: string;
      userAvatar?: string;
      listingTitle: string;
      rating: number;
      comment: string;
      createdAt: string;
    }>;
  };
  roomOverview: {
    totalRooms: number;
    activeRooms: number;
    roomsWithBookings: number;
    roomUtilizationRate: number;
  };
  bookingPerformance: {
    totalBookings: number;
    successRate: number;
  };
  customerStatistics: {
    uniqueCustomers: number;
    returnCustomers: number;
    returnCustomerRate: number;
    averageBookingsPerCustomer: number;
  };
  revenueAndPricing: {
    totalRevenue: number;
    averagePricePerNight: number;
    totalNightsBooked: number;
  };
  timeStatistics: {
    averageStayDurationText: string;
    earliestBookingDate: string;
    latestBookingDate: string;
    peakBookingDays: { date: string; bookingCount: number }[];
  };
  chartData?: Array<{
    label: string;
    revenue: number;
    bookings: number;
    occupancyRate: number;
  }>;
}; 