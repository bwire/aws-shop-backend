import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ImportService } from "../service/import-service";
import { successResponse, errorResponse } from './utils';
import { StatusCodes } from "http-status-codes";

export const importCSVFile = (importService: ImportService) => 
  async (event?: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      console.log('Incoming request', event);

      const name = event?.queryStringParameters?.name;
      if (!name) {
        return errorResponse(new Error("Bad request. Parameter 'name' has not been provided"), StatusCodes.BAD_REQUEST);
      }

      const url = await importService.importProductsFile(name);
      return successResponse(url);
    } 
    catch (err: any) {
      return errorResponse(err);
    }
  }
