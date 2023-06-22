import { SQSHandler, SQSEvent } from "aws-lambda";
import {  
  ProductService 
} from "../services/product-service";

export const makeCatalogBatchProcessHandler = (productService: ProductService): SQSHandler => 
  async (event: SQSEvent): Promise<void> => {
    console.log('Incoming request', event);

    if (event.Records) {
      await productService.batchProcessProducts(event.Records);
    }
  }
