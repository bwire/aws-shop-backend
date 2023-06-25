import { PublishCommand } from "@aws-sdk/client-sns";
import { SQSRecord } from "aws-lambda";
import { snsClient } from '../../aws-clients';
import { NewProductData, Product, ProductsRepository } from '../repository/types';
export class ProductService {
  constructor(private repository: ProductsRepository) {}

  async getAllProducts(): Promise<Product[]> {
    return this.repository.getAllProducts();
  };

  async getProductById(id: string): Promise<Product | undefined> {
    return this.repository.getProductById(id);
  }

  async createProduct(payload: NewProductData): Promise<Product | undefined> {
    return this.repository.createProduct(payload);
  }

  async batchProcessProducts(records: SQSRecord[]): Promise<void> {
    for (const record of records) {
      const newProduct = await this.createProduct(JSON.parse(record.body));
  
      if (newProduct) {
        await snsClient.send(new PublishCommand({
          Subject: 'New product arrived',
          Message: JSON.stringify(newProduct),
          TopicArn: process.env.SNS_TOPIC_ARN,
          MessageAttributes: {
            count: {
              DataType: 'Number',
              StringValue: String(newProduct.count),
            }
          }
        }));
      }
    }
  }
}