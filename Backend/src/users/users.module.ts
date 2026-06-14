import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './controllers/users.controller';
import { User } from './entities/user.entity';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CqrsModule],
  controllers: [UsersController],
  providers: [...QueryHandlers],
  exports: [TypeOrmModule],
})
export class UsersModule {}
