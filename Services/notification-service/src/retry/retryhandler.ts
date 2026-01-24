

const MAX_RETRIES = 2;



export function retryHandler(retryCount: number): boolean {
  return retryCount < MAX_RETRIES;
  
}
