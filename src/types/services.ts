export interface Service {
  _id: string;
  name: string;
  description?: string;
  unit: string;
  default_price: number;
  icon_url?: string;
  is_active: boolean;
  allow_quantity: boolean;
  isDeleted: boolean;
  created_at: string;
  updated_at: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  deletedAt?: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  unit: string;
  default_price: number;
  icon_url?: string;
  is_active?: boolean;
  allow_quantity?: boolean;
}

export type UpdateServiceDto = Partial<CreateServiceDto>; 