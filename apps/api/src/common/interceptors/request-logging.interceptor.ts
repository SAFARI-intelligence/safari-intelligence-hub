import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { Observable, tap } from "rxjs";

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<{ method: string; url: string; headers: Record<string, unknown> }>();
    const response = http.getResponse<{ statusCode: number; setHeader: (name: string, value: string) => void }>();
    const startedAt = Date.now();

    const requestId = (request.headers["x-request-id"] as string | undefined) ?? randomUUID();
    request.headers["x-request-id"] = requestId;
    response.setHeader("x-request-id", requestId);

    return next.handle().pipe(
      tap(() => {
        const elapsedMs = Date.now() - startedAt;
        this.logger.log(
          `${request.method} ${request.url} ${response.statusCode} ${elapsedMs}ms requestId=${requestId}`
        );
      })
    );
  }
}
