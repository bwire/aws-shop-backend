import { ImportService } from '../../src/service';

describe('ImportService tests', () => {
  const service = new ImportService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('importProductsFile tests', () => {
    test('method throws exception', async () => {
      const spyFn = jest.spyOn(service['s3'], "getSignedUrl")
        .mockImplementation(() => {
          throw new Error('Unexpected error')
        });

      try {
        service.importProductsFile('test');        
      } catch (error: any) {
        expect(spyFn).toHaveBeenCalledTimes(1);  
        expect(error.message = 'Unexpected error'); 
     } 
    });

    test('happy case - sign url created', async () => {
      const signedUrl = 'https://signed-url.amazon.com';
      const spyFn = jest.spyOn(service['s3'], "getSignedUrl").mockReturnValue(signedUrl);

      const result = service.importProductsFile('test');

      expect(result).toStrictEqual(signedUrl);
      expect(spyFn).toHaveBeenCalledTimes(1);
      expect(spyFn).toHaveBeenCalledWith(
        'putObject', expect.objectContaining({
          Key: 'uploaded/test',
        })
      );
    });
  });
}); 