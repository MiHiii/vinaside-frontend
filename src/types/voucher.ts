export interface Voucher {
  _id: string;
  code: string;
  discount_percent: number;
  max_uses: number;
  uses_count: number;
  expiration_date: string;
  is_active: boolean;
  description?: string;
  min_order_value?: number;
  max_uses_per_user?: number;
  applies_to?: {
    room_ids?: string[];
  };
  isDeleted: boolean;
  created_at: string;
  updated_at: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  deletedAt?: string;
}

export interface CreateVoucherDto {
  code: string;
  discount_percent: number;
  max_uses: number;
  expiration_date: string;
  description?: string;
  min_order_value?: number;
  applies_to?: {
    room_ids?: string[];
  };
}

export type UpdateVoucherDto = Partial<CreateVoucherDto>; 