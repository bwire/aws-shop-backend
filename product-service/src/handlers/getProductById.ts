import { APIGatewayProxyResult } from "aws-lambda";
import { StatusCodes } from 'http-status-codes';
import { 
  ProductByIdEvent, 
  ProductService 
} from "../services/product-service";
import { successResponse, errorResponse } from '~/utils';

export const getSingleProduct = (productService: ProductService) => 
  async (event: ProductByIdEvent): Promise<APIGatewayProxyResult> => {
    try {
      console.log('Incoming request', event);
      const { productId } = event.pathParameters;
      const product = await productService.getProductById(productId);
      
      if (!product) {
        return errorResponse(new Error(`Product with id ${productId} not found`), StatusCodes.BAD_REQUEST);
      }

      return successResponse(product);
    }
    catch (err: any) {
      return errorResponse(err);
    }
}
