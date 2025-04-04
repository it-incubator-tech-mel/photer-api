import { NestFactory } from '@nestjs/core';
import { StorageModule } from './storage.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MongoClient, ServerApiVersion } from 'mongodb';

async function bootstrap() {
  // const app = await NestFactory.create(StorageModule);
  // await app.listen(process.env.port ?? 3001);

  const RABBITMQ_URL =
    'amqps://gxiiwfbk:t4hYrGI_EYvl3sf_bSdk5U5VS7uTa63P@rat.rmq2.cloudamqp.com/gxiiwfbk';
  // const Mongo_URL =
  //   'mongodb://photerappit:OK7nHIfpS2M39ySS@ac-9v46s2k-shard-00-00.cq5urvl.mongodb.net:27017,ac-9v46s2k-shard-00-01.cq5urvl.mongodb.net:27017,ac-9v46s2k-shard-00-02.cq5urvl.mongodb.net:27017/?ssl=true&replicaSet=atlas-h5soo7-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';
  //
  // const client = new MongoClient(Mongo_URL, {
  //   serverApi: {
  //     version: ServerApiVersion.v1,
  //     strict: true,
  //     deprecationErrors: true,
  //   },
  // });
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    StorageModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [RABBITMQ_URL],
        queue: 'new_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
  );
  // try {
  //   await client.connect();
  //   console.log('Successfully connected to MongoDB');
  // } catch (error) {
  //   console.error('Error connecting to MongoDB:', error);
  //   return;
  // }
  await app.listen();
}
bootstrap();
