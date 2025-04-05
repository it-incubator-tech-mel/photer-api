import { OutputPostType } from '../api/dto/output/Output.post.type';
import { User } from '../../auth/domain/user.entity';

export class Post {
  private constructor(
    private readonly id: number,
    private description: string,
    private photo: string[],
    private userId: string,
    private user: User,
    private createdAt: Date,
    private updatedAt: Date,
    private status: boolean,
    private isDeleted: boolean,
  ) {}

  static create(
    description: string,
    photo: string[],
    userId: string,
    user: User,
  ): Post {
    return new Post(
      0, // In DB auto-increment
      description,
      photo,
      userId,
      user,
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
    userId: string,
    user: User,
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
      user,
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

  static getViewModel(post: Post): OutputPostType {
    return {
      id: post.id,
      description: post.description,
      photo: post.photo,
      userId: post.userId,
      userName: post.user.getUsername(),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}
