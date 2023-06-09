import { DynamoDB } from 'aws-sdk';
import { Product, ProductsRepository} from './types';
export class DynamoDbRepository implements ProductsRepository {
  private dynamo = new DynamoDB.DocumentClient();

  async getAllProducts(): Promise<Product[]> {
    const productsScanResult = await this.dynamo.scan({ TableName: process.env.TABLE_PRODUCTS! }).promise();
    const stocksScanResult = await this.dynamo.scan({ TableName: process.env.TABLE_STOCKS! }).promise();

    const products = productsScanResult.Items!;
    const stocks = stocksScanResult.Items!;

    return products.map(p => {
      const stockRecord = stocks.find(s => s.product_id === p.id);
      return {
        ...p,
        count: stockRecord ? stockRecord.count : 0,
      } as Product
    });
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const productsQueryResult = await this.dynamo.query({
      ExpressionAttributeValues: { ":id": id }, 
      KeyConditionExpression: "id = :id", 
      TableName: process.env.TABLE_PRODUCTS!
     }).promise();
    
    if (productsQueryResult.Items!.length === 0) {
      return; 
    }

    const stocksQueryResult = await this.dynamo.query({
      ExpressionAttributeValues: { ":id": id }, 
      KeyConditionExpression: "product_id = :id", 
      TableName: process.env.TABLE_STOCKS!
    }).promise();

    return {
      ...productsQueryResult.Items![0],
      count: stocksQueryResult.Items!.length > 0 ? stocksQueryResult.Items![0].count : 0,
    } as Product
  };

  async createProduct(payload: Product): Promise<Product> {
    const { id, title, description, price, count } = payload;
  
    await this.dynamo.transactWrite({
      TransactItems: [{
        Put: {
          TableName: process.env.TABLE_PRODUCTS!,
          Item: { id, title, description, price },
        }
      }, {
        Put: {
          TableName: process.env.TABLE_STOCKS!,
          Item: { product_id: id, count },  
        }
      }]
    }).promise();
    
    return { ...payload};
  }
}