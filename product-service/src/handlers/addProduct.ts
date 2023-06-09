import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from 'zod';
import { 
  ProductByIdEvent, 
  errorResponse, 
  successResponse, 
  ProductService 
} from "../services/product-service";
import { Product } from "../services/repository/types";
import { log } from "console";

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
        return errorResponse(new Error('Payload is empty or invalid'), 400);  
      }

      const result = await productService.createProduct(payload);
      return successResponse(result, 201);
    }
    catch (err: any) {
      return errorResponse(err);
    }
}
