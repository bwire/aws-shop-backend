import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(3000);
}
bootstrap();
