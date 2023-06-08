import * as cdk from 'aws-cdk-lib';
import * as lambda from "aws-cdk-lib/aws-lambda";
import { HttpApi, CorsHttpMethod, HttpMethod, ParameterMapping, MappingValue } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { Construct } from 'constructs';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dotenv from 'dotenv';

dotenv.config();
console.log(process.env) 

export class AwsShopNodejsBackStack extends cdk.Stack {
  constructor(scope: Construct, props?: cdk.StackProps) {
    const APP_PREFIX = "bw-aws-shop-backend";
    super(scope, `${APP_PREFIX}-stack`, props);

    const sharedProps: Partial<NodejsFunctionProps> = {
      entry: './src/index.ts',
      runtime: lambda.Runtime.NODEJS_18_X,
    };

    const getProductList = new NodejsFunction(this, `${APP_PREFIX}-get-product-list-lambda`, {
      ...sharedProps,
      functionName: "getProductList",
      handler: "getAllProducts",
      environment: {
        TABLE_PRODUCTS: process.env.DB_TABLE_PRODUCTS!,
        TABLE_STOCKS: process.env.DB_TABLE_STOCKS!,
      },  
    });

    const getProductById = new NodejsFunction(this, `${APP_PREFIX}-get-product-by-id-lambda`, {
      ...sharedProps,
      functionName: "getProductById",
      handler: "getProductById",
      environment: {
        TABLE_PRODUCTS: process.env.DB_TABLE_PRODUCTS!,
        TABLE_STOCKS: process.env.DB_TABLE_STOCKS!,
      },    
    });

    const api = new HttpApi(this, `${APP_PREFIX}-products-api`, {
      corsPreflight: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: [CorsHttpMethod.GET],
      }
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration(`${APP_PREFIX}-getProductLst-integration`, getProductList),
      path: "/products",
      methods: [HttpMethod.GET]
    });


    api.addRoutes({
      integration: new HttpLambdaIntegration(`${APP_PREFIX}-getProductById-integration`, getProductById, {
        parameterMapping: new ParameterMapping().appendQueryString('productId', MappingValue.requestPathParam('productId'))}),
      path: "/products/{productId}",
      methods: [HttpMethod.GET]
    });
  }
}
