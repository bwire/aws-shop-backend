import { 
  APIGatewayRequestAuthorizerEventV2,
  Context,
} from "aws-lambda";
import { makeBasicAuthorizer } from '../src/handlers/basic-authorizer';

describe('makeBasicAuthorizer tests', () => {
  process.env.bwire='TEST_PASSWORD';

  const mockContext = {} as any as Context;
  const mockCallback = jest.fn();

  test('bad credentials case', async () => {
    const mockEvent = {
      headers: { authorization: 'Basic YndpcmU6VEVTVF9QQVNTV09SRBBB==' },
    } as any as APIGatewayRequestAuthorizerEventV2;
    
    await makeBasicAuthorizer()(mockEvent, mockContext, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith(null, { isAuthorized: false });
  });

  test('happy case', async () => {
    const mockEvent = {
      headers: { authorization: 'Basic YndpcmU6VEVTVF9QQVNTV09SRA==' },
    } as any as APIGatewayRequestAuthorizerEventV2;
    
    await makeBasicAuthorizer()(mockEvent, mockContext, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith(null, { isAuthorized: true });
  });
});


