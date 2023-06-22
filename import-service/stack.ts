#!/usr/bin/env node
import 'source-map-support/register';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Effect, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { 
  HttpApi, 
  CorsHttpMethod, 
  HttpMethod, 
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { Construct } from 'constructs';
import { config as envConfig } from 'dotenv';

envConfig();
class ImportServiceStack extends Stack {
  constructor(scope: Construct, props?: StackProps) {
    const APP_PREFIX = "bw-aws-shop-backend-is";
    super(scope, `${APP_PREFIX}-stack`, props);

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
    };

    const importProductsFileLambda = new NodejsFunction(
      this, 
      `${APP_PREFIX}-import-products-file-lambda`, {
        ...sharedProps,
        functionName: "importProductsFile",
        handler: "importProductsFile",
        environment: {
          BUCKET_NAME: process.env.AWS_IMPORTS_BUCKET_NAME!,
        }
      }
    );

    importProductsFileLambda.role?.attachInlinePolicy(
      new Policy(this, `${APP_PREFIX}-import-products-policy`, {
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
      `${APP_PREFIX}-import-sqs-queue`, 
      process.env.AWS_IMPORT_SQS_QUEUE_ARN!
    );

    const importFileParserLambda = new NodejsFunction(
      this, 
      `${APP_PREFIX}-import-file-parser-lambda`, {
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
      new Policy(this, `${APP_PREFIX}-file-parser-policy`, {
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
      `${APP_PREFIX}-s3-import-service-bucket`, 
      process.env.AWS_IMPORTS_BUCKET_ARN!
    );

    bucket.addEventNotification(
      EventType.OBJECT_CREATED_PUT,
      new LambdaDestination(importFileParserLambda),
      {prefix: 'uploaded/', suffix: '.csv'}
    );

    const api = new HttpApi(this, `${APP_PREFIX}-imports-api`, {
      corsPreflight: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: [CorsHttpMethod.ANY],
      }
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration(
        `${APP_PREFIX}-importProductsFile-integration`, 
        importProductsFileLambda),
      path: "/import",
      methods: [HttpMethod.GET]
    });
  }
}

new ImportServiceStack(new App(), {
  description: "This stack includes resources needed to deploy aws-shop-backend Import service application"
});
