import { APIGatewayProxyResult } from "aws-lambda";
import { ProductServiceInterface, errorResponse, successResponse } from "../service";

export const getProductList = (productService: ProductServiceInterface) => 
  async (): Promise<APIGatewayProxyResult> => {
    try {
      const products = await productService.getAllProducts();
      return successResponse(products);
    } 
    catch (err: any) {
      return errorResponse(err);
    }
  }
