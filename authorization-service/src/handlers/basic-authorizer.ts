import { 
  APIGatewayRequestAuthorizerEventV2,
  APIGatewayRequestSimpleAuthorizerHandlerV2,
  APIGatewaySimpleAuthorizerResult,
  Callback,
  Context,
} from "aws-lambda";
import { log } from "console";

export const makeBasicAuthorizer = (): APIGatewayRequestSimpleAuthorizerHandlerV2 => (
  event: APIGatewayRequestAuthorizerEventV2, 
  ctx: Context, 
  callback: Callback<APIGatewaySimpleAuthorizerResult>
): void => {
    console.log('event', event);

    try {
      const token: string = event.headers?.authorization!;
      
      const encodedCreds = token.split(' ')[1];
      const creds: string[] = Buffer.from(encodedCreds, 'base64').toString('utf-8').split(':');
      const userName: string = creds[0];
      const password: string = creds[1];

      const storedPassword: string | undefined = process.env[userName];

      console.log('auth values', userName, password, storedPassword);

      const isAuthorized: boolean = storedPassword && storedPassword === password 
        ? true
        : false;

      callback(null, { isAuthorized });
    } catch (error: any) {
      callback(`Unauthorized: ${error.message}`)  
    }
  }