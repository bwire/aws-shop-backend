import { Construct } from 'constructs';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { 
  HttpApi, 
  CorsHttpMethod, 
  HttpMethod, 
  ParameterMapping, 
  MappingValue 
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { config as envConfig } from 'dotenv';
import 'source-map-support/register';

envConfig();

class ProductServiceStack extends Stack {
  private getEnvironment() {
    return {
      TABLE_PRODUCTS: process.env.DB_TABLE_PRODUCTS!,
      TABLE_STOCKS: process.env.DB_TABLE_STOCKS!,
      USE_NOSQL_DB: process.env.USE_NOSQL_DB!,
      ...process.env.USE_NOSQL_DB === 'true' ? {} : {
        PGHOST: process.env.PGHOST!,
        PGPORT: process.env.PGPORT!,
        PGDATABASE: process.env.PGDATABASE!,
        PGUSER: process.env.PGUSER!,
        PGPASSWORD: process.env.PGPASSWORD!,
      }  
    }
  }

  constructor(scope: Construct, props?: StackProps) {
    const APP_PREFIX = "bw-aws-shop-backend";
    super(scope, `${APP_PREFIX}-stack`, props);

    const lambdaPolicy = new Policy(this, `${APP_PREFIX}-dynamodb-read-policy`, {
      statements: [
        new PolicyStatement({
          actions: [
            "dynamodb:Scan",
            "dynamodb:Query",
            "dynamodb:PutItem",
          ],
          resources: [
            `arn:aws:dynamodb:*:*:table/${process.env.DB_TABLE_PRODUCTS}`, 
            `arn:aws:dynamodb:*:*:table/${process.env.DB_TABLE_STOCKS}`
          ],
        }),
      ],
    });

    const sharedProps: Partial<NodejsFunctionProps> = {
      entry: './src/handlers/index.ts',
      runtime: Runtime.NODEJS_18_X,
      environment: this.getEnvironment(),
    };

    const getProductListLambda = new NodejsFunction(this, `${APP_PREFIX}-get-product-list-lambda`, {
      ...sharedProps,
      functionName: "getProductList",
      handler: "getAllProducts",
      description: 'Returns list of available products',
    });

    const getProductByIdLambda = new NodejsFunction(this, `${APP_PREFIX}-get-product-by-id-lambda`, {
      ...sharedProps,
      functionName: "getProductById",
      handler: "getProductById",
      description: 'Returns a single product data',
    });

    const createProductLambda = new NodejsFunction(this, `${APP_PREFIX}-create-product-lambda`, {
      ...sharedProps,
      functionName: "createProduct",
      handler: "createProduct", 
      description: 'Creates a new product',
    });

    const catalogBatchProcessLambda = new NodejsFunction(this, `${APP_PREFIX}-catalog-batch-process-lambda`, {
      ...sharedProps,
      functionName: "catalogBatchProcess",
      handler: "catalogBatchProcess", 
      description: 'Batch processes products data received from SQS queue',  
    });

    getProductListLambda.role?.attachInlinePolicy(lambdaPolicy);
    getProductByIdLambda.role?.attachInlinePolicy(lambdaPolicy);
    createProductLambda.role?.attachInlinePolicy(lambdaPolicy);
    
    const api = new HttpApi(this, `${APP_PREFIX}-products-api`, {
      corsPreflight: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: [CorsHttpMethod.GET],
      }
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration(`${APP_PREFIX}-getProductLst-integration`, getProductListLambda),
      path: "/products",
      methods: [HttpMethod.GET]
    });


    api.addRoutes({
      integration: new HttpLambdaIntegration(`${APP_PREFIX}-getProductById-integration`, getProductByIdLambda, {
        parameterMapping: new ParameterMapping().appendQueryString('productId', MappingValue.requestPathParam('productId'))}),
      path: "/products/{productId}",
      methods: [HttpMethod.GET]
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration(`${APP_PREFIX}-createProduct-integration`, createProductLambda),
        path: "/products",
        methods: [HttpMethod.POST]
    });
  }
}

new ProductServiceStack(new App(), {
  description: "This stack includes resources needed to deploy aws-shop-backend application"
});