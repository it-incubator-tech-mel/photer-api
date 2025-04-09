import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { StorageService } from '../../../storage.service';
import { PostTcpRepository } from '../infastructure/post.tcp.repository';

export class CreatePostCommand {
  constructor(public readonly file: { photo: any[]; userId: number }) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly storageService: StorageService,
    private readonly postTcpRepository: PostTcpRepository,
  ) {}
  async execute(command: CreatePostCommand) {
    const { photo, userId } = command.file;
    const bodyFile = {
      photo: photo.map((photo) => {
        return {
          buffer: Buffer.from(photo.buffer.data),
          filename: photo.originalname,
          mimetype: photo.mimetype,
        };
      }),
      userId: userId,
    };
    const uploadPromises = bodyFile.photo.map(async (photo) => {
      const fileName = `posts/${userId}/${new Date().toLocaleDateString('en-CA')}/${new Date().toLocaleDateString('en-CA')}-${Math.floor(Math.random() * 10000)}.png`;
      const bucketParam = {
        Bucket: 'inctagram-photer',
        Key: fileName,
        Body: photo.buffer,
        ContentType: photo.mimetype,
      };
      const command = new PutObjectCommand(bucketParam);

      await this.storageService.uploadStream(command, bucketParam);
      // this.s3client.send(command);

      return `https://storage.yandexcloud.net/${bucketParam.Bucket}/${fileName}`;
    });

    const locations = await Promise.all(uploadPromises);
    return this.postTcpRepository.addPhotoArrayInMongoDB(locations, userId);
  }
}
