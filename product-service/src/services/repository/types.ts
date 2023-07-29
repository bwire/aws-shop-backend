export interface NewProductData {
  title: string,
  description: string,
  image: string,
  price: number,
  count: number,
};
export interface Product extends NewProductData{
  id: string,
};

export interface ProductsRepository {
  getProductById: (id: string) => Promise<Product | undefined>,
  getAllProducts: () => Promise<Product[]>,
  createProduct: (payload: NewProductData) => Promise<Product | undefined>,
}
