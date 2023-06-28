export const makeBasicAuthorizer = () => 
  async (event: any): Promise<void> => {
    console.log('Incoming request', event);
  }