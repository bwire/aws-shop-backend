import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ProductService, errorResponse, successResponse } from "../services/product-service";

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
