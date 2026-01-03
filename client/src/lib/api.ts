import { auth } from './firebase';

/**
 * Custom fetch wrapper that automatically adds Firebase auth token to requests
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const currentUser = auth.currentUser;
  
  if (currentUser) {
    const token = await currentUser.getIdToken();
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    
    options.headers = headers;
  }
  
  return fetch(url, options);
}

/**
 * Setup query client to use authenticated fetch for all API calls
 */
export function setupAuthenticatedFetch() {
  // This can be used with React Query's defaultOptions
  return {
    queries: {
      queryFn: async ({ queryKey }: any) => {
        const url = queryKey[0];
        if (typeof url === 'string' && url.startsWith('/api')) {
          const res = await authenticatedFetch(url);
          if (!res.ok) {
            throw new Error(`${res.status}: ${res.statusText}`);
          }
          return res.json();
        }
        // Fallback for non-API calls
        return null;
      },
    },
  };
}
