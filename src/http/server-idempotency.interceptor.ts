import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { IDEMPOTENCY_STORE, IdempotencyStore } from './idempotency-store';

const HEADER = 'idempotency-key';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h

@Injectable()
export class ServerIdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ServerIdempotencyInterceptor.name);

  constructor(
    @Inject(IDEMPOTENCY_STORE) private readonly store: IdempotencyStore,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req: Request = ctx.switchToHttp().getRequest();
    const res: Response = ctx.switchToHttp().getResponse();
    const key = req.headers[HEADER];

    if (!key || typeof key !== 'string') {
      throw new BadRequestException(
        'Idempotency-Key is required for this route',
      );
    }

    const result = this.store.begin(key, DEFAULT_TTL_MS);

    if (result.state === 'completed') {
      this.logger.log(`replay hit key=${key}`);
      res.status(result.status);
      return of(result.body);
    }

    if (result.state === 'in-flight') {
      throw new ConflictException(
        'A request with this Idempotency-Key is already being processed',
      );
    }

    return next.handle().pipe(
      tap((body) => {
        const status = res.statusCode ?? 200;
        this.store.complete(key, status, body, DEFAULT_TTL_MS);
      }),
      catchError((err) => {
        this.store.release(key);
        return throwError(() => err);
      }),
    );
  }
}
