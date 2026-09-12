import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance, AxiosResponse } from 'axios';
import { HTTP_OPTIONS, HttpModuleOptions, RequestConfig } from './http.types';
import { createAxiosInstance } from './axios.factory';
import {
  createHttpCircuitBreaker,
  HttpBreaker,
} from './circuit-breaker.factory';

@Injectable()
export class HttpService {
  private readonly instance: AxiosInstance;
  private readonly breaker: HttpBreaker;

  constructor(
    @Inject(HTTP_OPTIONS)
    private readonly options: HttpModuleOptions,
  ) {
    this.instance = createAxiosInstance(options);
    this.breaker = createHttpCircuitBreaker(
      this.instance,
      options.circuitBreaker,
    );
  }

  request<T = unknown>(config: RequestConfig): Promise<AxiosResponse<T>> {
    const { skipCircuitBreaker, ...axiosConfig } = config;

    if (skipCircuitBreaker) {
      return this.instance.request<T>(axiosConfig);
    }

    return this.breaker.fire(axiosConfig);
  }

  get<T = unknown>(url: string, config: RequestConfig = {}) {
    return this.request<T>({ ...config, url, method: 'get' });
  }

  getBreakerStats() {
    return this.breaker.stats;
  }
}
