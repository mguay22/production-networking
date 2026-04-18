import { DynamicModule, Module } from '@nestjs/common';
import { HTTP_OPTIONS, HttpModuleOptions } from './http.types';
import { HttpService } from './http.service';

@Module({})
export class HttpModule {
  static forRoot(options: HttpModuleOptions = {}): DynamicModule {
    const { ...moduleOptions } = options;

    return {
      module: HttpModule,
      global: true,
      providers: [
        HttpService,
        {
          provide: HTTP_OPTIONS,
          useValue: moduleOptions,
        },
      ],
      exports: [HttpService],
    };
  }
}
