import { CacheInterceptor, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    return undefined;
    // const request = context.switchToHttp().getRequest();
    // const { httpAdapter } = this.httpAdapterHost;
    // const httpServer = httpAdapter.getHttpServer();

    // const isGetRequest = httpServer.getRequestMethod(request) === 'GET';

    // const cacheKey = this.reflector.get(CACHE_KEY_METADATA, context.getHandler());
    //
    // console.log(cacheKey);

    // console.log('----------------------');
    // return 'key';
    // const isGetRequest = httpServer.getRequestMethod(request) === 'GET';
    // const excludePaths: string[] = ['login'];
    //
    // if (!isGetRequest || (isGetRequest && excludePaths.includes(httpServer.getRequestUrl))) {
    //   return undefined;
    // }

    // return httpServer.getRequestUrl(request);
  }
}
