import { ProductService } from "./service/product-service";
import { getProductList } from './handlers/getProductList';
import { getSingleProduct } from './handlers/getProductById';

const productService = new ProductService();

export const getAllProducts = getProductList(productService);
export const getProductById = getSingleProduct(productService);