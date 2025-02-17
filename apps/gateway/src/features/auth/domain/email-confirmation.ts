export class EmailConfirmation {
  private constructor(
    public readonly userId: number,
    public confirmationCode: string,
    public expirationDate: Date,
    public isConfirmed: boolean = false,
  ) {}

  static createForUser(userId: number, confirmationCode: string): EmailConfirmation {
    return new EmailConfirmation(userId, confirmationCode, new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 часа на подтверждение
  }

  confirm(): void {
    this.isConfirmed = true;
  }

  isExpired(): boolean {
    return new Date() > this.expirationDate;
  }
}
