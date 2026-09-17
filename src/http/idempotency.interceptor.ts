import { AxiosInstance, InternalAxiosRequestConfig, Method } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { IdempotencyOptions } from './http.types';

const DEFAULT_HEADER = 'Idempotency-Key';
const DEFAULT_METHODS: Method[] = ['post', 'patch'];

export function attachIdempotencyInterceptor(
  instance: AxiosInstance,
  opts: IdempotencyOptions = {},
) {
  if (opts.enabled === false) return;

  const header = opts.headerName ?? DEFAULT_HEADER;
  const methods = (opts.methods ?? DEFAULT_METHODS).map((m) => m.toLowerCase());

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const method = (config.method ?? 'get').toLowerCase();
    if (!methods.includes(method)) return config;

    const existing = config.headers?.[header];
    if (existing) return config;

    const key = uuidv4();
    config.headers.set(header, key);
    return config;
  });
}
