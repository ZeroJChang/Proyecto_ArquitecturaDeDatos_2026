import { Role } from './Auth';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  branchId: number | null;
  createdAt: string;
}
