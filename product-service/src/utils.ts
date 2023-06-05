import { APIGatewayProxyResult } from "aws-lambda";

const defaultHeaders = {
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Origin': '*'
};

const errorResponse = (err: Error, statusCode: number = 500): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      ...defaultHeaders
    },
    body: JSON.stringify({ message: err.message || 'Something went wrong !!!'})
  }
}

const successResponse = (body: Object, statusCode: number = 200): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      ...defaultHeaders
    },
    body: JSON.stringify(body)
  }
}

export { errorResponse, successResponse };
