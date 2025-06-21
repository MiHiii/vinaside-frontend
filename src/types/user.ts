export type UserRole = "guest" | "host" | "admin";
export type UserLanguage = "vi" | "en";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  role: UserRole;
  language: UserLanguage;
  is_verified: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password_hash: string;
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
  is_verified?:  string;
  isDeleted?: boolean  ;
  select?: string;
}


