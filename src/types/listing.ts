


import { CancelPolicy, ListingStatus } from "./enum";
export interface ListingByIdResponse {
  data: IListing;
}

export interface IProperty {
  _id: string;
  name: string;
  type: string;
  staffIds: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    district: string;
    ward: string;
  };
}

export interface IListing {
  _id: string;
  propertyId?: IProperty;
  title: string;
  description?: string;
  images: string[];
  price_per_night: number;

  // Sức chứa
  guests?: number; // Số khách đề xuất
  max_guests: number;
  allow_infants?: boolean;
  max_infants?: number;

  // Cơ sở vật chất
  beds: number;
  bathrooms: number;
  amenities?: string[];
  safety_features?: string[];
  house_rules_selected?: string[];
  other_rules?: string[];

  // Chính sách
  cancel_policy?: CancelPolicy;
  allow_pets?: boolean;

  // Trạng thái
  status: ListingStatus;
  is_verified: boolean;
  isDeleted?: boolean;

  // Đánh giá
  average_rating?: number;
  reviews_count?: number;

  // Thời gian
  createdAt: string;
  updatedAt: string;

  // Bổ sung
  available?: boolean;
  lat?: number;
  lng?: number;
}



export interface IQueryListing {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  propertyId?: string;
  status?: ListingStatus;
  cancel_policy?: CancelPolicy;
  priceFrom?: number;
  priceTo?: number;
  guests?: number;
  min_beds?: number;
  min_bathrooms?: number;
  allow_infants?: boolean;
  amenities?: string[];
  safety_features?: string[];
  is_verified?: boolean;
  isDeleted?: boolean;
}

export interface IUpdateListing {
  title?: string;
  description?: string;
  images?: string[];
  price_per_night?: number;
  guests?: number;
  max_guests?: number;
  allow_infants?: boolean;
  max_infants?: number;
  beds?: number;
  bathrooms?: number;
  amenities?: string[];
  safety_features?: string[];
  cancel_policy?: CancelPolicy;
  status?: ListingStatus;
  is_verified?: boolean;
}

export interface ICreateListing {
  propertyId: string;
  title: string;
  description?: string;
  images: string[];
  price_per_night: number;
  guests?: number;
  max_guests: number;
  allow_infants?: boolean;
  max_infants?: number;
  beds: number;
  bathrooms: number;
  amenities?: string[];
  safety_features?: string[];
  cancel_policy?: CancelPolicy;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
