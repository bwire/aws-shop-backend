import { S3 } from 'aws-sdk'
export class ImportService {
  async importProductsFile(name: string): Promise<string> {
    const s3 = new S3({signatureVersion: 'v4'});

    return s3.getSignedUrl('putObject', {
      Bucket: process.env.BUCKET_NAME,
      Key: `uploaded/${name}`,
    });
  };
}