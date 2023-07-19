import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

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

  await app.listen(3000);
}
bootstrap();
