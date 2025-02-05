import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DatabaseModule } from '../modules/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
