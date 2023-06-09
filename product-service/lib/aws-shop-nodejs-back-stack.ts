import * as cdk from 'aws-cdk-lib';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import { HttpApi, CorsHttpMethod, HttpMethod, ParameterMapping, MappingValue } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { Construct } from 'constructs';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dotenv from 'dotenv';

dotenv.config();
export class AwsShopNodejsBackStack extends cdk.Stack {
  constructor(scope: Construct, props?: cdk.StackProps) {
    const APP_PREFIX = "bw-aws-shop-backend";
    super(scope, `${APP_PREFIX}-stack`, props);

    const policy = new iam.Policy(this, `${APP_PREFIX}-dynamodb-read-policy`, {
      statements: [
        new iam.PolicyStatement({
          actions: [
            "dynamodb:Scan",
            "dynamodb:Query",
            "dynamodb:PutItem",
          ],
          resources: [
            `arn:aws:dynamodb:*:*:table/${process.env.DB_TABLE_PRODUCTS}`, 
            `arn:aws:dynamodb:*:*:table/${process.env.DB_TABLE_STOCKS}`
          ],
        })
      ],
    });

    const sharedProps: Partial<NodejsFunctionProps> = {
      entry: './src/handlers/index.ts',
      runtime: lambda.Runtime.NODEJS_18_X,
    };

    const getProductListLambda = new NodejsFunction(this, `${APP_PREFIX}-get-product-list-lambda`, {
      ...sharedProps,
      functionName: "getProductList",
      handler: "getAllProducts",
      environment: {
        TABLE_PRODUCTS: process.env.DB_TABLE_PRODUCTS!,
        TABLE_STOCKS: process.env.DB_TABLE_STOCKS!,
      },  
    });

    const getProductByIdLambda = new NodejsFunction(this, `${APP_PREFIX}-get-product-by-id-lambda`, {
      ...sharedProps,
      functionName: "getProductById",
      handler: "getProductById",
      environment: {
        TABLE_PRODUCTS: process.env.DB_TABLE_PRODUCTS!,
        TABLE_STOCKS: process.env.DB_TABLE_STOCKS!,
      },    
    });

    const createProductLambda = new NodejsFunction(this, `${APP_PREFIX}-create-product-lambda`, {
      ...sharedProps,
      functionName: "createProduct",
      handler: "createProduct",
      environment: {
        TABLE_PRODUCTS: process.env.DB_TABLE_PRODUCTS!,
        TABLE_STOCKS: process.env.DB_TABLE_STOCKS!,
      },    
    });

    getProductListLambda.role?.attachInlinePolicy(policy);
    getProductByIdLambda.role?.attachInlinePolicy(policy);
    createProductLambda.role?.attachInlinePolicy(policy);

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
