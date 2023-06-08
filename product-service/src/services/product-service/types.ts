import { APIGatewayProxyEvent, APIGatewayProxyEventPathParameters } from "aws-lambda";

export interface ProductByIdPathParams extends APIGatewayProxyEventPathParameters {
  productId: string,
}

export interface ProductByIdEvent extends APIGatewayProxyEvent {
  pathParameters: ProductByIdPathParams,
}