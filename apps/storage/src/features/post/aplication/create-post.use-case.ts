import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { StorageService } from '../../../storage.service';
import { PostTcpRepository } from '../infastructure/post.tcp.repository';

export class CreatePostCommand {
  constructor(
    public readonly file: {
      photo: any[];
      userId: number;
      description: string | null;
    },
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly storageService: StorageService,
    private readonly postTcpRepository: PostTcpRepository,
  ) {}
  async execute(command: CreatePostCommand) {
    const { photo, userId, description } = command.file;

    const uploadPromises = photo.map(async (photoItem) => {
      const fileName = `posts/${userId}/${new Date().toISOString().split('T')[0]}/${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 10000)}.png`;
      const bucketParam = {
        Bucket: 'inctagram-photer',
        Key: fileName,
        Body: Buffer.from(photoItem.buffer),
        ContentType: photoItem.mimetype,
      };

      const command = new PutObjectCommand(bucketParam);

      await this.storageService.uploadStream(command, bucketParam); // Убедитесь, что uploadStream реализован оптимально

      return `https://storage.yandexcloud.net/${bucketParam.Bucket}/${fileName}`;
    });

    const locations = await Promise.all(uploadPromises);
    const addPhotoInDb = await this.postTcpRepository.addPhotoArrayInMongoDB(
      locations,
      userId,
    );
    return {
      photo: addPhotoInDb.photoLink,
      userId: addPhotoInDb.userId,
      body: description,
    };
  }
}

// ${new Date().toLocaleDateString('en-CA')}
