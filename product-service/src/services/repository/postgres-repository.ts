import { Client } from 'pg';
import { v4 as uuid } from 'uuid';
import { NewProductData, Product, ProductsRepository} from './types';

export class PostgresRepository implements ProductsRepository {
  private async getClient(): Promise<Client> {
    const client = new Client();
    await client.connect();
    return client;
  }
  
  async getAllProducts(): Promise<Product[]> {
    const client = await this.getClient();
      const queryText = '\
        SELECT p.*, COALESCE(s.count, 0) count \
        FROM products p \
        INNER JOIN stocks s \
        ON p.id = s.product_id';

    try {
      const result = await client.query(queryText);
      return result['rows'];  
    } catch (error) {
      throw error  
    } finally {
      client.end();  
    }   
  }
  
  async getProductById(id: string): Promise<Product | undefined> {
    const client = await this.getClient();
    const queryText = "\
      SELECT p.*, COALESCE(s.count, 0) count \
      FROM products p \
      INNER JOIN stocks s \
      ON p.id = s.product_id \
      WHERE p.id = $1";

    try {
      const result = await client.query({ text: queryText, values: [id]});
      if (result['rows'].length < 1) {
        return;
      }
      return result['rows'][0];  
    } catch (error) {
      throw error  
    } finally {
      client.end();
    }
  }

  async createProduct(payload: NewProductData): Promise<Product | undefined> {
    const client = await this.getClient();
    const { title, description, price, count } = payload;
    const id = uuid();

    const queryTextProducts = "\
      INSERT INTO products(id, title, description, price) \
      VALUES($1, $2, $3, $4);"
    const queryTextStocks = "\
      INSERT INTO stocks (product_id, count) \
      VALUES($1, $2)";

    try {
      await client.query('BEGIN');

      await client.query({ 
        text: queryTextProducts, 
        values: [id, title, description, price],
      });
      await client.query({ 
        text: queryTextStocks, 
        values: [id, count],
      });
      
      await client.query('COMMIT');

      return {id, ...payload};
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.end();
    }
  }
}
