import { SQSClient } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({ region: process.env.AWS_MAIN_REGION });

export { sqsClient };