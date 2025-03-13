import { Injectable } from '@nestjs/common';
import { Notification } from '../../../../core/notification/notification';
import { CryptoService } from '../../../../core/services/crypto/crypto.service';
import { User } from '../../domain/user.entity';
import { UserRepository } from '../../infrastructure/users.repository';
import {ProviderType} from "@prisma/client";
import {OAuthAccountRepository} from "../../infrastructure/oauth-account.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoService: CryptoService,
    private readonly oauthAccountRepository: OAuthAccountRepository
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

  async createUserWhenRegistrationByProvider(userName: string, email: string){
    let user:User
    let existingUserByUsername: User = await this.userRepository.findByUsername(userName);
    let uniqueUsername: string = userName;
    if (existingUserByUsername) {
      uniqueUsername = `${userName}-${Math.floor(Math.random() * 1000)}`;
    }
    user = User.create(uniqueUsername, null, email);
    user.confirmEmail();

    // ??? send registration email
    // await this.mailService.sendRegistrationEmail(email);

    await this.userRepository.create(user);
    return user
  }

  async createOauthBodyAndAddToDB(
      userId: number,
      provider: ProviderType,
      providerId: string,
      email: string
  ){
    const oauthAccountData = {
      userId,
      provider,
      providerId,
      email
    };
    await this.oauthAccountRepository.create(oauthAccountData);
  }
}