import * as aws from 'aws-sdk';
import { ProductsRepository } from '../repository/types';

export class ProductService {
  constructor(private repository: ProductsRepository) {}

  async getAllProducts() {
    return this.repository.getAllProducts();
  };

  async getProductById(id: string) {
    return this.repository.getProductById(id);
  }
}