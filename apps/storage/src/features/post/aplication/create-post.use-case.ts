// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { PutObjectCommand } from '@aws-sdk/client-s3';
// import { Readable } from 'stream';
// import { FileMetadataRepository } from '../infastructure/file-metadata.repository';
// import { StorageService } from './services/storage.service';
//
// export class CreatePostCommand {
//   constructor(
//     public readonly payload: {
//       files: {
//         buffer: any;
//         originalName: string;
//         mimetype: string;
//       }[];
//       userId: number;
//     },
//   ) {}
// }
//
// @CommandHandler(CreatePostCommand)
// export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
//   constructor(
//     private readonly storageService: StorageService,
//     private readonly postTcpRepository: FileMetadataRepository,
//   ) {}
//   async execute(command: CreatePostCommand) {
//     const { files, userId } = command.payload;
//     const uploadPromises = files.map(async (file) => {
//       try {
//         const buffer = Buffer.from(file.buffer.data);
//         const stream = Readable.from(buffer);
//
//         const fileName = `posts/${userId}/${new Date().toISOString().split('T')[0]}/${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;
//
//         const uploadParams = {
//           Bucket: 'inctagram-photer',
//           Key: fileName,
//           Body: stream,
//           ContentType: file.mimetype || 'aplication/octet-stream',
//           ContentLength: buffer.length, // Добавляем длину здесь
//         };
//
//         const command = new PutObjectCommand(uploadParams);
//
//         await this.storageService.uploadPhoto(command, uploadParams);
//
//         return `https://storage.yandexcloud.net/${uploadParams.Bucket}/${fileName}`;
//       } catch (error) {
//         console.error('Error uploading file:', error);
//         throw error;
//       }
//     });
//
//     const locations = await Promise.all(uploadPromises); // Ждем завершения всех загрузок
//
//     const addPhotoInDb = await this.postTcpRepository.create(locations, userId); // Сохраняем ссылки в БД
//
//     return {
//       photo: addPhotoInDb.photoLink,
//       userId: addPhotoInDb.userId,
//     };
//     // const uploadPromises = filesPaths.map(async (photoItem) => {
//     //   const fileName = `posts/${userId}/${new Date().toISOString().split('T')[0]}/${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 10000)}.png`;
//     //   const bucketParam = {
//     //     Bucket: 'inctagram-photer',
//     //     Key: fileName,
//     //     Body: Buffer.from(photoItem.buffer),
//     //     ContentType: photoItem.mimetype,
//     //   };
//     //
//     //   const command = new PutObjectCommand(bucketParam);
//     //
//     //   await this.storageService.uploadStream(command, bucketParam); // Убедитесь, что uploadStream реализован оптимально
//     //
//     //   return `https://storage.yandexcloud.net/${bucketParam.Bucket}/${fileName}`;
//     // });
//     //
//     // const locations = await Promise.all(uploadPromises);
//     // const addPhotoInDb = await this.postTcpRepository.addPhotoArrayInMongoDB(
//     //   locations,
//     //   userId,
//     // );
//     // return {
//     //   photo: addPhotoInDb.photoLink,
//     //   userId: addPhotoInDb.userId,
//     //   body: description,
//     // };
//   }
// }
//
// // ${new Date().toLocaleDateString('en-CA')}
