export interface Amenity {
  _id: string;
  name: string;
  description?: string;
  icon_url?: string;
  default_checked: boolean;
  is_active: boolean;
  isDeleted: boolean;
  createdBy: string;
  updatedBy?: string;
  deletedBy?: string;
  deletedAt?: string;
  created_at: string;
  updated_at: string;
  category?: string;
}

export interface CreateAmenityDto {
  name: string;
  description?: string;
  icon_url?: string;
  default_checked?: boolean;
  is_active?: boolean;
}

export type UpdateAmenityDto = Partial<CreateAmenityDto>;

export interface QueryAmenityDto {
  search?: string;
  is_active?: boolean;
  default_checked?: boolean;
  includeDeleted?: boolean;
  isDeleted?: boolean;
  page?: number;
  limit?: number;
} 