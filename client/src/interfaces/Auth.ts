export type Role = 'ADMIN' | 'BRANCH_USER' | 'OWNER';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  branchId: number | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
