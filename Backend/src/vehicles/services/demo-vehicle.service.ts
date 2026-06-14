import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { Branch } from '../../branches/entities/branch.entity';
import { Vehicle } from '../entities/vehicle.entity';

const EV_MODELS = [
  { model: 'ACME Volt', brand: 'ACME' },
  { model: 'ACME Spark', brand: 'ACME' },
  { model: 'ACME Thunder', brand: 'ACME' },
  { model: 'ACME Wave', brand: 'ACME' },
  { model: 'ACME Pulse', brand: 'ACME' },
];

@Injectable()
export class DemoVehicleService {
  async generateVehicle(vin: string, manager: EntityManager): Promise<Vehicle> {
    const randomIndex = Math.floor(Math.random() * EV_MODELS.length);
    const selectedModel = EV_MODELS[randomIndex];

    const lowestBranch = await manager
      .getRepository(Branch)
      .createQueryBuilder('branch')
      .orderBy('branch.id', 'ASC')
      .getOne();

    const branchId = lowestBranch ? lowestBranch.id : 1;

    const vehicle = manager.getRepository(Vehicle).create({
      vin,
      idVehiculo: `VH-${vin.slice(-6)}`,
      model: selectedModel.model,
      year: new Date().getFullYear(),
      branchId,
    });

    return manager.getRepository(Vehicle).save(vehicle);
  }
}
