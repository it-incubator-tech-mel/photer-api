import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { RegistrationDto } from './dto/registration.dto';
import { CommandBus } from '@nestjs/cqrs';
import { LoginDto } from './dto/login.dto';
import { PasswordRecoveryDto } from './dto/password-recovery.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { ConfirmRegistrationDto } from './dto/confirm-registration.dto';
import { RegistrationEmailResendingDto } from './dto/registration-email-resending.dto';
import { RegistrationUserCommand } from '../application/use-cases/registration.use-case';
import { Request, Response } from 'express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { APIErrorResult } from '../../../core/swagger/api-error/error-response.dto';
import { Notification, ResultStatus } from '../../../core/notification/notification';
import { BadRequestException, UnauthorizedException } from '../../../core/exception-filters/exceptions/exception-types';
import { ConfirmRegistrationCommand } from '../application/use-cases/confirm-registration.use-case';
import { RegistrationEmailResendingCommand } from '../application/use-cases/registration-email-resending.use-case';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.decorator';
import { Cookie } from '../../../core/decorators/param-decorators/cookie.decorator';
import { Ip } from '@nestjs/common/decorators/http/route-params.decorator';
import { UserAgent } from '../../../core/decorators/param-decorators/user-agent.decorator';
import { LoginCommand } from '../application/use-cases/login.use-case';
import { NewPasswordCommand } from '../application/use-cases/new-password.use-case';
import { PasswordRecoveryUseCommand } from '../application/use-cases/password-recovery.use-case';
import { LogoutCommand } from '../application/use-cases/logout.use-case';
import { RefreshTokenCommand } from '../application/use-cases/refreshToken.use-case';
import { ReCaptchaService } from '../../../core/services/reCaptcha/reCaptcha.service';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly reCaptchaService: ReCaptchaService,
  ) {
  }

  @Post('registration')
  @ApiOperation({ summary: 'Registration in the system. Email will be send to passed email address' })
  @ApiResponse({
    status: 204,
    description: 'Input data is accepted. Email with confirmation code will be send to passed email address',
  })
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
    const { username, email, password } = registrationDto;

    const result: Notification<string | null> = await this.commandBus.execute<
      RegistrationUserCommand,
      Notification<string | null>
    >(new RegistrationUserCommand(username, email, password));

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.extensions);
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

    const result: Notification = await this.commandBus.execute<
      ConfirmRegistrationCommand,
      Notification
    >(
      new ConfirmRegistrationCommand(code),
    );

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.extensions);
    }
  }

  @Post('registration-email-resending')
  @ApiOperation({ summary: 'Resend confirmation registration. Email if user exists' })
  @ApiResponse({
    status: 204,
    description: 'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere',
  })
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
      throw new BadRequestException(result.extensions);
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Try login user to the system' })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT accessToken (expired after 5 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 24 hours).',
  })
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
  @ApiResponse({ status: 401, description: 'If the password or login is wrong' })
  @ApiResponse({ status: 429, description: 'More than 5 attempts from one IP-address during 10 seconds' })
  @HttpCode(HttpStatus.OK)
  async login(
    @CurrentUserId() userId: number,
    @Cookie('refreshToken') refreshToken: string,
    @Ip() ip: string,
    @UserAgent() userAgent: string,
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {

    const result: Notification<null | {
      accessToken: string;
      refreshToken: string;
    }> = await this.commandBus.execute<LoginCommand, Notification<null | {
      accessToken: string;
      refreshToken: string
    }>>(
      new LoginCommand(userId, ip, userAgent, refreshToken));

    if (result.status === ResultStatus.Unauthorized || !result.data) {
      throw new UnauthorizedException(result.errorMessage);
    }

    res.cookie('refreshToken', result.data.refreshToken, {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true, // send cookie only over https
    });

    res.status(HttpStatus.OK).send({
      accessToken: result.data.accessToken,
    });
  }

  @Post('password-recovery')
  @ApiOperation({ summary: 'Password recovery via Email confirmation. Email should be send with RecoveryCode inside' })
  @ApiResponse({
    status: 204,
    description: 'Even if current email is not registered (for prevent user\'s email detection)',
  })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has invalid email (for example 222^gmail.com)',
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
  async passwordRecovery(@Body() passwordRecoveryDto: PasswordRecoveryDto) {
    if (await this.reCaptchaService.isValue(passwordRecoveryDto.recaptchaValue)) {
      await this.commandBus.execute<
        PasswordRecoveryUseCommand,
        Notification
      >(new PasswordRecoveryUseCommand(passwordRecoveryDto.email));

      // to prevent user's email detection send NO_CONTENT
      // for user by email not found or email send successfully

      // if (result.status === ResultStatus.Unauthorized) throw new UnauthorizedException(result.errorMessage);
    } else {
      throw new BadRequestException([{ field: 'Captcha', message: 'Incorrect captcha' }]);
    }
  }

  @Post('new-password')
  @ApiOperation({ summary: 'Confirm password recovery' })
  @ApiResponse({ status: 204, description: 'If code is valid and new password is accepted' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired',
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
    const result: Notification = await this.commandBus.execute<
      NewPasswordCommand,
      Notification
    >(new NewPasswordCommand(newPasswordDto));

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.extensions!);
    }

  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Generate new pair of access and refresh token. Update date in Device' })
  @ApiResponse({
    status: 200, description: 'Returns JWT accessToken in body and JWT refreshToken in cookie (http-only, secure).',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Cookie('refreshToken') refreshToken: string,
    @CurrentUserId() userId: number,
    @Res({ passthrough: true }) res: Response) {
    const loginResult: Notification<null | {
      accessToken: string;
      refreshToken: string;
    }> = await this.commandBus.execute<RefreshTokenCommand, Notification<null | {
      accessToken: string;
      refreshToken: string
    }>>(
      new RefreshTokenCommand(refreshToken));

    if (loginResult.status === ResultStatus.Unauthorized || !loginResult.data) {
      throw new UnauthorizedException(loginResult.errorMessage);
    }

    res.cookie('refreshToken', loginResult.data.refreshToken, {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true, // send cookie only over https
    });

    res.status(HttpStatus.OK).send({
      accessToken: loginResult.data.accessToken,
    });
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout in account' })
  @ApiResponse({
    status: 204, description: 'Are you really want to log out\n' +
      'of your account ___email name___?',
  })
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
  async logout(@Req() req: Request) {
    await this.commandBus.execute<LogoutCommand, Notification>(
      new LogoutCommand(req.cookies.refreshToken));
    return HttpCode;
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