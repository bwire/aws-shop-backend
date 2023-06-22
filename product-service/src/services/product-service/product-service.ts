import { SQSRecord } from "aws-lambda";
import { PublishCommand } from "@aws-sdk/client-sns";
import { NewProductData, Product, ProductsRepository } from '../repository/types';
import { snsClient } from '../lib'; 
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

  async batchProcessProducts(records: SQSRecord[]) {
    for (const record of records) {
      try {
        //const newProduct = await this.createProduct(JSON.parse(record.body));
        const newProduct = JSON.parse(record.body);

        await snsClient.send(new PublishCommand({
          Subject: 'New product arrived',
          Message: JSON.stringify(newProduct),
          TopicArn: process.env.SNS_TOPIC_ARN,
          // MessageAttributes: {
          //   count: {
          //     DataType: 'Number',
          //     StringValue: newProduct.count,
          //   }
          // }
        }));
      } catch (error) {
        console.log("Batch processing error", error);  
      }
    }
  }
}