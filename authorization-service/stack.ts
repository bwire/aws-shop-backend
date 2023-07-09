import { App, Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { config as envConfig } from 'dotenv';

envConfig();
class AuthServiceStack extends Stack {
  constructor() {
    const MAIN_APP_PREFIX = "bw-aws-shop-backend";
    const SERVICE_PREFIX = `${MAIN_APP_PREFIX}-auth`;

    super(
      new App(), 
      `${SERVICE_PREFIX}-stack`, {
        description: "This stack includes resource for authorization inside aws-shop-backend application"
      }
    );

    new NodejsFunction(this, `${SERVICE_PREFIX}-basic-authorizer-lambda`, {
      functionName: "basicAuthorizer",
      entry: './src/handlers/index.ts',
      runtime: Runtime.NODEJS_18_X,
      handler: "basicAuthorizer", 
      description: 'Default authorizer (Basic authorization)',
      environment: {
        bwire: process.env.BWIRE!
      }
    });
  }
}

new AuthServiceStack();
