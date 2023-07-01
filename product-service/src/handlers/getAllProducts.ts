import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { errorResponse, successResponse } from './utils';
import { ProductService } from "../services/product-service";

export const makeGetAllProductsHandler = (productService: ProductService) => 
  async (event?: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      console.log('Incoming request', event);
      const products = await productService.getAllProducts();
      return successResponse(products);
    } 
    catch (err: any) {
      return errorResponse(err);
    }
  }
