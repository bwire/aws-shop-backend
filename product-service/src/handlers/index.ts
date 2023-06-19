import { ProductService } from "../services/product-service";
import { DynamoDbRepository } from "../services/repository/dynamodb-repository";
import { PostgresRepository } from "../services/repository/postgres-repository";
import { makeGetAllProductsHandler } from './getAllProducts';
import { makeGetProductByIdHandler } from './getProductById';
import { makeCreateProductHandler } from './createProduct';
import { makeCatalogBatchProcessHandler } from "./catalogBatchProcess";

const productService = process.env.USE_NOSQL_DB === 'true' 
  ? new ProductService(new DynamoDbRepository()) 
  : new ProductService(new PostgresRepository());

export const getAllProducts = makeGetAllProductsHandler(productService);
export const getProductById = makeGetProductByIdHandler(productService);
export const createProduct = makeCreateProductHandler(productService);
export const catalogBatchProcess = makeCatalogBatchProcessHandler(productService);