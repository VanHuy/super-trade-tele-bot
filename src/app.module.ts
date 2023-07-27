import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { ScheduleModule } from '@nestjs/schedule';
import { DbInitializationModule } from './providers/db-initialization/db-initialization.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.PORT),
      },
      ttl: Number(process.env.REDIS_TTL),
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      'mongodb://10.2.12.24:27017/bot-trade?replicaSet=ekoios&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false',
    ),
    UsersModule,
    DbInitializationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
