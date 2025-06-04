import { randomUUID } from 'crypto';
import { add } from 'date-fns';

export class User {
  private constructor(
    private readonly id: number,
    private username: string,
    private password: string | null,
    private email: string,
    private createdAt: Date,
    private updatedAt: Date,
    private isDeleted: boolean,
    private confirmationCode: string,
    private confirmationExpiration: Date,
    private isConfirmed: boolean,
    private recoveryCode: string | null,
    private recoveryExpiration: Date | null,
  ) {}

  static create(
    username: string,
    passwordHash: string | null,
    email: string,
  ): User {
    return new User(
      0, // In DB auto-increment
      username,
      passwordHash,
      email,
      new Date(),
      new Date(),
      false,
      randomUUID(),
      add(new Date(), { hours: 1, minutes: 30 }),
      false,
      null,
      null,
    );
  }

  // create User using data from db
  static restore(
    id: number,
    username: string,
    password: string | null,
    email: string,
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean,
    confirmationCode: string,
    confirmationExpiration: Date,
    isConfirmed: boolean,
    recoveryCode: string | null,
    recoveryExpiration: Date | null,
  ): User {
    return new User(
      id,
      username,
      password,
      email,
      createdAt,
      updatedAt,
      isDeleted,
      confirmationCode,
      confirmationExpiration,
      isConfirmed,
      recoveryCode,
      recoveryExpiration,
    );
  }

  updateUsername(newUsername: string): boolean {
    if (this.username === newUsername) return false;

    if (newUsername.length < 3 || newUsername.length > 30) {
      throw new Error('Invalid username length');
    }

    if (!/^[a-zA-Z0-9_-]*$/.test(newUsername)) {
      throw new Error('Username contains invalid characters');
    }

    this.username = newUsername;
    this.updatedAt = new Date();
    return true;
  }

  // getters

  getId(): number {
    return this.id;
  }

  getUsername(): string {
    return this.username;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getIsDeleted(): boolean {
    return this.isDeleted;
  }

  getConfirmationCode(): string {
    return this.confirmationCode;
  }

  getConfirmationExpiration(): Date {
    return this.confirmationExpiration;
  }

  isEmailConfirmed(): boolean {
    return this.isConfirmed;
  }

  getRecoveryCode(): string | null {
    return this.recoveryCode;
  }

  getRecoveryExpiration(): Date | null {
    return this.recoveryExpiration;
  }

  // email confirmation methods

  confirmEmail(): void {
    if (this.isEmailConfirmed()) {
      throw new Error('Email already confirmed');
    }
    this.isConfirmed = true;
    this.updatedAt = new Date();
  }

  updateConfirmationCode(code: string, expiration: Date): void {
    this.confirmationCode = code;
    this.confirmationExpiration = expiration;
    this.updatedAt = new Date();
  }

  // password recovery methods

  requestPasswordRecovery(): void {
    this.recoveryCode = randomUUID();
    this.recoveryExpiration = add(new Date(), { hours: 1, minutes: 30 });
    this.updatedAt = new Date();
  }

  isPasswordRecoveryExpired(): boolean {
    if (!this.recoveryExpiration) return true;
    return new Date() > this.recoveryExpiration;
  }

  updatePassword(newPasswordHash: string): void {
    if (this.isPasswordRecoveryExpired()) {
      throw new Error('Recovery code has expired');
    }

    this.password = newPasswordHash;
    this.updatedAt = new Date();
    this.recoveryCode = randomUUID();
    this.recoveryExpiration = new Date(0);
  }

  static ViewModel(user: User) {
    return {
      id: user.getId(),
      userName: user.getUsername(),
      email: user.getEmail(),
      createdAt: user.getCreatedAt(),
    };
  }
}
