import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from './http/http.module';
import { DemoController } from './demo/demo.controller';
import { UpstreamController } from './demo/upstream.controller';

@Module({
  imports: [
    HttpModule.forRoot({
      baseURL: 'http://localhost:3000',
      timeoutMs: 3_000,
      keepAlive: {
        keepAliveMsecs: 30_000,
        maxSockets: 128,
        maxFreeSockets: 32,
      },
    }),
  ],
  controllers: [AppController, DemoController, UpstreamController],
  providers: [AppService],
})
export class AppModule {}
