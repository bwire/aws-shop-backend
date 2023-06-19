import { APIGatewayProxyResult } from 'aws-lambda';
import { ProductService } from '../src/services/product-service';
import { makeGetAllProductsHandler } from '../src/handlers/getAllProducts';
import { DynamoDbRepository } from '../src/services/repository/dynamodb-repository';
import { StatusCodes } from 'http-status-codes';

describe('getProductList tests', () => {
  const service = new ProductService(new DynamoDbRepository());

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('to return a valid result', async () => {
    const products = [{
      count: 1,
      description: 'Product 1',
      id: '123',
      price: 45,
      title: 'P1',
    }, {
      count: 2,
      description: 'Product 2',
      id: '456',
      price: 54,
      title: 'P2',
    }];

    const spyFn = jest.spyOn(service, "getAllProducts").mockResolvedValue(products);
    const result: APIGatewayProxyResult =  await makeGetAllProductsHandler(service)();

    console.log('result', result);
    

    expect(spyFn).toBeCalledTimes(1);
    expect(result.statusCode).toBe(StatusCodes.OK); 
    expect(result.body).toBe(JSON.stringify(products));
  });

  test('to handle error', async () => {
    const spyFn = jest.spyOn(service, "getAllProducts").mockRejectedValue(new Error('Test error'));
    const result: APIGatewayProxyResult = await makeGetAllProductsHandler(service)();
    
    expect(spyFn).toBeCalledTimes(1);
    expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR); 
    expect(result.body).toBe(JSON.stringify({ message: 'Test error'}));
  });
}); 