import { OnModuleDestroy } from '@nestjs/common';

export type BeginResult =
  | { state: 'acquired' }
  | { state: 'in-flight' }
  | { state: 'completed'; status: number; body: unknown };

export interface IdempotencyStore {
  begin(key: string, ttlMs: number): BeginResult;
  complete(key: string, status: number, body: unknown, ttlMs: number): void;
  release(key: string): void;
}

type Record =
  | { state: 'in-flight'; expiresAt: number }
  | { state: 'completed'; expiresAt: number; status: number; body: unknown };

const SWEEP_INTERVAL_MS = 60_000;

export class InMemoryIdempotencyStore
  implements IdempotencyStore, OnModuleDestroy
{
  private readonly data = new Map<string, Record>();
  private readonly sweeper: NodeJS.Timeout;

  constructor() {
    this.sweeper = setInterval(() => this.sweep(), SWEEP_INTERVAL_MS);
    this.sweeper.unref();
  }

  sweep(now = Date.now()) {
    for (const [key, rec] of this.data) {
      if (rec.expiresAt < now) this.data.delete(key);
    }
  }

  onModuleDestroy() {
    clearInterval(this.sweeper);
  }

  begin(key: string, ttlMs: number): BeginResult {
    const existing = this.data.get(key);
    if (existing?.state == 'in-flight') return { state: 'in-flight' };
    if (existing?.state === 'completed') {
      return {
        state: 'completed',
        status: existing.status,
        body: existing.body,
      };
    }
    this.data.set(key, { state: 'in-flight', expiresAt: Date.now() + ttlMs });
    return { state: 'acquired' };
  }

  complete(key: string, status: number, body: unknown, ttlMs: number): void {
    this.data.set(key, {
      state: 'completed',
      status,
      body,
      expiresAt: Date.now() + ttlMs,
    });
  }

  release(key: string): void {
    const rec = this.data.get(key);
    if (rec?.state === 'in-flight') this.data.delete(key);
  }
}
