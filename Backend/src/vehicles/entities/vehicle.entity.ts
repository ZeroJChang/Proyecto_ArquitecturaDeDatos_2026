import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Branch } from '../../branches/entities/branch.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 17 })
  vin: string;

  @Column({ name: 'id_vehiculo' })
  idVehiculo: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({ name: 'branch_id' })
  branchId: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
