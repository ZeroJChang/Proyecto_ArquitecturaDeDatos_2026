import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

import { Vehicle } from './vehicle.entity';

@Entity('vehicle_owners')
export class VehicleOwner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'vehicle_id' })
  vehicleId: number;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({
    name: 'assigned_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  assignedAt: Date;
}
