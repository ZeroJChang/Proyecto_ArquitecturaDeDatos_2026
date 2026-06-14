import * as bcrypt from 'bcrypt';

import { User } from '../../users/entities/user.entity';

const hash = (password: string) => bcrypt.hashSync(password, 10);

export const usersSeed: Partial<User>[] = [
  {
    email: 'admin@acme-ev.com',
    password: hash('admin123'),
    name: 'Admin Principal',
    role: 'ADMIN',
    branchId: null,
  },
  {
    email: 'branch1@acme-ev.com',
    password: hash('branch123'),
    name: 'Operador Guatemala City',
    role: 'BRANCH_USER',
    branchId: 1,
  },
  {
    email: 'branch2@acme-ev.com',
    password: hash('branch123'),
    name: 'Operador Quetzaltenango',
    role: 'BRANCH_USER',
    branchId: 2,
  },
  {
    email: 'branch3@acme-ev.com',
    password: hash('branch123'),
    name: 'Operador Escuintla',
    role: 'BRANCH_USER',
    branchId: 3,
  },
  {
    email: 'owner1@acme-ev.com',
    password: hash('owner123'),
    name: 'Propietario Uno',
    role: 'OWNER',
    branchId: null,
  },
  {
    email: 'owner2@acme-ev.com',
    password: hash('owner123'),
    name: 'Propietario Dos',
    role: 'OWNER',
    branchId: null,
  },
];
