export class Photo {
  private constructor(
    private readonly id: number,
    private photoUrl: string,
    private postId: number,
    private createdAt: Date,
    private isDeleted: boolean,
  ) {}

  static create(photoUrl: string, postId: number, createdAt: Date): Photo {
    return new Photo(0, photoUrl, postId, createdAt, false);
  }

  static restore(
    id: number,
    photoUrl: string,
    postId: number,
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean,
  ): Photo {
    return new Photo(id, photoUrl, postId, createdAt, isDeleted);
  }
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
