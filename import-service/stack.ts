#!/usr/bin/env node
import 'source-map-support/register';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

class ImportServiceStack extends Stack {
  constructor(scope: Construct, props?: StackProps) {
    const APP_PREFIX = "bw-aws-shop-backend-is";
    super(scope,  `${APP_PREFIX}-stack`, props);
  }
}

new ImportServiceStack(new App(), {
  description: "This stack includes resources needed to deploy aws-shop-backend Import service application"
});