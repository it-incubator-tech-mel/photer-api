import { Body, Controller, Get, HttpCode, HttpStatus, Param, Headers, Post, Req, Res } from '@nestjs/common';
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
import {userAgentType} from "./dto/variable types/variable-types-for-authorization";
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { APIErrorResult } from '../../../core/swagger/api-error/error-response.dto';
import { Notification, ResultStatus } from '../../../core/notification/notification';
import { BadRequestException, UnauthorizedException } from '../../../core/exception-filters/exceptions/exception-types';
import { ConfirmRegistrationCommand } from '../application/use-cases/confirm-registration.use-case';
import { RegistrationEmailResendingCommand } from '../application/use-cases/registration-email-resending.use-case';
import {NewPasswordCommand} from "../application/use-cases/new-password.use-case";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus
  ) {}

  @Post('registration')
  @ApiOperation({ summary: 'Registration in the system. Email will be send to passed email address' })
  @ApiResponse({ status: 204, description: 'Input data is accepted. Email with confirmation code will be send to passed email address' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values (in particular if the user with the given email or username already exists',
    type: APIErrorResult,
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Validation failed',
          errorsMessages: [],
        },
      },
    },
  })
  @ApiResponse({ status: 429, description: 'More than 5 attempts from one IP-address during 10 seconds' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() registrationDto: RegistrationDto) {
    const { username, email, password} = registrationDto;

    const result: Notification<string | null> = await this.commandBus.execute<
      RegistrationUserCommand,
      Notification<string | null>
    >(new RegistrationUserCommand(username, email, password));

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.extensions!);
    }
  }

  @Post('registration-confirmation')
  @ApiOperation({ summary: 'Confirm registration' })
  @ApiResponse({ status: 204, description: 'Email was verified. Account was activated' })
  @ApiResponse({
    status: 400,
    description: 'If the confirmation code is incorrect, expired or already been applied',
    type: APIErrorResult,
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Validation failed',
          errorsMessages: [],
        },
      },
    },
  })
  @ApiResponse({ status: 429, description: 'More than 5 attempts from one IP-address during 10 seconds' })
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(@Body() confirmRegistrationDto: ConfirmRegistrationDto) {
    const { code } = confirmRegistrationDto;

    const result: Notification = await this.commandBus.execute(
      new ConfirmRegistrationCommand(code),
    );

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.extensions!);
    }
  }

  @Post('registration-email-resending')
  @ApiOperation({ summary: 'Resend confirmation registration. Email if user exists' })
  @ApiResponse({ status: 204, description: 'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
    type: APIErrorResult,
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Validation failed',
          errorsMessages: [],
        },
      },
    },
  })
  @ApiResponse({ status: 429, description: 'More than 5 attempts from one IP-address during 10 seconds' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() registrationEmailResendingDto: RegistrationEmailResendingDto) {
    const { email } = registrationEmailResendingDto;

    const result: Notification = await this.commandBus.execute<
      RegistrationEmailResendingCommand,
      Notification
    >(new RegistrationEmailResendingCommand(email));

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.extensions!);
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'authorization' })
  @ApiResponse({ status: 200, description: '' })
  @ApiResponse({
    status: 400,
    description: 'If the confirmation code is incorrect, expired or already been applied',
    type: APIErrorResult,
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Validation failed',
          errorsMessages: [],
        },
      },
    },
  })
  @ApiResponse({ status: 429, description: 'More than 5 attempts from one IP-address during 10 seconds' })
  @HttpCode(HttpStatus.OK)
  async login(
      @Headers() header: Record<string, string>,
      @Body() loginDto: LoginDto,
      @Res({ passthrough: true }) response: Response,
      @Req() req: Request,) {
    const userAgent: userAgentType = {
      IP: req.ip,
      deviceName: header['user-agent'],
    };
    const { accessToken, refreshToken } = await this.commandBus.execute(
        new LoginUserCommand(loginDto, userAgent))
    if (!accessToken || !refreshToken) throw new UnauthorizedException()
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
  @ApiOperation({ summary: 'Create new password and update data' })
  @ApiResponse({ status: 204, description: 'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
    type: APIErrorResult,
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Validation failed',
          errorsMessages: [],
        },
      },
    },
  })
  @ApiResponse({ status: 429, description: 'More than 5 attempts from one IP-address during 10 seconds' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() newPasswordDto: NewPasswordDto) {
    await this.commandBus.execute<NewPasswordCommand, Notification<string | null>
    >(new NewPasswordCommand(newPasswordDto.newPassword, newPasswordDto.recoveryCode))
    return HttpCode
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