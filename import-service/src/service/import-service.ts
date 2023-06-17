import { S3 } from 'aws-sdk';
import { Readable, pipeline } from 'stream';
export class ImportService {
  private s3 = new S3({signatureVersion: 'v4'});

  importProductsFile(name: string): string {
    return this.s3.getSignedUrl('putObject', {
      Bucket: process.env.BUCKET_NAME,
      Key: `uploaded/${name}`,
    });
  };

  async processCSV(bucket: string, key: string): Promise<void> {
    const csv = require('csv-parser');

    const data = await this.s3.getObject({
      Bucket: bucket,
      Key: key,
    }).promise();

    await new Promise<void>((resolve, reject) => {
      Readable
        .from(data.Body as Buffer)
        .pipe(csv({ separator: process.env.CSV_SEPARATOR}))
        .on('data', (data: object) => {
          if (Object.keys(data).length !== 0)
            console.log('CSV record', data)
        })
        .on('end', resolve)
        .on('error', (error: Error) => reject(error));
    }); 

    // move file only if the stream finished correctly
    await this.s3.copyObject({
      Bucket: bucket,
      CopySource: `${bucket}/${key}`,
      Key: key.replace('uploaded', 'parsed'),
    }).promise();

    console.log('file copied to parsed folder');

    await this.s3.deleteObject({
      Bucket: bucket,
      Key: key,
    }).promise();

    console.log('initial file deleted');
  }
}