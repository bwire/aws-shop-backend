import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ImportService } from "../service/import-service";
import { successResponse, errorResponse } from './utils';

export const importParser = (importService: ImportService) => 
  async (event?: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      console.log('Incoming request', event);
      
      return successResponse("OK-parsed");
    } 
    catch (err: any) {
      return errorResponse(err);
    }
  }