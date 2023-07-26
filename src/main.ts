import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { LogLevel } from '@nestjs/common';
import { Telegraf } from 'telegraf';

const origins = process.env.ORIGIN?.trim()?.split(' ') ?? [''];
// Need to convert origin to string in case env setting is `*` for `ORIGIN`
const allowedOrigin = origins.length === 1 ? origins.toString() : origins;
const corsOptions = {
  origin: allowedOrigin,
};

async function bootstrap() {
  global.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  global.bot.launch();

  const app = await NestFactory.create(AppModule, {
    logger: process.env.LOG_LEVEL?.split(',') as LogLevel[]
  });

  app.setGlobalPrefix(process.env.GLOBAL_API_PREFIX);
  app.enableCors(corsOptions);

  await app.listen(process.env.PORT);
}
bootstrap();
