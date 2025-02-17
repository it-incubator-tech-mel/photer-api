export class PasswordRecovery {
  private constructor(
    public readonly userId: number,
    public recoveryCode: string,
    public expirationDate: Date,
  ) {}

  static createForUser(userId: number, recoveryCode: string): PasswordRecovery {
    return new PasswordRecovery(userId, recoveryCode, new Date(Date.now() + 3600000)); // 1 час на восстановление
  }

  isExpired(): boolean {
    return new Date() > this.expirationDate;
  }
}
