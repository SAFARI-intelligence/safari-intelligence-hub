import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{
      status: (status: number) => { json: (payload: unknown) => void };
    }>();
    const request = ctx.getRequest<{ url: string; method: string; headers: Record<string, unknown> }>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException ? exception.getResponse() : "Internal server error";

    const payload =
      typeof exceptionResponse === "string"
        ? { message: exceptionResponse }
        : (exceptionResponse as Record<string, unknown>);

    this.logger.error(
      `Request failed`,
      JSON.stringify({
        path: request.url,
        method: request.method,
        status,
        requestId: request.headers["x-request-id"]
      })
    );

    response.status(status).json({
      ...payload,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url
    });
  }
}
