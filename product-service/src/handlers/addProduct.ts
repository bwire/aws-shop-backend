import { APIGatewayProxyResult } from "aws-lambda";
import { 
  ProductByIdEvent, 
  errorResponse, 
  successResponse, 
  ProductService 
} from "../services/product-service";
import { Product } from "../services/repository/types";

export const addProduct = (productService: ProductService) => 
  async (event: ProductByIdEvent): Promise<APIGatewayProxyResult> => {
    try {
      // TODO check for the empty body
      const payload: Product = JSON.parse(event.body!);

      // TODO process a valid result 
      const result = await productService.createProduct(payload);
      
      return successResponse(result, 201);
    }
    catch (err: any) {
      console.log('error', err);
      return errorResponse(err);
    }
}
