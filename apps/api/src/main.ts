import "reflect-metadata";

import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor";
import { PrismaService } from "./prisma/prisma.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    rawBody: true
  });

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  app.useGlobalInterceptors(new RequestLoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  Logger.log(`SAFARI API listening on http://localhost:${port}`, "Bootstrap");
}

void bootstrap();
