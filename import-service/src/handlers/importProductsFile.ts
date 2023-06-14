import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ImportService } from "../service/import-service";
import { successResponse, errorResponse } from './utils';

export const importCSVFile = (importService: ImportService) => 
  async (event?: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      console.log('Incoming request', event);
      const url = await importService.importProductsFile();
      return successResponse(url);
    } 
    catch (err: any) {
      return errorResponse(err);
    }
  }
