export interface HouseRule {
  _id: string;
  name: string;
  description?: string;
  default_checked: boolean;
  is_active: boolean;
  isDeleted: boolean;
  createdBy: string;
  updatedBy?: string;
  deletedBy?: string;
  deletedAt?: string;
  created_at: string;
  updated_at: string;
  icon_url?: string;
}

export interface CreateHouseRuleDto {
  name: string;
  description?: string;
  is_active: boolean;
  default_checked?: boolean;
  icon_url?: string;
}

export type UpdateHouseRuleDto = Partial<CreateHouseRuleDto>; 