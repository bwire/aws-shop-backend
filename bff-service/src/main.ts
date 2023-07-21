import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request } from 'express';
import { HttpExceptionFilter } from './exception-filter';
import * as apicache from 'apicache';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.use('/api/products', apicache.middleware('2 minutes'));

  app.use(
    '/api/products**',
    createProxyMiddleware({
      target: process.env.PRODUCTS_SERVICE,
      changeOrigin: true,
      pathRewrite: { '/api/products': 'products' },
    }),
  );

  app.use(
    '/api/import',
    createProxyMiddleware((_, req: Request) => req.method === 'GET', {
      target: process.env.IMPORT_SERVICE,
      changeOrigin: true,
      pathRewrite: { '/api/import': 'import' },
    }),
  );

  app.use(
    '/api/cart**',
    createProxyMiddleware({
      target: process.env.CART_SERVICE,
      changeOrigin: true,
      pathRewrite: { '/api/cart': 'api/profile/cart' },
    }),
  );

  app.use(
    '/api/orders**',
    createProxyMiddleware({
      target: process.env.CART_SERVICE,
      changeOrigin: true,
      pathRewrite: { '/api/orders': 'api/profile/orders' },
    }),
  );

  await app.listen(4000);
}

bootstrap();
