import { s3Client, sqsClient } from '../aws-clients';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import csv from "csv-parser";
import { 
  CopyObjectCommand, 
  DeleteObjectCommand, 
  GetObjectCommand, 
  GetObjectCommandOutput, 
  PutObjectCommand 
} from '@aws-sdk/client-s3';
import { SendMessageCommand } from '@aws-sdk/client-sqs';

export class ImportService {
  async importProductsFile(name: string): Promise<string> {
    return await getSignedUrl(s3Client,
      new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: `uploaded/${name}`,
        ContentType: 'text/csv',
      }), { expiresIn: 30 }
    ); 
  };

  async processCSV(bucket: string, key: string): Promise<void> {
    const data: GetObjectCommandOutput = await s3Client.send(new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }));

    const readable = data.Body as Readable;

    await new Promise<void>((resolve, reject) => {
      readable
        .pipe(csv({ separator: process.env.CSV_SEPARATOR}))
        .on('data', (data) => {
          if (Object.keys(data).length !== 0) {
            sqsClient.send(new SendMessageCommand({
              QueueUrl: process.env.IMPORT_QUEUE_URL!,
              MessageBody: JSON.stringify(data),
            }), (err) => {
              if (err) {
                console.log('SQS message error', err)
              }
            });
          }
        })
        .on('end', () => {
          console.log('file parsed');
          resolve();
        })
        .on('error', (error: Error) => reject(error));
    }); 

    // move file only after the stream is finished correctly (no error thrown)
    await s3Client.send(new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${key}`,
      Key: key.replace('uploaded', 'parsed'),
    }));

    console.log('file copied to parsed folder');

    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }));

    console.log('initial file deleted');
  }
}
