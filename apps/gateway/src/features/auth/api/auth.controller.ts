import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post, Redirect,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegistrationDto } from './dto/input/registration.dto';
import { CommandBus } from '@nestjs/cqrs';
import { LoginDto } from './dto/input/login.dto';
import { PasswordRecoveryDto } from './dto/input/password-recovery.dto';
import { NewPasswordDto } from './dto/input/new-password.dto';
import { ConfirmRegistrationDto } from './dto/input/confirm-registration.dto';
import { RegistrationEmailResendingDto } from './dto/input/registration-email-resending.dto';
import { RegistrationUserCommand } from '../application/use-cases/registration.use-case';
import { Response } from 'express';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { APIErrorResult } from '../../../core/swagger/api-error/error-response.dto';
import { Notification, ResultStatus } from '../../../../base/notification/notification';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '../../../core/exception-filters/exceptions/exception-types';
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
import { LocalAuthGuard } from '../../../core/guards/local-auth.guard';
import { RefreshTokenAuthGuard } from '../../../core/guards/refresh-token-auth.guard';
import { CurrentDeviceId } from '../../../core/decorators/param-decorators/current-device-id.decorator';
import { CurrentDeviceIat } from '../../../core/decorators/param-decorators/current-device-iat.decorator';
import {
  CurrentUserIdFromDevice,
} from '../../../core/decorators/param-decorators/current-user-id-from-device.decorator';
import { BearerAuthGuard } from '../../../core/guards/bearer-auth.guard';
import { AuthMeOutputDto } from './dto/output/auth-me.dto';
import { UserQueryRepository } from '../infrastructure/users.query-repository';
import { ReCaptchaService } from '../../../core/services/reCaptcha/reCaptcha.service';
import { GoogleGuard } from '../../../core/guards/google.guard';
import { GitHubGuard } from '../../../core/guards/github.guard';
import { OAuthCommand } from '../application/use-cases/oauth.use-case';
import { PasswordRecoveryResendingDto } from './dto/input/password-recovery-resending.dto';
import { PasswordRecoveryResendingCommand } from '../application/use-cases/password-recovery-resending.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userQueryRepository: UserQueryRepository,
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
  @ApiOperation({ summary: 'Resend confirmation registration email if user exists' })
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
    description: 'Returns JWT accessToken (expired after 60 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired 5 minutes).',
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
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @CurrentUserId() userId: number,
    @Cookie('refreshToken') refreshToken: string,
    @Ip() ip: string,
    @UserAgent() userAgent: string,
    @Body() loginDto: LoginDto,
    @Res() res: Response,
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
      // sameSite: 'strict', // protects against CSRF attacks
      sameSite: 'none',
    });

    res.status(HttpStatus.OK).send({
      accessToken: result.data.accessToken,
    });
  }

  @Post('password-recovery')
  @ApiOperation({ summary: 'Password recovery via Email confirmation. Email should be send with RecoveryCode inside' })
  @ApiResponse({
    status: 204,
    description: 'Email with confirmation code will be send to passed email address',
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
  @ApiResponse({
    status: 404,
    description: 'If user with this email does not exist',
  })
  @ApiResponse({ status: 429, description: 'More than 5 attempts from one IP-address during 10 seconds' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() passwordRecoveryDto: PasswordRecoveryDto) {
    if (await this.reCaptchaService.isValue(passwordRecoveryDto.recaptchaValue)) {
      const result: Notification = await this.commandBus.execute<
        PasswordRecoveryUseCommand,
        Notification
      >(new PasswordRecoveryUseCommand(passwordRecoveryDto.email));

      if (result.status === ResultStatus.NotFound) {
        throw new NotFoundException(result.errorMessage);
      }

    } else {
      throw new BadRequestException([{ field: 'Captcha', message: 'Incorrect captcha' }]);
    }
  }

  @Post('password-recovery-resending')
  @ApiOperation({ summary: 'Resend password recovery link via email' })
  @ApiResponse({ status: 204, description: 'Email with a new recovery link has been sent' })
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
  @ApiResponse({ status: 404, description: 'If user with this email does not exist' })
  @ApiResponse({ status: 429, description: 'More than 5 attempts from one IP-address during 10 seconds' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRecoveryLink(@Body() dto: PasswordRecoveryResendingDto) {
    const result: Notification = await this.commandBus.execute(
      new PasswordRecoveryResendingCommand(dto.email),
    );

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException('User with this email does not exist');
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
  @ApiSecurity('refreshToken')
  @ApiOperation({ summary: 'Generate new pair of access and refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT accessToken (expired after 60 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired 5 minutes).',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @CurrentUserIdFromDevice() userId: number,
    @CurrentDeviceId() deviceId: string,
    @CurrentDeviceIat() iat: string,
    @Res() res: Response,
  ) {
    const result: Notification<null | { accessToken: string; refreshToken: string }> =
      await this.commandBus.execute<
        RefreshTokenCommand,
        Notification<null | { accessToken: string; refreshToken: string }>
      >(new RefreshTokenCommand(userId, deviceId, iat));

    if (result.status === ResultStatus.Unauthorized || !result.data) {
      throw new UnauthorizedException();
    }

    res.cookie('refreshToken', result.data.refreshToken, {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true, // send cookie only over https
      // sameSite: 'strict', // protects against CSRF attacks
      sameSite: 'none',
    });

    res.status(HttpStatus.OK).send({
      accessToken: result.data.accessToken!,
    });
  }

  @Post('logout')
  @ApiSecurity('refreshToken')
  @ApiOperation({ summary: 'In cookie client must send correct refreshToken that will be revoked' })
  @ApiResponse({ status: 204, description: 'Logout successfully' })
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentDeviceId() deviceId: string,
    @CurrentDeviceIat() iat: string,
    @Res() res: Response,
  ) {
    const result: Notification = await this.commandBus.execute<LogoutCommand, Notification>(
      new LogoutCommand(deviceId, iat),
    );

    if (result.status === ResultStatus.Unauthorized) {
      throw new UnauthorizedException();
    }

    res.clearCookie('refreshToken', {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true, // send cookie only over https
      // sameSite: 'strict', // protects against CSRF attacks
      sameSite: 'none',
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @Get('me')
  @ApiSecurity('bearer')
  @ApiOperation({ summary: 'Get information about current user' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: AuthMeOutputDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.OK)
  async authMe(@CurrentUserId() userId: number) {
    const user: AuthMeOutputDto = await this.userQueryRepository.findAuthenticatedUserById(userId);

    if (!user) throw new UnauthorizedException();

    return user;
  }

  @Get('oauth/google/login')
  @ApiOperation({ summary: 'Redirects user to Google authentication' })
  @ApiResponse({
    status: 200,
    description: 'Redirects the user to Google OAuth login page.',
  })
  @ApiResponse({ status: 429, description: 'More than 5 attempts from one IP-address during 10 seconds' })
  @UseGuards(GoogleGuard)
  @HttpCode(HttpStatus.OK)
  async googleLogin() {
  }

  @Get('oauth/google/callback')
  @ApiOperation({ summary: 'Handles Google OAuth callback and issues tokens' })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT accessToken (expired after 60 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired 5 minutes).',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized if the authentication fails.',
  })
  @ApiResponse({ status: 429, description: 'More than 5 attempts from one IP-address during 10 seconds' })
  @Redirect('https://photer.ltd/oauth')
  @HttpCode(HttpStatus.OK)
  @UseGuards(GoogleGuard)
  async oauthCallbackGoogle(
    @Req() req: any,
    @Res() res: Response,
    @Ip() ip: string,
    @UserAgent() userAgent: string) {
    const result: Notification<null | {
      accessToken: string;
      refreshToken: string;
    }> = await this.commandBus.execute<OAuthCommand, Notification<null | {
      accessToken: string;
      refreshToken: string
    }>>(
      new OAuthCommand(req.user, ip, userAgent));

    if (result.status === ResultStatus.Unauthorized || !result.data) {
      throw new UnauthorizedException(result.errorMessage);
    }

    res.cookie('refreshToken', result.data.refreshToken, {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true, // send cookie only over https
      sameSite: 'none',
    });
  }

  @Get('oauth/github/login')
  @ApiOperation({ summary: 'Redirects user to GitHub authentication' })
  @ApiResponse({ status: 200, description: 'Redirects the user to GitHub OAuth login page.' })
  @ApiResponse({ status: 429, description: 'More than 5 attempts from one IP-address during 10 seconds' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(GitHubGuard)
  async githubLogin() {
  }

  @Get('oauth/github/callback')
  @ApiOperation({ summary: 'Handles GitHubGuard OAuth callback and issues tokens' })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT accessToken (expired after 60 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired 5 minutes).',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized if the authentication fails.',
  })
  @ApiResponse({ status: 429, description: 'More than 5 attempts from one IP-address during 10 seconds' })
  @Redirect('https://photer.ltd/oauth')
  @HttpCode(HttpStatus.OK)
  @UseGuards(GitHubGuard)
  async oauthCallbackGithub(
    @Req() req: any,
    @Res() res: Response,
    @Ip() ip: string,
    @UserAgent() userAgent: string) {
    const result: Notification<null | {
      accessToken: string;
      refreshToken: string;
    }> = await this.commandBus.execute<OAuthCommand, Notification<null | {
      accessToken: string;
      refreshToken: string
    }>>(
      new OAuthCommand(req.user, ip, userAgent));

    if (result.status === ResultStatus.Unauthorized || !result.data) {
      throw new UnauthorizedException(result.errorMessage);
    }

    res.cookie('refreshToken', result.data.refreshToken, {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true, // send cookie only over https
      // sameSite: 'strict', // protects against CSRF attacks
      sameSite: 'none',
    });
  }
}