import { Product, ProductsRepository } from '../repository/types';

export class ProductService {
  constructor(private repository: ProductsRepository) {}

  async getAllProducts(): Promise<Product[]> {
    return this.repository.getAllProducts();
  };

  async getProductById(id: string): Promise<Product | undefined> {
    return this.repository.getProductById(id);
  }

  async createProduct(payload: Product): Promise<Product | undefined> {
    return this.repository.createProduct(payload);
  }
}