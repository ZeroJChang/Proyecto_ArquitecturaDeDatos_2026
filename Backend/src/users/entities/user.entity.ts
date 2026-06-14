import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Branch } from '../../branches/entities/branch.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // bcrypt hash

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['ADMIN', 'BRANCH_USER', 'OWNER'] })
  role: string;

  @Column({ name: 'branch_id', nullable: true })
  branchId: number | null;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
