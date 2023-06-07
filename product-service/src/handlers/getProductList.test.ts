import { APIGatewayProxyResult } from 'aws-lambda';
import { ProductService } from '../service/product-service';
import { getProductList } from './getProductList';

describe('getProductList tests', () => {
  const service = new ProductService();

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
    const result: APIGatewayProxyResult =  await getProductList(service)();

    expect(spyFn).toBeCalledTimes(1);
    expect(result.statusCode).toBe(200); 
    expect(result.body).toBe(JSON.stringify(products));
  });

  test('to handle error', async () => {
    const spyFn = jest.spyOn(service, "getAllProducts").mockRejectedValue(new Error('Test error'));
    const result: APIGatewayProxyResult = await getProductList(service)();
    
    expect(spyFn).toBeCalledTimes(1);
    expect(result.statusCode).toBe(500); 
    expect(result.body).toBe(JSON.stringify({ message: 'Test error'}));
  });
}); 