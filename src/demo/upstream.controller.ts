import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';

@Controller('upstream')
export class UpstreamController {
  @Get('unstable')
  unstable(@Query('failRate') failRate = '0.6') {
    const rate = Number(failRate);
    if (Math.random() < rate) {
      throw new HttpException(
        'upstream is down',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return { ok: true, at: new Date().toISOString() };
  }
}
