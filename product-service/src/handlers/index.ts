import { ProductService } from "../services/product-service";
import { getProductList } from './getProductList';
import { getSingleProduct } from './getProductById';
import { addProduct } from './addProduct';
import { DynamoDbRepository } from "../services/repository/dynamodb-repository";
import { PostgresRepository } from "../services/repository/postgres-repository";

const productService = process.env.USE_NOSQL_DB === 'true' 
  ? new ProductService(new DynamoDbRepository()) 
  : new ProductService(new PostgresRepository());

export const getAllProducts = getProductList(productService);
export const getProductById = getSingleProduct(productService);
export const createProduct = addProduct(productService);