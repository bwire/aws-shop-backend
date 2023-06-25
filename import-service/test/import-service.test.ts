import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { mockClient } from 'aws-sdk-client-mock';
import { s3Client } from '../src/aws-clients';
import { ImportService } from '../src/service';
import { PutObjectCommand } from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/s3-request-presigner');

describe('ImportService tests', () => {
  const service = new ImportService();
  const s3ClientMock = mockClient(s3Client);
  
  describe('importProductsFile tests', () => {
    const mockedFn = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;
    
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('getSignedUrl throws exception', async () => {
      mockedFn.mockRejectedValue(new Error('Unexpected error'));

      try {
        await service.importProductsFile('test');        
      } catch (error: any) {
        expect(mockedFn).toHaveBeenCalledTimes(1);  
        expect(error.message = 'Unexpected error'); 
     } 
    });

    test('happy case - sign url created', async () => {
      const signedUrl = 'https://signed-url.amazon.com';
      s3ClientMock.on(PutObjectCommand).resolves({});
      mockedFn.mockResolvedValue(signedUrl);

      const result = await service.importProductsFile('test');

      expect(result).toStrictEqual(signedUrl);
      expect(mockedFn).toHaveBeenCalledTimes(1);
    });
  });
}); 
