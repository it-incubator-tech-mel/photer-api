import { PostOutputDto } from '../api/dto/output/post.output.dto';

export class Post {
  private constructor(
    private readonly id: number,
    private description: string,
    private userId: number,
    private photo: any[],
    private createdAt: Date,
    private updatedAt: Date,
    private status: string,
    private isDeleted: boolean,
  ) {}

  static create(description: string, userId: number): Post {
    return new Post(
      0, // In DB auto-increment
      description,
      userId,
      [],
      new Date(),
      new Date(),
      'public',
      false,
    );
  }

  // create User using data from db
  static restore(
    id: null,
    description: string,
    userId: number,
    photo: any[],
    createdAt: Date,
    updatedAt: Date,
    status: string,
    isDeleted: boolean,
  ): Post {
    return new Post(
      id,
      description,
      userId,
      photo,
      createdAt,
      updatedAt,
      status,
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

  // getPhoto(): string[] {
  //   return this.photo;
  // }

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

  static getViewModel(post: Post): PostOutputDto {
    return {
      id: post.id,
      description: post.description,
      photo: post.photo,
      userId: post.userId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}
