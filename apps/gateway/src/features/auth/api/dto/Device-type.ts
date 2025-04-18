export class DeviceClass {
  constructor(
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public userId: number,
  ) {}
}
export type BodyDeviceToDB = {
  id: number;
  ip: string;
  title: string;
  lastActiveDate: string;
  userId: number;
};
