import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { 
  ProductByIdEvent, 
  errorResponse, 
  successResponse, 
  ProductService 
} from "../services/product-service";
import { Product } from "../services/repository/types";

const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  count: z.number(),
  price: z.number()
});

export const addProduct = (productService: ProductService) => 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      console.log('Incoming request', event);
      
      const payload: Product = JSON.parse(event.body! || '{}');
      const { success } = ProductSchema.safeParse(payload);

      if (!success) {
        return errorResponse(new Error('Payload is empty or invalid'), StatusCodes.BAD_REQUEST);  
      }

      const result = await productService.createProduct(payload);
      return successResponse(result, StatusCodes.CREATED);
    }
    catch (err: any) {
      return errorResponse(err);
    }
}
