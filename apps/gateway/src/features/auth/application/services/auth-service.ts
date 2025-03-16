import { Injectable } from '@nestjs/common';
import { Notification } from '../../../../core/notification/notification';
import { CryptoService } from '../../../../core/services/crypto/crypto.service';
import { User } from '../../domain/user.entity';
import { UserRepository } from '../../infrastructure/users.repository';
import { ProviderType } from '@prisma/client';
import { OAuthAccountRepository } from '../../infrastructure/oauth-account.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoService: CryptoService,
    private readonly oauthAccountRepository: OAuthAccountRepository,
  ) {
  }

  // local-strategy
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<Notification<number>> {
    const user: User | null =
      await this.userRepository.findByEmail(loginOrEmail);

    if (!user || !(await this.cryptoService.compare(password, user.getPassword()))) {
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

    if (foundUser) {
      // console.log("foundUser", foundUser);
      // 2) merge oAuthAccount (may exist or no, register by other method)
      user = foundUser;
      await this.oauthAccountRepository.updateOrCreate(foundUser.getId(), providerType, providerId, email);
    } else {
      // 3) find oAuthAccount by provideId
      let oAuthAccount = await this.oauthAccountRepository.findByProviderTypeAndProviderId(providerType, providerId);

      if (oAuthAccount) {
        // console.log("oAuthAccount", oAuthAccount);
        // 4) change email in oauthAccount
        await this.oauthAccountRepository.updateEmail(providerId, providerType, email);
      } else {
        // console.log("!oAuthAccount !foundUser");
        // 5) create user and oAuthAccount
        const usernameFromProvider = username || displayName || email.split('@')[0];

        // create user
        await this.createUserWhenRegistrationByProvider(usernameFromProvider, email);

        // find created user
        user = await this.userRepository.findByUsername(usernameFromProvider);

        // create new oAuthAccount for created user
        await this.oauthAccountRepository.create(user.getId(), providerType, providerId, email);
      }
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

    // create new user and confirm email
    user = User.create(uniqueUsername, null, email);
    user.confirmEmail();

    // ??? send registration email
    // await this.mailService.sendRegistrationEmail(email);

    // save user in db
    await this.userRepository.create(user);
    // return user
  }
}