import { ProductService } from "../services/product-service";
import { getProductList } from './getProductList';
import { getSingleProduct } from './getProductById';
import { addProduct } from './addProduct';
import { DynamoDbRepository } from "../services/repository/dynamodb-repository";

const productService = new ProductService(new DynamoDbRepository());

export const getAllProducts = getProductList(productService);
export const getProductById = getSingleProduct(productService);
export const createProduct = addProduct(productService);