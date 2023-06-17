import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ProductService } from "../services/product-service";
import { successResponse, errorResponse } from '~/utils';

export const getProductList = (productService: ProductService) => 
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
