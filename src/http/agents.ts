import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { KeepAliveOptions } from './http.types';

export interface PooledAgents {
  httpAgent: HttpAgent;
  httpsAgent: HttpsAgent;
}

export function createPooledAgents(opts: KeepAliveOptions = {}): PooledAgents {
  const base = {
    keepAlive: opts.keepAlive ?? true,
    keepAliveMsecs: opts.keepAliveMsecs ?? 30_000,
    maxSockets: opts.maxSockets ?? 128,
    maxFreeSockets: opts.maxFreeSockets ?? 32,
  };

  const httpAgent = new HttpAgent({ ...base, ...opts.http });
  const httpsAgent = new HttpsAgent({ ...base, ...opts.https });

  return { httpAgent, httpsAgent };
}
