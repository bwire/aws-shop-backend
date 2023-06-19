import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { errorResponse, successResponse } from './utils';
import { ProductService } from "../services/product-service";
import { Product } from "../services/repository/types";

const ProductSchema = z.object({
  title: z.string(),
  description: z.string(),
  count: z.number().nonnegative(),
  price: z.number().nonnegative().gt(0),
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

      if (!result) {
        return errorResponse(new Error(`Error adding new data`), StatusCodes.INTERNAL_SERVER_ERROR);
      }
      return successResponse(result, StatusCodes.CREATED);
    }
    catch (err: any) {
      return errorResponse(err);
    }
}
