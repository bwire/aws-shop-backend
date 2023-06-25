import { S3Event, S3EventRecord, S3Handler } from "aws-lambda";
import { ImportService } from "../service/import-service";

export const importParser = (importService: ImportService): S3Handler => 
  async (event: S3Event): Promise<void> => {
    console.log('Incoming request', event);
    
    const record: S3EventRecord = event.Records[0];
    await importService.processCSV(
      record.s3.bucket.name, 
      record.s3.object.key
    ); 
  }
