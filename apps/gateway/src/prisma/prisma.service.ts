import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DatabaseConfig } from '../config/database.config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly databaseConfig: DatabaseConfig) {
    super({
      datasources: {
        db: {
          url: databaseConfig.getDatabaseUrl(),
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect(); // connect to DB on start app
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect(); // disconnect from DB on stop app
  }
}
