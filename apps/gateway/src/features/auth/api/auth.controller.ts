import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Redirect,
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
import {
  Notification,
  ResultStatus,
} from '../../../../base/notification/notification';
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
import { LocalAuthGuard } from '../../../core/guards/local-auth.guard';
import { RefreshTokenAuthGuard } from '../../../core/guards/refresh-token-auth.guard';
import { CurrentDeviceId } from '../../../core/decorators/param-decorators/current-device-id.decorator';
import { CurrentDeviceIat } from '../../../core/decorators/param-decorators/current-device-iat.decorator';
import { CurrentUserIdFromDevice } from '../../../core/decorators/param-decorators/current-user-id-from-device.decorator';
import { BearerAuthGuard } from '../../../core/guards/bearer-auth.guard';
import { AuthMeOutputDto } from './dto/output/auth-me.dto';
import { ReCaptchaService } from '../../../core/services/reCaptcha/reCaptcha.service';
import { OAuthCommand } from '../application/use-cases/oauth.use-case';
import { PasswordRecoveryResendingDto } from './dto/input/password-recovery-resending.dto';
import { PasswordRecoveryResendingCommand } from '../application/use-cases/password-recovery-resending.use-case';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { CurrentUser } from '../../../core/decorators/param-decorators/current-user.decorator';
import { OAuthLoginGuard } from '../../../core/guards/oauth/oauth.guard';
import { RefreshTokenCommand } from '../application/use-cases/refresh-token.use-case';
import { User } from '../../user/domain/user.entity';
import { UserQueryRepository } from '../../user/infrastructure/user.query-repository';
import { RegistrationSwaggerDocs } from './swagger/registration.swagger';
import { RegistrationConfirmationDocs } from './swagger/registration-confirmation.swagger';
import { RegistrationEmailResendingDocs } from './swagger/registration-email-resending.swagger';
import { LoginDocs } from './swagger/login.swagger';
import { PasswordRecoveryDocs } from './swagger/password-recovery.swagger';
import { PasswordRecoveryResendingDocs } from './swagger/password-recovery-resending.swagger';
import { NewPasswordDocs } from './swagger/new-password.swagger';
import { RefreshTokenDocs } from './swagger/refresh-token.swagger';
import { LogoutDocs } from './swagger/logout.swagger';
import { OauthProviderLoginDocs } from './swagger/oauth-provider-login.swagger';
import { OauthProviderCallbackDocs } from './swagger/oauth-provider-callback.swagger';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly reCaptchaService: ReCaptchaService,
  ) {}

  @Post('registration')
  @RegistrationSwaggerDocs()
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
  @RegistrationConfirmationDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(
    @Body() confirmRegistrationDto: ConfirmRegistrationDto,
  ) {
    const { code } = confirmRegistrationDto;

    const result: Notification = await this.commandBus.execute<
      ConfirmRegistrationCommand,
      Notification
    >(new ConfirmRegistrationCommand(code));

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.extensions);
    }
  }

  @Post('registration-email-resending')
  @RegistrationEmailResendingDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body() registrationEmailResendingDto: RegistrationEmailResendingDto,
  ) {
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
  @LoginDocs()
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
    }> = await this.commandBus.execute<
      LoginCommand,
      Notification<null | {
        accessToken: string;
        refreshToken: string;
      }>
    >(new LoginCommand(userId, ip, userAgent, refreshToken));

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
  @PasswordRecoveryDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() passwordRecoveryDto: PasswordRecoveryDto) {
    if (
      await this.reCaptchaService.isValue(passwordRecoveryDto.recaptchaValue)
    ) {
      const result: Notification = await this.commandBus.execute<
        PasswordRecoveryUseCommand,
        Notification
      >(new PasswordRecoveryUseCommand(passwordRecoveryDto.email));

      if (result.status === ResultStatus.NotFound) {
        throw new NotFoundException(result.errorMessage);
      }
    } else {
      throw new BadRequestException([
        { field: 'Captcha', message: 'Incorrect captcha' },
      ]);
    }
  }

  @Post('password-recovery-resending')
  @PasswordRecoveryResendingDocs()
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
  @NewPasswordDocs()
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

  @SkipThrottle()
  @Post('refresh-token')
  @RefreshTokenDocs()
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @CurrentUserIdFromDevice() userId: number,
    @CurrentDeviceId() deviceId: string,
    @CurrentDeviceIat() iat: string,
    @Res() res: Response,
  ) {
    const result: Notification<null | {
      accessToken: string;
      refreshToken: string;
    }> = await this.commandBus.execute<
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

  @SkipThrottle()
  @Post('logout')
  @LogoutDocs()
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentDeviceId() deviceId: string,
    @CurrentDeviceIat() iat: string,
    @Res() res: Response,
  ) {
    const result: Notification = await this.commandBus.execute<
      LogoutCommand,
      Notification
    >(new LogoutCommand(deviceId, iat));

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
  @SkipThrottle()
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
    const user: AuthMeOutputDto =
      await this.userQueryRepository.findAuthenticatedUserById(userId);

    if (!user) throw new UnauthorizedException();

    return user;
  }

  @SkipThrottle()
  @Get('oauth/:provider/login')
  @OauthProviderLoginDocs()
  @UseGuards(OAuthLoginGuard)
  @HttpCode(HttpStatus.OK)
  async oauthLogin() {}

  @SkipThrottle()
  @Get('oauth/:provider/callback')
  @OauthProviderCallbackDocs()
  @Redirect('https://photer.ltd/oauth')
  @UseGuards(OAuthLoginGuard)
  @HttpCode(HttpStatus.OK)
  async oauthCallback(
    @Param('provider') provider: 'google' | 'github',
    @Req() req: any,
    @Res() res: Response,
    @Ip() ip: string,
    @UserAgent() userAgent: string,
    @CurrentUser() user: User,
  ) {
    const result: Notification<{
      accessToken: string;
      refreshToken: string;
    } | null> = await this.commandBus.execute(
      new OAuthCommand(user, ip, userAgent),
    );

    if (result.status === ResultStatus.Unauthorized || !result.data) {
      throw new UnauthorizedException(result.errorMessage);
    }

    res.cookie('refreshToken', result.data.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
  }
}
