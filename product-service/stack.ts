import { Construct } from 'constructs';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { 
  HttpApi, 
  CorsHttpMethod, 
  HttpMethod, 
  ParameterMapping, 
  MappingValue 
} from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { config as envConfig } from 'dotenv';
import 'source-map-support/register';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

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
            "dynamodb:PartiQLInsert",
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

    const snsTopic = new sns.Topic(this, `${APP_PREFIX}-import-sns-topic`, {
      topicName: 'import-product-topic',
    });

    const catalogBatchProcessLambda = new NodejsFunction(this, `${APP_PREFIX}-catalog-batch-process-lambda`, {
      ...sharedProps,
      functionName: "catalogBatchProcess",
      handler: "catalogBatchProcess", 
      description: 'Batch processes products data received from SQS queue', 
       
      environment: {
        ...sharedProps.environment,
        SNS_TOPIC_ARN: snsTopic.topicArn,
        AWS_MAIN_REGION: process.env.AWS_MAIN_REGION!,
      }
    });

    snsTopic.grantPublish(catalogBatchProcessLambda);

    new sns.Subscription(this, `${APP_PREFIX}-regular-sns-subscription`, {
      endpoint: process.env.SNS_EMAIL_REGULAR!,
      protocol: sns.SubscriptionProtocol.EMAIL,
      topic: snsTopic, 
    });

    new sns.Subscription(this, `${APP_PREFIX}-special-sns-subscription`, {
      endpoint: process.env.SNS_EMAIL_SPECIAL!,
      protocol: sns.SubscriptionProtocol.EMAIL,
      topic: snsTopic, 
      filterPolicy: { count: sns.SubscriptionFilter.numericFilter({ lessThanOrEqualTo: 10 }) }
    });

    getProductListLambda.role?.attachInlinePolicy(lambdaPolicy);
    getProductByIdLambda.role?.attachInlinePolicy(lambdaPolicy);
    createProductLambda.role?.attachInlinePolicy(lambdaPolicy);
    catalogBatchProcessLambda.role?.attachInlinePolicy(lambdaPolicy);

    const importQueue = new sqs.Queue(this, `${APP_PREFIX}-import-sqs-queue`, {
      queueName: 'import-file-queue',
    });

    catalogBatchProcessLambda.addEventSource(new SqsEventSource(importQueue, {
      batchSize: Number(process.env.SQS_BATCH_SIZE!),
    }));

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

// TODO should be returned
new ProductServiceStack(new App(), {
  description: "This stack includes temporary resources needed to deploy aws-shop-backend application"
});