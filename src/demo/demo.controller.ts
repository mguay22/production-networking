import { Controller, Get, Logger, Query } from '@nestjs/common';
import { HttpService } from '../http/http.service';

@Controller('demo')
export class DemoController {
  private readonly logger = new Logger(DemoController.name);

  constructor(private readonly http: HttpService) {}

  @Get('keepalive')
  async keepalive(@Query('count') count = '5') {
    const n = Number(count);
    const results: Array<{ i: number; ms: number; reusedSocket: boolean }> = [];

    for (let i = 0; i < n; i++) {
      const start = Date.now();
      const res = await this.http.get('/upstream/unstable', {
        params: { failRate: '0' },
      });
      const ms = Date.now() - start;
      const reusedSocket = Boolean(res.request.reusedSocket);
      this.logger.log(
        `keepalive #${i + 1}: ${ms}ms reusedSocket=${reusedSocket}`,
      );
      results.push({ i: i + 1, ms, reusedSocket });
    }

    return results;
  }
}
