import { Branch } from '../../branches/entities/branch.entity';

export const branchesSeed: Partial<Branch>[] = [
  {
    name: 'Guatemala City',
    country: 'Guatemala',
    region: 'Central',
    isActive: true,
  },
  {
    name: 'Quetzaltenango',
    country: 'Guatemala',
    region: 'Occidente',
    isActive: true,
  },
  {
    name: 'Escuintla',
    country: 'Guatemala',
    region: 'Sur',
    isActive: true,
  },
];
