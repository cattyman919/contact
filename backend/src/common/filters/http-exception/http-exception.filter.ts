import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import {
  // Request,
  Response
} from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    const message =
      typeof errorResponse === 'string'
        ? errorResponse
        : (errorResponse as any).message || 'An unexpected error occurred';

    response.status(status).json({
      status: 'Error',
      statusCode: status,
      message: message,
      // path: request.url,
    });
  }
}
