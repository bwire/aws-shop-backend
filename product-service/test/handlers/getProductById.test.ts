import { APIGatewayProxyResult } from 'aws-lambda';
import { ProductService } from '../../src/services/product-service';
import { makeGetProductByIdHandler } from '../../src/handlers/getProductById';
import { ProductByIdEvent } from '../../src/services/product-service';
import { DynamoDbRepository } from '../../src/services/repository/dynamodb-repository';
import { StatusCodes } from 'http-status-codes';

describe('getProductById tests', () => {
  const service = new ProductService(new DynamoDbRepository());

  const eventParams = {
    pathParameters: { productId: '123' },
  } as ProductByIdEvent;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('to return a valid result', async () => {
    const product = {
      count: 1,
      description: 'Product 1',
      id: '123',
      price: 45,
      title: 'P1',
    };

    const spyFn = jest.spyOn(service, "getProductById").mockResolvedValue(product);
    const result: APIGatewayProxyResult =  await makeGetProductByIdHandler(service)(eventParams);

    expect(spyFn).toBeCalledTimes(1);
    expect(spyFn).toBeCalledWith('123');
    expect(result.statusCode).toBe(StatusCodes.OK); 
    expect(result.body).toBe(JSON.stringify(product));
  });

  test('product not found - to handle error', async () => {
    const spyFn = jest.spyOn(service, "getProductById").mockImplementation(jest.fn());
    const result: APIGatewayProxyResult = await makeGetProductByIdHandler(service)(eventParams);
    
    expect(spyFn).toBeCalledTimes(1);
    expect(result.statusCode).toBe(StatusCodes.BAD_REQUEST); 
    expect(result.body).toBe(JSON.stringify({ message: 'Product with id 123 not found'}));
  });

  test('to handle error', async () => {
    const spyFn = jest.spyOn(service, "getProductById").mockRejectedValue(new Error('Test error'));
    const result: APIGatewayProxyResult = await makeGetProductByIdHandler(service)(eventParams);
    
    expect(spyFn).toBeCalledTimes(1);
    expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR); 
    expect(result.body).toBe(JSON.stringify({ message: 'Test error'}));
  });
}); 