import { 
  DynamoDBClient, 
  QueryCommand, 
  QueryCommandOutput, 
  ScanCommand, 
  ScanCommandOutput,
  ExecuteTransactionCommand 
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { NewProductData, Product, ProductsRepository} from './types';
import { v4 as uuid } from 'uuid';

export class DynamoDbRepository implements ProductsRepository {
  private dynamoClient = new DynamoDBClient({ region: process.env.AWS_MAIN_REGION });
  async getAllProducts(): Promise<Product[]> {
    const productsScanOutput: ScanCommandOutput = await this.dynamoClient
      .send(new ScanCommand({ TableName: process.env.TABLE_PRODUCTS! }));

    const stocksScanResult: ScanCommandOutput = await this.dynamoClient
      .send(new ScanCommand({ TableName: process.env.TABLE_STOCKS! }));

    const products = productsScanOutput.Items!.map(i => unmarshall(i));
    const stocks = stocksScanResult.Items!.map(i => unmarshall(i));

    return products.map(p => {
      const stockRecord = stocks.find(s => s.product_id === p.id);
      return {
        ...p,
        count: stockRecord ? stockRecord.count : 0,
      } as Product
    });
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const productsQueryResult: QueryCommandOutput = await this.dynamoClient.send(new QueryCommand({
      ExpressionAttributeValues: { ":id": {'S': id} }, 
      KeyConditionExpression: "id = :id", 
      TableName: process.env.TABLE_PRODUCTS!
    }));
    
    if (productsQueryResult.Items!.length === 0) {
      return; 
    }

    const stocksQueryResult: QueryCommandOutput = await this.dynamoClient.send(new QueryCommand({
      ExpressionAttributeValues: { ":id": {'S': id} }, 
      KeyConditionExpression: "product_id = :id", 
      TableName: process.env.TABLE_STOCKS!
    }));

    return {
      ...unmarshall(productsQueryResult.Items![0]),
      count: stocksQueryResult.Items!.length > 0 ? unmarshall(stocksQueryResult.Items![0]).count : 0,
    } as Product
  };

  async createProduct(payload: NewProductData): Promise<Product | undefined> {
    const { title, description, price, count } = payload;
    const id = uuid().toString();
    
    try {
      await this.dynamoClient.send(new ExecuteTransactionCommand({
        TransactStatements: [{
          Statement: `INSERT INTO ${process.env.TABLE_PRODUCTS} value {'id': ?, 'title': ?, 'description': ?, 'price': ?}`,
          Parameters: [{ 'S': id }, { 'S': title }, { 'S': description }, { 'N': price.toString() }]
        }, {
          Statement: `INSERT INTO ${process.env.TABLE_STOCKS} value {'product_id': ?, 'count': ?}`,
          Parameters: [{ 'S': id }, { 'N': count.toString() }]
        }]   
      }));  
    } catch (error) {
      console.log('fucking error', error);
      return  
    }
     
    return { id, ...payload};
  }
}