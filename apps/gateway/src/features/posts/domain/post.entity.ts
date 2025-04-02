export class Post {
  private constructor(
    private readonly id: number,
    private description: string,
    private photo: string[],
    private userId: string,
    private createdAt: Date,
    private updatedAt: Date,
    private isDeleted: boolean,
  ) {}

  static create(description: string, photo: string[], userId: string): Post {
    return new Post(
      0, // In DB auto-increment
      description,
      photo,
      userId,
      new Date(),
      new Date(),
      false,
    );
  }

  // create User using data from db
  static restore(
    id: number,
    description: string,
    photo: string[],
    userId: string,
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean,
  ): Post {
    return new Post(
      id,
      description,
      photo,
      userId,
      createdAt,
      updatedAt,
      isDeleted,
    );
  }

  // getters

  getId(): number {
    return this.id;
  }

  getDescription(): string {
    return this.description;
  }

  getPhoto(): string[] {
    return this.photo;
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
}
