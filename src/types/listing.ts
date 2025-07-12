export interface Listing {
  _id: string;
  propertyId: string | { _id: string; name: string; type?: string };
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
  house_rules_selected: string[];
  safety_features: string[];
  other_rules: string[];
  cancel_policy: string;
  allow_pets: boolean;
  is_verified: boolean;
  status: string;
  isDeleted: boolean;
  average_rating: number;
  reviews_count: number;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateListingDto = Omit<Listing, '_id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'createdBy' | 'updatedBy' | 'deletedBy' | 'isDeleted' | 'is_verified' | 'average_rating' | 'reviews_count'>;
export type UpdateListingDto = Partial<CreateListingDto>;
export interface QueryListingDto {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
  propertyId?: string;
  isDeleted?: boolean;
} 