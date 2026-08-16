import axios, { AxiosInstance } from 'axios';
import { HttpModuleOptions } from './http.types';
import { createPooledAgents } from './agents';
import axiosRetry from 'axios-retry';

export function createAxiosInstance(options: HttpModuleOptions): AxiosInstance {
  const { httpAgent, httpsAgent } = createPooledAgents(options.keepAlive);

  const instance = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeoutMs ?? 10_000,
    headers: options.headers,
    httpAgent,
    httpsAgent,
  });

  axiosRetry(instance);

  return instance;
}
