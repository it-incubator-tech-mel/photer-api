export class Profile {
  constructor(
    private readonly id: number,
    private userId: number,
    private firstName: string,
    private lastName: string,
    private createdAt: Date,
    private updatedAt: Date,
    private birthDate?: Date,
    private country?: string,
    private city?: string,
    private aboutMe?: string,
    private avatarUrl?: string,
  ) {}

  static create(
    userId: number,
    firstName: string,
    lastName: string,
    birthDate?: Date,
    country?: string,
    city?: string,
    aboutMe?: string,
  ): Profile {
    const now: Date = new Date();
    return new Profile(
      0,
      userId,
      firstName,
      lastName,
      now, // createdAt
      now, // updatedAt
      birthDate,
      country,
      city,
      aboutMe,
      undefined,
    );
  }

  static createBasic(userId: number) {
    const now: Date = new Date();
    return new Profile(
      0,
      userId,
      '',
      '',
      now, // createdAt
      now, // updatedAt
    );
  }

  static restore(
    id: number,
    userId: number,
    firstName: string,
    lastName: string,
    createdAt: Date,
    updatedAt: Date,
    birthDate?: Date,
    country?: string,
    city?: string,
    aboutMe?: string,
    avatarUrl?: string,
  ): Profile {
    return new Profile(
      id,
      userId,
      firstName,
      lastName,
      createdAt,
      updatedAt,
      birthDate,
      country,
      city,
      aboutMe,
      avatarUrl,
    );
  }

  update(
    firstName?: string,
    lastName?: string,
    birthDate?: Date,
    country?: string,
    city?: string,
    aboutMe?: string,
  ): void {
    if (firstName !== undefined) this.firstName = firstName;
    if (lastName !== undefined) this.lastName = lastName;
    if (birthDate !== undefined) this.birthDate = birthDate;
    if (country !== undefined) this.country = country;
    if (city !== undefined) this.city = city;
    if (aboutMe !== undefined) this.aboutMe = aboutMe;

    this.updatedAt = new Date();
  }

  updateAvatarUrl(avatarUrl?: string) {
    if (avatarUrl !== undefined) {
      this.avatarUrl = avatarUrl;
      this.updatedAt = new Date();
    }
  }

  deleteAvatar(): void {
    this.avatarUrl = undefined;
    this.updatedAt = new Date();
  }

  // getters

  getId(): number {
    return this.id;
  }

  getUserId(): number {
    return this.userId;
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getBirthDate(): Date | undefined {
    return this.birthDate;
  }

  getCountry(): string | undefined {
    return this.country;
  }

  getCity(): string | undefined {
    return this.city;
  }

  getAboutMe(): string | undefined {
    return this.aboutMe;
  }

  getAvatarUrl(): string | undefined {
    return this.avatarUrl;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
