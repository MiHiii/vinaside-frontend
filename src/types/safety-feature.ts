export interface SafetyFeature {
  _id: string;
  name: string;
  description?: string;
  is_active: boolean;
  default_checked: boolean;
  isDeleted: boolean;
  createdBy: string;
  updatedBy?: string;
  deletedBy?: string;
  deletedAt?: string;
  created_at: string;
  updated_at: string;
  icon_url?: string;
}

export interface CreateSafetyFeatureDto {
  name: string;
  description?: string;
  is_active: boolean;
}

export type UpdateSafetyFeatureDto = Partial<CreateSafetyFeatureDto>; 