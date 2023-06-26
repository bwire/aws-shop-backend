import { SQSEvent } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { ProductService } from '../../src/services/product-service';
import { DynamoDbRepository } from '../../src/services/repository/dynamodb-repository';
import { makeCatalogBatchProcessHandler } from '../../src/handlers/catalogBatchProcess';

describe('catalogBatchProcess tests', () => {
  const service = new ProductService(new DynamoDbRepository());

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('create product, return a valid result', async () => {
    const event: SQSEvent = { Records: [] };
    const spyFn = jest.spyOn(service, "batchProcessProducts");
    await makeCatalogBatchProcessHandler(service)(event);

    expect(spyFn).toBeCalledTimes(1);
    expect(spyFn).toBeCalledWith([]);
  });

  test('create product, incorrect body - error thrown', async () => {
    const event: SQSEvent = { Records: [] };
    const spyFn = jest.spyOn(service, "createProduct").mockRejectedValue(new Error('Unexpected error'));

    try {
      await makeCatalogBatchProcessHandler(service)(event);    
    } catch (error: any) {
      expect(error.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR); 
      expect(error.message).toBe(JSON.stringify({ message: 'Unexpected error'}));  
    }
  });
});
 