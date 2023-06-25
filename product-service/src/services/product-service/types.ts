import { APIGatewayEvent, APIGatewayProxyEventPathParameters } from "aws-lambda";

export interface ProductByIdPathParams extends APIGatewayProxyEventPathParameters {
  productId: string,
}

export interface ProductByIdEvent extends APIGatewayEvent {
  pathParameters: ProductByIdPathParams,
}