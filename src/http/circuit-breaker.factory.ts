import CircuitBreaker from 'opossum';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { CircuitBreakerOptions } from './http.types';
import { Logger } from '@nestjs/common';

export type HttpBreaker = CircuitBreaker<
  [AxiosRequestConfig],
  AxiosResponse<any>
>;

export function createHttpCircuitBreaker(
  instance: AxiosInstance,
  options: CircuitBreakerOptions = {},
): HttpBreaker {
  const name = options.name ?? 'http';
  const logger = new Logger(`CircuitBreaker:${name}`);

  const action = (config: AxiosRequestConfig) => instance.request(config);

  const breaker = new CircuitBreaker(action, {
    timeout: options.timeoutMs ?? 15_000,
    errorThresholdPercentage: options.errorThreseholdPercentage ?? 50,
    resetTimeout: options.resetTimeoutMs ?? 10_000,
    rollingCountTimeout: options.rollingCountTimeoutMs ?? 10_000,
    rollingCountBuckets: options.rollingCountBuckets ?? 10,
    volumeThreshold: options.volumeThreshold ?? 5,
    name,
  });

  breaker.on('open', () => logger.warn('circuit OPEN - shedding load'));
  breaker.on('halfOpen', () => logger.warn('circuit HALF-OPEN - probing'));
  breaker.on('close', () => logger.warn('circuit CLOSED - recovered'));
  breaker.on('reject', () => logger.warn('request rejected by open circuit'));
  breaker.on('timeout', () => logger.warn('request timed out at breaker'));

  return breaker;
}
