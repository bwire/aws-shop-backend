import { APIGatewayProxyResult, S3Event, S3EventRecord } from "aws-lambda";
import { ImportService } from "../service/import-service";
import { successResponse, errorResponse } from './utils';

export const importParser = (importService: ImportService) => 
  async (event: S3Event): Promise<APIGatewayProxyResult> => {
    try {
      console.log('Incoming request', event);
      
      const record: S3EventRecord = event.Records[0];
      await importService.processCSV(
        record.s3.bucket.name, 
        record.s3.object.key
      );

      return successResponse("Success");
    } 
    catch (err: any) {
      return errorResponse(err);
    }
  }