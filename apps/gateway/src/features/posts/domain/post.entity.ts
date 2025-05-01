import { Photo } from './photo.entity';
import { DomainValidationError } from '../../../../../common/errors/domain-validation-error';

export enum PostStatus {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export class Post {
  private constructor(
    private readonly id: number,
    private description: string,
    private userId: number,
    private photos: Photo[],
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
    photos: any[],
    createdAt: Date,
    updatedAt: Date,
    status: string,
    isDeleted: boolean,
  ): Post {
    return new Post(
      id,
      description,
      userId,
      photos,
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

  getPhotos(): Photo[] {
    return this.photos;
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

  // methods

  updateDescription(newDescription: string): void {
    if (newDescription.length > 500) {
      throw new DomainValidationError(
        'Description exceeds 500 characters limit',
        'description',
      );
    }
    this.description = newDescription;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    this.isDeleted = true;
    this.updatedAt = new Date();
  }
}
