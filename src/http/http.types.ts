import { AxiosRequestConfig } from 'axios';
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

export interface HttpModuleOptions {
  baseURL?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
  keepAlive?: KeepAliveOptions;
}

export type RequestConfig = AxiosRequestConfig & {};

export const HTTP_OPTIONS = Symbol('HTTP_OPTIONS');
