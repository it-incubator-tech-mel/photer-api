import { OutputPostType } from '../api/dto/output/Output.post.type';
import { PostSchema } from '../../../../../storage/mongo.schemas/postSchemaModel';

export class Post {
  private constructor(
    private readonly id: string,
    private description: string,
    private photo: string[],
    private userId: string,
    private userName: string,
    private createdAt: Date,
    private updatedAt: Date,
    private isDeleted: boolean,
  ) {}

  static create(
    description: string,
    photo: string[],
    userId: string,
    userName: string,
  ): Post {
    return new Post(
      '0', // In DB auto-increment
      description,
      photo,
      userId,
      userName,
      new Date(),
      new Date(),
      false,
    );
  }

  // create User using data from db
  static restore(
    id: string,
    description: string,
    photo: string[],
    userId: string,
    userName: string,
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean,
  ): Post {
    return new Post(
      id,
      description,
      photo,
      userId,
      userName,
      createdAt,
      updatedAt,
      isDeleted,
    );
  }

  // getters

  getId(): string {
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

  static getViewModel(post: PostSchema): OutputPostType {
    return {
      id: post.id,
      description: post.description,
      photo: post.photo,
      userId: post.userId,
      userName: post.userName,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}
