import { DomainValidationError } from '../../../../../../common/errors/domain-validation-error';

export class Photo {
  private constructor(
    private readonly id: number,
    private photoUrl: string,
    private postId: number,
    private createdAt: Date,
    private isDeleted: boolean = false,
  ) {}

  static create(url: string, postId: number, createdAt: Date): Photo {
    if (!this.isValidUrl(url)) {
      throw new DomainValidationError('Invalid photo URL', 'url');
    }

    return new Photo(0, url, postId, createdAt);
  }

  static restore(params: {
    id: number;
    photoUrl: string;
    postId: number;
    createdAt: Date;
    isDeleted: boolean;
  }): Photo {
    return new Photo(
      params.id,
      params.photoUrl,
      params.postId,
      params.createdAt,
      params.isDeleted,
    );
  }

  markAsDeleted(): void {
    this.isDeleted = true;
  }

  private static isValidUrl(url: string): boolean {
    const parsedUrl: URL = new URL(url);

    const isProtocolValid: boolean = ['http:', 'https:'].includes(
      parsedUrl.protocol,
    );
    const isExtensionValid: boolean =
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(parsedUrl.pathname);

    return isProtocolValid && isExtensionValid;
  }

  // getters

  getId(): number {
    return this.id;
  }

  getPhotoUrl(): string {
    return this.photoUrl;
  }

  getPostId(): number {
    return this.postId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getIsDeleted(): boolean {
    return this.isDeleted;
  }
}
