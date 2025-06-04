import { User } from '../domain/user.entity';

export abstract class IUserRepository {
  abstract create(user: User): Promise<void>;
  abstract findById(id: number): Promise<User | null>;
  abstract findByUsername(username: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByConfirmationCode(
    confirmationCode: string,
  ): Promise<User | null>;
  abstract updateOrCreatePasswordRecovery(user: User): Promise<void>;
  abstract findUserByRecoveryCode(recoveryCode: string): Promise<User | null>;
  abstract updateConfirmation(user: User): Promise<void>;
  // TODO: check
  abstract update(user: User): Promise<User>;
  // abstract markAsDeleted(id: number): Promise<void>;
}
