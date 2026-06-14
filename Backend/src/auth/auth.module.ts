import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import type { StringValue } from 'ms';

import { UsersModule } from '../users/users.module';

import { AuthController } from './controllers/auth.controller';
import { QueryHandlers } from './queries/handlers';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret')!,
        signOptions: {
          expiresIn: (configService.get<string>('jwt.expiresIn') ??
            '1h') as StringValue,
        },
      }),
    }),
    CqrsModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, ...QueryHandlers],
  exports: [JwtModule],
})
export class AuthModule {}
