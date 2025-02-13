import {Body, Controller, Get, HttpCode, Headers, HttpStatus, Param, Post, Res, Req} from '@nestjs/common';
import { RegistrationDto } from './dto/registration.dto';
import { CommandBus } from '@nestjs/cqrs';
import { LoginDto } from './dto/login.dto';
import { PasswordRecoveryDto } from './dto/password-recovery.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { ConfirmRegistrationDto } from './dto/confirm-registration.dto';
import { RegistrationEmailResendingDto } from './dto/registration-email-resending.dto';
import {RegistrationUserCommand} from "../application/use-cases/registration.use-case";
import { Request, Response } from 'express';
import {LoginUserCommand} from "../application/use-cases/login.use-case";
import {Result} from "../../../../base/object-result";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus
  ) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() registrationDto: RegistrationDto) {
    return this.commandBus.execute(new RegistrationUserCommand(registrationDto.username, registrationDto.password, registrationDto.email ))
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(@Body() confirmRegistrationDto: ConfirmRegistrationDto) {
    return { message: 'registration-confirmation' };
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() registrationEmailResendingDto: RegistrationEmailResendingDto) {
    return { message: 'registration-email-resending' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
      @Headers() header,
      @Body() loginDto: LoginDto,
      @Res({ passthrough: true }) response: Response,
      @Req() req: Request,) {
    const userAgent = {
      IP: req.ip,
      deviceName: header['user-agent'],
    };
    const { accessToken, refreshToken } = await this.commandBus.execute(
        new LoginUserCommand(loginDto, userAgent))
    if (!accessToken || !refreshToken) return Result.unauthorized()
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: 'token' };
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() passwordRecoveryDto: PasswordRecoveryDto) {
    return { message: 'password-recovery' };
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() newPasswordDto: NewPasswordDto) {
    return { message: 'new-password' };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken() {
    return { accessToken: 'token' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout() {
    return;
  }

  @Get('oauth/:provider')
  async oauthLogin(@Param('provider') provider: 'google' | 'github') {
    const redirectUrl = `https://auth.${provider}.com/oauth`;
    return { message: `redirect url ${redirectUrl}` };
  }

  @Get('oauth/:provider/callback')
  @HttpCode(HttpStatus.OK)
  async oauthCallback(@Param('provider') provider: 'google' | 'github') {
    return { message: `OAuth callback from ${provider} successful` };
  }
}