import { DynamoDB } from 'aws-sdk';
import { Product, ProductsRepository} from './types';
import { v4 as uuid } from 'uuid';
export class DynamoDbRepository implements ProductsRepository {
  private dynamo = new DynamoDB.DocumentClient();

  async getAllProducts(): Promise<Product[]> {
    console.log('getting products');
    
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

  async createProduct(payload: Product): Promise<Product | undefined> {
    const { title, description, price, count } = payload;
    const id = uuid().toString();
    
    try {
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
    } catch (error) {
      return  
    }
     
    return { ...payload};
  }
}