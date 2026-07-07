import { createContext, useContext } from 'react';

/**
 * Provides the API base URL to the component tree without prop-drilling and
 * without the legacy `window.__MOCKERY_API_BASE_URL` global. App.tsx wraps the
 * rendered tree in `<ApiBaseUrlProvider value={apiBaseUrl}>`; deep pages and
 * layouts read it via `useApiBaseUrl()`.
 *
 * Stores (zustand) still receive `apiBaseUrl` as an explicit argument on every
 * call — they live outside React's tree, so context can't reach them. The
 * components that invoke those stores are the ones that pull the URL from
 * context and forward it.
 */
const ApiBaseUrlContext = createContext<string>('');

export const ApiBaseUrlProvider = ApiBaseUrlContext.Provider;

export function useApiBaseUrl(): string {
  return useContext(ApiBaseUrlContext);
}
