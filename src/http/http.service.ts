import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance, AxiosResponse } from 'axios';
import { HTTP_OPTIONS, HttpModuleOptions, RequestConfig } from './http.types';
import { createAxiosInstance } from './axios.factory';

@Injectable()
export class HttpService {
  private readonly instance: AxiosInstance;

  constructor(
    @Inject(HTTP_OPTIONS)
    private readonly options: HttpModuleOptions,
  ) {
    this.instance = createAxiosInstance(options);
  }

  request<T = unknown>(config: RequestConfig): Promise<AxiosResponse<T>> {
    const { ...axiosConfig } = config;

    return this.instance.request<T>(axiosConfig);
  }

  get<T = unknown>(url: string, config: RequestConfig = {}) {
    return this.request<T>({ ...config, url, method: 'get' });
  }
}
