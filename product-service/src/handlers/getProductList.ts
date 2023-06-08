import { APIGatewayProxyResult } from "aws-lambda";
import { ProductService, errorResponse, successResponse } from "../services/product-service";

export const getProductList = (productService: ProductService) => 
  async (): Promise<APIGatewayProxyResult> => {
    try {
      const products = await productService.getAllProducts();
      return successResponse(products);
    } 
    catch (err: any) {
      return errorResponse(err);
    }
  }
