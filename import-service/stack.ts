#!/usr/bin/env node
import 'source-map-support/register';
import { App, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Effect, Policy, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Runtime, Function } from "aws-cdk-lib/aws-lambda";
import { 
  HttpApi, 
  CorsHttpMethod, 
  HttpMethod,
  IHttpRouteAuthorizer,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { config as envConfig } from 'dotenv';

envConfig();
class ImportServiceStack extends Stack {
  constructor() {
    const MAIN_APP_PREFIX = "bw-aws-shop-backend";
    const SERVICE_PREFIX = `${MAIN_APP_PREFIX}-import`;

    super(
      new App(), 
      `${SERVICE_PREFIX}-stack`, {
        description: "This stack includes resources needed to deploy aws-shop-backend Import service application"
      }
    );

    const actions: string[] = [
      "s3:GetObject",
      "s3:PutObject"
    ];
    const resources = [
      `${process.env.AWS_IMPORTS_BUCKET_ARN}`,
      `${process.env.AWS_IMPORTS_BUCKET_ARN}/*`, 
    ];

    const sharedProps: Partial<NodejsFunctionProps> = {
      entry: './src/handlers/index.ts',
      runtime: Runtime.NODEJS_18_X,
      environment: {
        AWS_MAIN_REGION: process.env.AWS_MAIN_REGION!,
      }
    };

    const importProductsFileLambda = new NodejsFunction(
      this, 
      `${SERVICE_PREFIX}-import-products-file-lambda`, {
        ...sharedProps,
        functionName: "importProductsFile",
        handler: "importProductsFile",
        environment: {
          BUCKET_NAME: process.env.AWS_IMPORTS_BUCKET_NAME!,
        }
      }
    );

    importProductsFileLambda.role?.attachInlinePolicy(
      new Policy(this, `${SERVICE_PREFIX}-import-products-policy`, {
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions,
            resources,
          }),
        ],
      })
    );

    const queue = Queue.fromQueueArn(
      this, 
      `${SERVICE_PREFIX}-import-sqs-queue`, 
      process.env.AWS_IMPORT_SQS_QUEUE_ARN!
    );

    const importFileParserLambda = new NodejsFunction(
      this, 
      `${SERVICE_PREFIX}-import-file-parser-lambda`, {
        ...sharedProps,
        functionName: "importFileParser",
        handler: "importFileParser",
        environment: {
          CSV_SEPARATOR: process.env.CSV_SEPARATOR!,
          IMPORT_QUEUE_URL: queue.queueUrl,
        }
      }
    );

    importFileParserLambda.role?.attachInlinePolicy(
      new Policy(this, `${SERVICE_PREFIX}-file-parser-policy`, {
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [...actions, "s3:DeleteObject"],
            resources,
          }),
        ],
      })
    );

    queue.grantSendMessages(importFileParserLambda);
    
    const bucket = Bucket.fromBucketArn(
      this, 
      `${SERVICE_PREFIX}-s3-import-service-bucket`, 
      process.env.AWS_IMPORTS_BUCKET_ARN!
    );

    bucket.addEventNotification(
      EventType.OBJECT_CREATED_PUT,
      new LambdaDestination(importFileParserLambda),
      {prefix: 'uploaded/', suffix: '.csv'}
    );

    const api = new HttpApi(this, `${SERVICE_PREFIX}-imports-api`, {
      corsPreflight: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: [CorsHttpMethod.ANY],
      }, 
      
    });

    const authLambda = Function.fromFunctionName(
      this, 
      `${SERVICE_PREFIX}-auth-lambda`, 
      'basicAuthorizer'
    );
    
    const authorizer: IHttpRouteAuthorizer = new HttpLambdaAuthorizer(
      `${SERVICE_PREFIX}-basic-authorizer`,
      authLambda, {
        authorizerName: 'main-basic-authorizer',
        responseTypes: [
          HttpLambdaResponseType.SIMPLE,
        ],
        resultsCacheTtl: Duration.seconds(0),  
      }
    );
    
    authLambda.addPermission(`${SERVICE_PREFIX}-aoi-invocation`, {
      principal: new ServicePrincipal(api.url!),
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration(
        `${SERVICE_PREFIX}-importProductsFile-integration`, 
        importProductsFileLambda),
      path: "/import",
      methods: [HttpMethod.GET],
      authorizer,
    });
  }
}

new ImportServiceStack();
