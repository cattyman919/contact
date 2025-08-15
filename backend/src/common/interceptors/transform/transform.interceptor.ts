import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  status: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => {
        // If the request is paginated, add cursor
        if (
          data &&
          Array.isArray(data.data) &&
          typeof data.nextCursor !== 'undefined'
        ) {
          return {
            status: 'Success',
            statusCode: statusCode,
            nextCursor: data.nextCursor,
            data: data.data,
          };
        }

        return {
          status: 'Success',
          statusCode: statusCode,
          data: data,
        };
      }),
    );
  }
}
