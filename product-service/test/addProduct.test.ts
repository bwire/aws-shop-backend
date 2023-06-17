import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ProductService } from '../src/services/product-service';
import { addProduct } from '../src/handlers/addProduct';
import { DynamoDbRepository } from '../src/services/repository/dynamodb-repository';
import { StatusCodes } from 'http-status-codes';

describe('addProduct tests', () => {
  const service = new ProductService(new DynamoDbRepository());

  const product = {
    count: 1,
    description: 'Product 1',
    id: '123',
    price: 45,
    title: 'P1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('create product, return a valid result', async () => {
    const eventParams: APIGatewayProxyEvent = { body: JSON.stringify(product) } as any;
    const spyFn = jest.spyOn(service, "createProduct").mockResolvedValue(product);
    const result: APIGatewayProxyResult =  await addProduct(service)(eventParams);

    expect(spyFn).toBeCalledTimes(1);
    expect(spyFn).toBeCalledWith(product);
    expect(result.statusCode).toBe(StatusCodes.CREATED); 
    expect(result.body).toBe(JSON.stringify(product));
  });

  test('create product, no body - error thrown', async () => {
    const eventParams: APIGatewayProxyEvent = {} as any;
    const spyFn = jest.spyOn(service, "createProduct").mockResolvedValue(product);
    const result: APIGatewayProxyResult =  await addProduct(service)(eventParams);

    expect(result.statusCode).toBe(StatusCodes.BAD_REQUEST); 
    expect(result.body).toBe(JSON.stringify({ message: 'Payload is empty or invalid'}));
  });

  test('create product, incorrect body - error thrown', async () => {
    const eventParams: APIGatewayProxyEvent = { body: JSON.stringify({ count: 1}) } as any;
    const spyFn = jest.spyOn(service, "createProduct").mockResolvedValue(product);
    const result: APIGatewayProxyResult =  await addProduct(service)(eventParams);

    expect(result.statusCode).toBe(StatusCodes.BAD_REQUEST); 
    expect(result.body).toBe(JSON.stringify({ message: 'Payload is empty or invalid'}));
  });
}); 