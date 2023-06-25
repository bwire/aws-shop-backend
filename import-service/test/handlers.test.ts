import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { ImportService } from '../src/service';
import { importCSVFile } from '../src/handlers/importProductsFile';

describe('importProductFiles tests', () => {
  const service = new ImportService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('no name provided in params - throw an error', async () => {
    const spyFn = jest.spyOn(service, "importProductsFile").mockReturnValue('');
    const eventParams: APIGatewayProxyEvent = { queryStringParameters: {} } as any;
    
    const result: APIGatewayProxyResult =  await importCSVFile(service)(eventParams);

    expect(spyFn).not.toBeCalled();
    expect(result.statusCode).toBe(StatusCodes.BAD_REQUEST); 
    expect(result.body).toBe(JSON.stringify({ message: "Bad request. Parameter 'name' has not been provided"}));
  });

  test('handle internal server error', async () => {
    const spyFn = jest.spyOn(service, "importProductsFile")
      .mockImplementation(() => {
        throw new Error('Unexpected error')
      });
    const eventParams: APIGatewayProxyEvent = { queryStringParameters: { name: 'test' } } as any;
    
    const result: APIGatewayProxyResult =  await importCSVFile(service)(eventParams);

    expect(spyFn).toHaveBeenCalledTimes(1);
    expect(spyFn).toHaveBeenCalledWith('test');
    expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR); 
    expect(result.body).toBe(JSON.stringify({ message: 'Unexpected error' }));
  });

  test('happy case - url returned', async () => {
    const signedUrl = 'https://signed-url.amazon.com';
    const spyFn = jest.spyOn(service, "importProductsFile").mockReturnValue(signedUrl);
    const eventParams: APIGatewayProxyEvent = { queryStringParameters: { name: 'test' } } as any;
    
    const result: APIGatewayProxyResult =  await importCSVFile(service)(eventParams);

    expect(spyFn).toHaveBeenCalledTimes(1);
    expect(spyFn).toHaveBeenCalledWith('test');
    expect(result.statusCode).toBe(StatusCodes.OK); 
    expect(result.body).toBe(JSON.stringify(signedUrl));
  });
}); 
