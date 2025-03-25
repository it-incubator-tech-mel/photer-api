import { Injectable } from '@nestjs/common';
import { Notification } from '../../../../../base/notification/notification';
import { CryptoService } from '../../../../core/services/crypto/crypto.service';
import { User } from '../../domain/user.entity';
import { UserRepository } from '../../infrastructure/users.repository';
import { ProviderType } from '@prisma/client';
import { OAuthAccountRepository } from '../../infrastructure/oauth-account.repository';
import { MailerService } from '../../../../core/services/mailler/mailer.service';
import { oAuthRegistrationEmailTemplate } from '../../../../core/services/mailler/email-templates/oauth-registration-email-template';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoService: CryptoService,
    private readonly oauthAccountRepository: OAuthAccountRepository,
    private readonly mailerService: MailerService,
  ) {}

  // local-strategy
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<Notification<number>> {
    const user: User | null =
      await this.userRepository.findByEmail(loginOrEmail);

    if (
      !user ||
      !user.getPassword() ||
      !(await this.cryptoService.compare(password, user.getPassword()))
    ) {
      return Notification.unauthorized('Wrong email or password');
    }

    return Notification.success(user.getId());
  }

  // jwt-strategy; refresh-token-strategy
  async validateUserById(id: number): Promise<Notification> {
    const user: User | null = await this.userRepository.findById(id);

    if (!user) {
      return Notification.notFound('Wrong user id');
    }

    return Notification.success();
  }

  async validateUserByIdAndReturnBodyUser(
    id: number,
  ): Promise<Notification<User>> {
    const user: User | null = await this.userRepository.findById(id);

    if (!user) {
      return Notification.notFound('Wrong user id');
    }

    return Notification.success(user);
  }

  // GoogleStrategy
  async handleOAuthLogin(
    providerType: ProviderType,
    providerId: string,
    email: string,
    username?: string,
    displayName?: string,
  ): Promise<User> {
    // 1) find user by email
    const foundUser: User = await this.userRepository.findByEmail(email);

    // 2) find oAuthAccount by provideId and providerType
    const oAuthAccount =
      await this.oauthAccountRepository.findByProviderTypeAndProviderId(
        providerType,
        providerId,
      );

    if (oAuthAccount) {
      // 3) oAuthAccount found, update email and return user
      await this.oauthAccountRepository.updateEmail(
        providerId,
        providerType,
        email,
      );
      return (
        foundUser ?? (await this.userRepository.findById(oAuthAccount.userId))
      );
    }

    if (foundUser) {
      // 4) If foundUser, but oAuthAccount no, create oAuthAccount
      await this.oauthAccountRepository.create(
        foundUser.getId(),
        providerType,
        providerId,
        email,
      );
      return foundUser;
    }

    // 5) If no user, create user and oAuthAccount
    const usernameFromProvider: string =
      username || displayName || email.split('@')[0];
    await this.createUserWhenRegistrationByProvider(
      usernameFromProvider,
      email,
    );

    const newUser: User =
      await this.userRepository.findByUsername(usernameFromProvider);
    await this.oauthAccountRepository.create(
      newUser.getId(),
      providerType,
      providerId,
      email,
    );

    await this.mailerService.sendEmail(
      newUser.getEmail(),
      oAuthRegistrationEmailTemplate(newUser.getUsername()),
      'Account Created Successfully',
    );

    return newUser;
  }

  async createUserWhenRegistrationByProvider(
    userName: string,
    email: string,
  ): Promise<void> {
    let user: User;

    const existingUserByUsername: User =
      await this.userRepository.findByUsername(userName);

    // generate unique username
    let uniqueUsername: string = userName;
    if (existingUserByUsername) {
      uniqueUsername = `${userName}-${Math.floor(Math.random() * 1000)}`;
    }

    // create new domain user and confirm email
    user = User.create(uniqueUsername, null, email);
    user.confirmEmail();

    // save domain user in db
    await this.userRepository.create(user);
  }
}
