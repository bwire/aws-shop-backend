// TODO Add types and signature (auth documentation)

export const makeBasicAuthorizer = () => 
  async (event: any): Promise<void> => {
    console.log('Incoming request', event);
    console.log('env', process.env);
  }