import { Construct } from 'constructs';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { config as envConfig } from 'dotenv';

envConfig();
class AuthServiceStack extends Stack {
  constructor(scope: Construct, props?: StackProps) {
    const APP_PREFIX = "bw-aws-shop-backend";
    super(scope, `${APP_PREFIX}-stack`, props);

    const basicAuthorizerLambda = new NodejsFunction(this, `${APP_PREFIX}-basic-authorizer-lambda`, {
      functionName: "basicAuthorizer",
      handler: "basicAuthorizer", 
      description: 'Default authorizer (Basic authorization)',
      environment: {
        BWIRE: process.env.BWIRE!
      }
    });
  }
}

new AuthServiceStack(new App(), {
  description: "This stack includes resource for authorization inside shop-backend application"
});