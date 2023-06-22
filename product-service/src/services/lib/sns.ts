import  { SNSClient } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: process.env.AWS_MAIN_REGION });

export  { snsClient };