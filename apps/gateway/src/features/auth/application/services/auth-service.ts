import { Injectable } from '@nestjs/common';
import { Notification } from '../../../../core/notification/notification';
import { UserRepository } from '../../infrastructure/user.repository';
import { CryptoService } from '../../../../core/services/crypto/crypto.service';
import { User } from '../../domain/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoService: CryptoService,
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
}