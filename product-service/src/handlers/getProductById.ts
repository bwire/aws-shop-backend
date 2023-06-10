import { APIGatewayProxyResult } from "aws-lambda";
import { ProductServiceInterface, ProductByIdEvent, errorResponse, successResponse } from "../service";

export const getSingleProduct = (productService: ProductServiceInterface) => 
  async (event: ProductByIdEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { productId } = event.pathParameters;
      const product = await productService.getProductById(productId);

      if (!product) {
        return errorResponse(new Error(`Product with id ${productId} not found`), 404);
      }

      return successResponse({ product });
    }
    catch (err: any) {
      return errorResponse(err);
    }
}
