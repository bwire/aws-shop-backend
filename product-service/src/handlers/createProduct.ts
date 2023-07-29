import { 
  APIGatewayProxyEvent, 
  APIGatewayProxyResult 
} from "aws-lambda";
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { errorResponse, successResponse } from './utils';
import { ProductService } from "../services/product-service";
import { Product } from "../services/repository/types";

const PayloadSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string(),
  price: z.number().nonnegative().gt(0),
  count: z.number().nonnegative().gt(0),
});
 
export const makeCreateProductHandler = (productService: ProductService) => 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      console.log('Incoming request', event); 
      const payload: Product = JSON.parse(event.body! || '{}');
      const { success } = PayloadSchema.safeParse(payload);

      if (!success) {
        return errorResponse(new Error('Payload is empty or invalid'), StatusCodes.BAD_REQUEST);  
      }

      const result = await productService.createProduct(payload);

      if (!result) {
        return errorResponse(new Error(`Error adding new data`), StatusCodes.INTERNAL_SERVER_ERROR);
      }
      return successResponse(result, StatusCodes.CREATED);
    }
    catch (err: any) {
      return errorResponse(err);
    }
}
