import { Injectable } from '@nestjs/common';
import { Notification } from '../../../../../base/notification/notification';
import { CryptoService } from '../../../../core/services/crypto/crypto.service';
import { User } from '../../domain/user.entity';
import { UserRepository } from '../../infrastructure/users.repository';
import { ProviderType } from '@prisma/client';
import { OAuthAccountRepository } from '../../infrastructure/oauth-account.repository';
import { MailerService } from '../../../../core/services/mailler/mailer.service';
import {
  oAuthRegistrationEmailTemplate
} from '../../../../core/services/mailler/email-templates/oauth-registration-email-template';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoService: CryptoService,
    private readonly oauthAccountRepository: OAuthAccountRepository,
    private readonly mailerService: MailerService,
  ) {
  }

  // local-strategy
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<Notification<number>> {
    const user: User | null =
      await this.userRepository.findByEmail(loginOrEmail);

    if (!user|| !user.getPassword() || !(await this.cryptoService.compare(password, user.getPassword()))) {
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

  async validateUserByIdAndReturnBodyUser(id: number): Promise<Notification<User>> {
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
    let user: User;

    // 1) find user by email
    const foundUser: User = await this.userRepository.findByEmail(email);

    // 2) find oAuthAccount by provideId and providerType
    let oAuthAccount = await this.oauthAccountRepository.findByProviderTypeAndProviderId(providerType, providerId);

    if (foundUser) {
      if (!oAuthAccount) {
        // 4) create oAuthAccount; send email
        await this.oauthAccountRepository.create(foundUser.getId(), providerType, providerId, email);

        // send registration email
        await this.mailerService.sendEmail(
          foundUser.getEmail(),
          oAuthRegistrationEmailTemplate(foundUser.getUsername()),
          'Account Created Successfully',
        );
      } else {
        // 3) merge oAuthAccount (update email)
        await this.oauthAccountRepository.updateEmail(providerId, providerType, email);
      }
      user = foundUser;
    } else {
      // 5) create user; create oAuthAccount; send email
      const usernameFromProvider: string = username || displayName || email.split('@')[0];

      // create user
      await this.createUserWhenRegistrationByProvider(usernameFromProvider, email);

      // find created user
      user = await this.userRepository.findByUsername(usernameFromProvider);

      // create new oAuthAccount for created user
      await this.oauthAccountRepository.create(user.getId(), providerType, providerId, email);

      // send registration email
      await this.mailerService.sendEmail(
        user.getEmail(),
        oAuthRegistrationEmailTemplate(user.getUsername()),
        'Account Created Successfully',
      );
    }

    return user;
  }

  async createUserWhenRegistrationByProvider(userName: string, email: string): Promise<void> {
    let user: User;

    let existingUserByUsername: User = await this.userRepository.findByUsername(userName);

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