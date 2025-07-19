export type UserLanguage = "vi" | "en";

export interface Permission {
  _id: string;
  key: string;
  module: string;
  action: string;
  description?: string;
}

export interface CustomRole {
  _id: string;
  key: string;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  role?: string; // System role: guest, staff, admin
  is_verified?: boolean;
  // Custom roles và permissions
  customRoles?: CustomRole[];
  permissions?: Permission[];
}

export interface Role {
  _id: string;
  name: string;
  key: string;
}

export interface UserRole {
  _id: string;
  name: string;
  key: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  avatar_url?: string;
  role?: UserRole;
  language?: UserLanguage;
  is_verified?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  avatar_url?: string;
  role?: UserRole;
  language?: UserLanguage;
  is_verified?: boolean;
  isDeleted?: boolean;
}

export interface QueryUserDto {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  role?: string | UserRole;
  is_verified?: string;
  isDeleted?: boolean;
  select?: string;
}
