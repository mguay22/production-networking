import { AxiosRequestConfig, Method } from 'axios';
import { AgentOptions as HttpAgentOptions } from 'http';
import { AgentOptions as HttpsAgentOptions } from 'https';

export interface KeepAliveOptions {
  keepAlive?: boolean;
  keepAliveMsecs?: number;
  maxSockets?: number;
  maxFreeSockets?: number;
  http?: HttpAgentOptions;
  https?: HttpsAgentOptions;
}

export interface RetryOptions {
  retries?: number;
  minDelayMs?: number;
  maxDelayMs?: number;
  retryMethods?: Method[];
  retryStatusCodes?: number[];
}

export interface HttpModuleOptions {
  baseURL?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
  keepAlive?: KeepAliveOptions;
  retry?: RetryOptions;
}

export type RequestConfig = AxiosRequestConfig & {};

export const HTTP_OPTIONS = Symbol('HTTP_OPTIONS');
