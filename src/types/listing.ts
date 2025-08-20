export interface Listing {
  _id: string;
  propertyId:
    | string
    | {
        _id: string;
        name: string;
        type?: string;
        location?: {
          place_id?: string;
          lat?: number;
          lng?: number;
          address?: string;
          city?: string;
          district?: string;
          ward?: string;
          coordinates?: number[];
        };
      };
  title: string;
  building_name?: string;
  address?: string;
  property_type?: string;
  check_in_time?: string;
  check_out_time?: string;
  description?: string;
  images: string[];
  price_per_night: number;
  guests: number;
  max_guests: number;
  allow_infants: boolean;
  max_infants: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  service_ids?: string[];
  safety_features?: string[];
  house_rules_selected?: string[];
  other_rules: string[];
  cancel_policy: string;
  allow_pets: boolean;
  // Weekend surcharge fields
  has_weekend_surcharge?: boolean;
  weekend_surcharge_percent?: number;
  is_verified: boolean;
  status: string;
  isDeleted: boolean;
  average_rating: number;
  reviews_count: number;
  voucher_ids?: string[];
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  is_wishlisted?: boolean;
}

export type CreateListingDto = Omit<
  Listing,
  | "_id"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "isDeleted"
  | "is_verified"
  | "average_rating"
  | "reviews_count"
>;
export type UpdateListingDto = Partial<CreateListingDto>;
export interface QueryListingDto {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
  propertyId?: string;
  isDeleted?: boolean;
}

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
  address?: string;
  city?: string;
  province?: string;
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
  service_ids?: string[];
  house_rules?: string[];

  // Chính sách
  cancel_policy?: CancelPolicy;
  allow_pets?: boolean;
  // Weekend surcharge fields
  has_weekend_surcharge?: boolean;
  weekend_surcharge_percent?: number;

  // Trạng thái
  status: ListingStatus;
  is_verified: boolean;
  isDeleted?: boolean;

  // Đánh giá
  average_rating?: number;
  reviews_count?: number;
  voucher_ids?: string[];

  // Thời gian
  createdAt: string;
  updatedAt: string;

  // Bổ sung
  available?: boolean;
  lat?: number;
  lng?: number;
  address?: string;
  city?: string;
  province?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
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
  voucher_ids?: string[];
  // Weekend surcharge fields
  has_weekend_surcharge?: boolean;
  weekend_surcharge_percent?: number;
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
  voucher_ids?: string[];
  // Weekend surcharge fields
  has_weekend_surcharge?: boolean;
  weekend_surcharge_percent?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
