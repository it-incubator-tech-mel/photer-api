import { Photo } from './photo.entity';
import { DomainValidationError } from '../../../../../../common/errors/domain-validation-error';

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
    private status: PostStatus,
    private isDeleted: boolean,
  ) {}

  // methods

  // Factory method for creating a new post
  static create(
    description: string,
    userId: number,
    //initialPhotos: Photo[] = [],
  ): Post {
    this.validateDescription(description);

    // const photos: Photo[] = initialPhotos.map((p: Photo) =>
    //   Photo.create(p.getUrl(), p, new Date()),
    // );

    return new Post(
      0, // In DB auto-increment
      description,
      userId,
      [],
      new Date(),
      new Date(),
      PostStatus.PUBLIC,
      false,
    );
  }

  // Factory method for recovery from database
  static restore(params: {
    id: number;
    description: string;
    userId: number;
    photos: Photo[];
    createdAt: Date;
    updatedAt: Date;
    status: PostStatus;
    isDeleted: boolean;
  }): Post {
    return new Post(
      params.id,
      params.description,
      params.userId,
      params.photos,
      params.createdAt,
      params.updatedAt,
      params.status,
      params.isDeleted,
    );
  }

  updateDescription(newDescription: string): void {
    Post.validateDescription(newDescription);
    this.description = newDescription;
    this.updatedAt = new Date();
  }

  addPhoto(url: string): void {
    if (this.isDeleted) {
      throw new DomainValidationError(
        'Cannot add photo to deleted post',
        'post',
      );
    }

    const photo: Photo = Photo.create(url, this.getId(), new Date());
    this.photos.push(photo);
    this.updatedAt = new Date();
  }

  removePhoto(photoId: number): void {
    const photo: Photo = this.photos.find((p) => p.getId() === photoId);
    if (!photo) {
      throw new DomainValidationError('Photo not found', 'photoId');
    }
    photo.markAsDeleted();
    this.updatedAt = new Date();
  }

  changeStatus(newStatus: PostStatus): void {
    if (this.status === newStatus) return;

    this.status = newStatus;
    this.updatedAt = new Date();
  }

  markAsDeleted(): void {
    this.isDeleted = true;
    this.updatedAt = new Date();
  }

  private static validateDescription(description: string): void {
    if (description.length > 500) {
      throw new DomainValidationError(
        'Description exceeds 500 characters limit',
        'description',
      );
    }
  }

  // getters

  getId(): number {
    return this.id;
  }

  getDescription(): string {
    return this.description;
  }

  getUserId(): number {
    return this.userId;
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

  getStatus(): PostStatus {
    return this.status;
  }

  getIsDeleted(): boolean {
    return this.isDeleted;
  }
}
