import { APIGatewayProxyEvent, APIGatewayProxyEventPathParameters } from "aws-lambda";

export interface ProductInterface {
  id: string,
  title: string,
  description: string,
  price: number,
  count: number,
};

export interface ProductByIdPathParams extends APIGatewayProxyEventPathParameters {
  productId: string,
}

export interface ProductByIdEvent extends APIGatewayProxyEvent {
  pathParameters: ProductByIdPathParams,
}

export interface ProductServiceInterface {
  getProductById: (id: string) => Promise<ProductInterface | undefined>,
  getAllProducts: () => Promise<ProductInterface[]>,
}