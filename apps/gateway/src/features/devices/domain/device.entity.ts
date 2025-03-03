export class Device {
  private constructor(
    private readonly id: string,
    private userId: number,
    private deviceName: string,
    private ip: string,
    private iat: Date,
    private exp: Date,
    private isDeleted: boolean,
  ) {}

  static create(deviceId: string, userId: number, deviceName: string, ip: string, iat: number, exp: number): Device {
    return new Device(
      deviceId,
      userId,
      deviceName,
      ip,
      new Date(iat * 1000),
      new Date(exp * 1000),
      false
    );
  }

  static restore(
    id: string,
    userId: number,
    deviceName: string,
    ip: string,
    iat: Date,
    exp: Date,
    isDeleted: boolean,
  ): Device {
    return new Device(
      id,
      userId,
      deviceName,
      ip,
      iat,
      exp,
      isDeleted
    );
  }

  getId(): string {
    return this.id;
  }

  getUserId(): number {
    return this.userId;
  }

  getDeviceName(): string {
    return this.deviceName;
  }

  getIp(): string {
    return this.ip;
  }

  getIat(): Date {
    return this.iat;
  }

  getExp(): Date {
    return this.exp;
  }

  getIsDeleted(): boolean {
    return this.isDeleted;
  }
}