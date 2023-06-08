export interface ProductInterface {
  id: string,
  title: string,
  description: string,
  price: number,
  count: number,
};

export interface ProductsRepository {
  getProductById: (id: string) => Promise<ProductInterface | undefined>,
  getAllProducts: () => Promise<ProductInterface[]>,
}