import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { AwsShopNodejsBackStack } from '../lib/aws-shop-nodejs-back-stack';

const app = new App();

new AwsShopNodejsBackStack(app, {
  description: "This stack includes resources needed to deploy aws-shop-backend application"
});