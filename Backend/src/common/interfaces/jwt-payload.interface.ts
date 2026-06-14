import { Role } from '../constants/roles.constant';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  branchId: number | null;
  iat?: number;
  exp?: number;
}
