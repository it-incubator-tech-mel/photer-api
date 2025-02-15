import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './api/auth.controller';
import { MailerModule } from '../../core/services/mailler/mailer.module';
import { CryptoModule } from '../../core/services/crypto/crypto.module';
import {LoginUseCase} from "./application/use-cases/login.use-case";
import {RegistrationUseCase} from "./application/use-cases/registration.use-case";
import {DeviceRepository} from "./infrastructure/device.repository";
import {UsersRepository} from "./infrastructure/users.repository";
import {JwtService} from "@nestjs/jwt";
import {PrismaModule} from "../../core/config/config.module";
import {JwtStrategy} from "./strategies/bearer.strategies";

const useCases = [
  LoginUseCase,
  RegistrationUseCase
];
@Module({
  imports: [CqrsModule, MailerModule, CryptoModule, PrismaModule],
  controllers: [AuthController],
  exports: [],
  providers: [
    DeviceRepository,
    JwtService,
    UsersRepository,
    JwtStrategy,
      ...useCases
  ]
})
export class AuthModule {}