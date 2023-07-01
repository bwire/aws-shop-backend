import { APIGatewayProxyResult } from "aws-lambda";
import { StatusCodes } from 'http-status-codes';

const defaultHeaders = {
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Origin': '*'
};

const errorResponse = (err: Error, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      ...defaultHeaders
    },
    body: JSON.stringify({ message: err.message || 'Something went wrong !!!'})
  }
}

const successResponse = (body: Object, statusCode: number = StatusCodes.OK): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      ...defaultHeaders
    },
    body: JSON.stringify(body)
  }
}

export { errorResponse, successResponse };
