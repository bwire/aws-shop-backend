import 'aws-sdk-client-mock-jest';
import { v4 as uuid } from 'uuid';
import { SQSRecord } from 'aws-lambda';
import { snsClient } from '../../src/aws-clients';
import { mockClient } from 'aws-sdk-client-mock';
import { ProductService } from '../../src/services/product-service';
import { DynamoDbRepository } from '../../src/services/repository/dynamodb-repository';
import { PublishCommand } from '@aws-sdk/client-sns';

describe('batchProcessProducts tests', () => {
  const service = new ProductService(new DynamoDbRepository())
  const product = {
    id: uuid(),
    count: 1,
    description: 'Product 1',
    price: 45,
    title: 'P1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('create product, return a valid result', async () => {
    const spyCreateProduct = jest.spyOn(service, "createProduct").mockResolvedValue(product);
    const records = [{ body: JSON.stringify(product) } as any as SQSRecord];
    const snsClientMock = mockClient(snsClient);
    snsClientMock.on(PublishCommand).resolves({});

    await service.batchProcessProducts(records);

    expect(spyCreateProduct).toBeCalledTimes(1);
    expect(spyCreateProduct).toHaveBeenCalledWith(product);
    expect(snsClientMock).toHaveReceivedCommandWith(
      PublishCommand, {
        Subject: 'New product arrived',
        Message: JSON.stringify(product),
        MessageAttributes: {
          count: {
            DataType: 'Number',
            StringValue: '1',
          }
        }
      }
    );
  });

  test('create product throws an error', async () => {
    const spyCreateProduct = jest.spyOn(service, "createProduct")
      .mockRejectedValue(new Error('Unexpected error'));
    const records = [{ body: JSON.stringify(product) } as any as SQSRecord];
    const snsClientMock = mockClient(snsClient);
    snsClientMock.on(PublishCommand).resolves({});

    try {
      await service.batchProcessProducts(records);  
    } catch (error: any) {
      expect(spyCreateProduct).toBeCalledTimes(1);
      expect(spyCreateProduct).toHaveBeenCalledWith(product);
      expect(error.message).toEqual('Unexpected error');
      expect(snsClientMock).not.toHaveReceivedCommand(PublishCommand);
    }
  });
}); 
