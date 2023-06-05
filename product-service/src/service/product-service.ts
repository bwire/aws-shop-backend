import { default as products} from '../../mocks/products-data.json';
import { ProductServiceInterface } from './definitions';

export class ProductService implements ProductServiceInterface {
  getProductById(id: string) {
    return Promise.resolve(products.find(p => p.id === id));
  }
  
  public getAllProducts() {
    return Promise.resolve(products);
  };
}