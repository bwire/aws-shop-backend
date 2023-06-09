import { APIGatewayProxyResult } from 'aws-lambda';
import { ProductService } from '../services/product-service';
import { getSingleProduct } from './getProductById';
import { ProductByIdEvent } from '../services/product-service';
import { DynamoDbRepository } from '../services/repository/dynamodb-repository';

describe('getProductList tests', () => {
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
    const result: APIGatewayProxyResult =  await getSingleProduct(service)(eventParams);

    expect(spyFn).toBeCalledTimes(1);
    expect(spyFn).toBeCalledWith('123');
    expect(result.statusCode).toBe(200); 
    expect(result.body).toBe(JSON.stringify({ product }));
  });

  test('product not found - to handle error', async () => {
    const spyFn = jest.spyOn(service, "getProductById").mockImplementation(jest.fn());
    const result: APIGatewayProxyResult = await getSingleProduct(service)(eventParams);
    
    expect(spyFn).toBeCalledTimes(1);
    expect(result.statusCode).toBe(404); 
    expect(result.body).toBe(JSON.stringify({ message: 'Product with id 123 not found'}));
  });

  test('to handle error', async () => {
    const spyFn = jest.spyOn(service, "getProductById").mockRejectedValue(new Error('Test error'));
    const result: APIGatewayProxyResult = await getSingleProduct(service)(eventParams);
    
    expect(spyFn).toBeCalledTimes(1);
    expect(result.statusCode).toBe(500); 
    expect(result.body).toBe(JSON.stringify({ message: 'Test error'}));
  });
}); 