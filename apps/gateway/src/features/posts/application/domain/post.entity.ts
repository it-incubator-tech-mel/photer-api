export class Post {
  private constructor(
    private readonly id: number,
    private description: string,
    private photo: string[],
    private userId: number,
    private createdAt: Date,
    private updatedAt: Date,
    private status: boolean,
    private isDeleted: boolean,
  ) {}

  static create(photo: string[], description: string, userId: number): Post {
    return new Post(
      0, // In DB auto-increment
      description,
      photo,
      userId,
      new Date(),
      new Date(),
      false,
      false,
    );
  }

  // create User using data from db
  static restore(
    id: null,
    description: string,
    photo: string[],
    userId: number,
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean,
    status: boolean,
  ): Post {
    return new Post(
      id,
      description,
      photo,
      userId,
      createdAt,
      updatedAt,
      isDeleted,
      status,
    );
  }

  // getters

  getId(): number {
    return this.id;
  }

  getDescription(): string {
    return this.description;
  }

  getPhotos(): string[] {
    return this.photo;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getUserId(): number {
    return this.userId;
  }

  // getUpdatedAt(): Date {
  //   return this.updatedAt;
  // }

  getIsDeleted(): boolean {
    return this.isDeleted;
  }

  // static getViewModel(post: Post): OutputPostType {
  //   return {
  //     id: post.id,
  //     description: post.description,
  //     photos: post.photos,
  //     userId: post.userId,
  //     createdAt: post.createdAt,
  //     updatedAt: post.updatedAt,
  //   };
  // }
}
