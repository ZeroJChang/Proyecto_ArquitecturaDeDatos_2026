import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BranchesController } from './controllers/branches.controller';
import { Branch } from './entities/branch.entity';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([Branch]), CqrsModule],
  controllers: [BranchesController],
  providers: [...QueryHandlers],
  exports: [TypeOrmModule],
})
export class BranchesModule {}
