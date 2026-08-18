import axios, { AxiosError, AxiosInstance, Method } from 'axios';
import { HttpModuleOptions } from './http.types';
import { createPooledAgents } from './agents';
import axiosRetry, { isNetworkError, isRetryableError } from 'axios-retry';

const DEFAULT_RETRY_METHODS: Method[] = [
  'get',
  'head',
  'options',
  'put',
  'delete',
];
const DEFAULT_RETRY_STATUS = [408, 425, 429, 500, 502, 503, 504];

export function exponetionalJitterDelay(
  minDelayMs: number,
  maxDelayMs: number,
): (retryCount: number) => number {
  return (retryCount: number) => {
    const exp = Math.min(maxDelayMs, minDelayMs * 2 ** (retryCount - 1));
    return Math.floor(Math.random() * exp);
  };
}

export function createAxiosInstance(options: HttpModuleOptions): AxiosInstance {
  const { httpAgent, httpsAgent } = createPooledAgents(options.keepAlive);

  const instance = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeoutMs ?? 10_000,
    headers: options.headers,
    httpAgent,
    httpsAgent,
  });

  const retry = options.retry;
  const retryMethods = (retry?.retryMethods ?? DEFAULT_RETRY_METHODS).map((m) =>
    m.toLowerCase(),
  );
  const retryStatus = retry?.retryStatusCodes ?? DEFAULT_RETRY_STATUS;
  const minDelay = retry?.minDelayMs ?? 200;
  const maxDelay = retry?.maxDelayMs ?? 5_000;

  axiosRetry(instance, {
    retries: retry?.retries ?? 3,
    retryCondition: (error: AxiosError) => {
      const method = (error.config?.method ?? 'get').toLowerCase();
      const idempotent = retryMethods.includes(method);
      if (!idempotent) return false;
      if (isNetworkError(error)) return true;
      if (isRetryableError(error)) return true;
      const status = error.response?.status;
      return status != null && retryStatus.includes(status);
    },
    onRetry: (retryCount, error, requestConfig) => {
      const method = (requestConfig?.method ?? 'get').toLowerCase();
      const idempotent = retryMethods.includes(method);
      if (!idempotent) return;
      const status = error?.response?.status;
      console.warn(`
        Retrying request ${requestConfig?.url} (attempt ${retryCount}) due to error: ${
          error.message
        }${status ? ` (status ${status})` : ``}
        `);
    },
    retryDelay: exponetionalJitterDelay(minDelay, maxDelay),
    shouldResetTimeout: true,
  });

  return instance;
}
