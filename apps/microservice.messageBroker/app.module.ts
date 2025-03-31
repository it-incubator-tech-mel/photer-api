import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { PostsSenderController } from './sender/posts.sender';

@Module({
  imports: [ConfigModule.forRoot(), CqrsModule],
  controllers: [PostsSenderController],
  providers: [],
  exports: [],
})
export class AppModuleBroker {}
