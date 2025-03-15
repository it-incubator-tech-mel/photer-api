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

  // GoogleStrategy
/*  async registerWithProvider(usernameFromProvider: string, email: string, providerId: string) {
    // find by email
    let user: User = await this.userRepository.findByEmail(email);

    if (!user) {
      // create if not exist
      user = await this.createUserWhenRegistrationByProvider(usernameFromProvider, email);
    }

    await this.oauthAccountRepository.updateOrCreate(user.getId(), ProviderType.GOOGLE, providerId, email);

    return user;
  }*/
}