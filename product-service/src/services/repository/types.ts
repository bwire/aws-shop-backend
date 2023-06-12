export interface Product {
  id: string,
  title: string,
  description: string,
  price: number,
  count: number,
};

export interface ProductsRepository {
  getProductById: (id: string) => Promise<Product | undefined>,
  getAllProducts: () => Promise<Product[]>,
  createProduct: (payload: Product) => Promise<Product | undefined>,
}