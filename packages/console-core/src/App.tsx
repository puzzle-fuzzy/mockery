import type { RuntimeAdapter } from '@mockery/runtime';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './router';
import { useAuthStore } from './stores';
import { useSettingsStore } from './stores/settingsStore';
import { LoginPage } from './pages/LoginPage';
import { Toaster } from './components/ui/sonner';
import { ApiBaseUrlProvider } from './api-base-url';
import { toast } from 'sonner';
import './index.css';

export interface AppProps {
  runtime: RuntimeAdapter;
  apiBaseUrl: string;
}

export function App({ runtime, apiBaseUrl }: AppProps) {
  const { status, initSession, login, register } = useAuthStore();

  useEffect(() => {
    useSettingsStore.getState().init();
    initSession(apiBaseUrl);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(apiBaseUrl, email, password, runtime.kind === 'desktop' ? 'desktop' : 'web');
    } catch (err) {
      toast.error((err as Error).message || 'Login failed');
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      await register(apiBaseUrl, name, email, password);
    } catch (err) {
      toast.error((err as Error).message || 'Registration failed');
    }
  };

  if (status === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh',
          color: 'var(--color-text-tertiary)',
        }}
      >
        Loading...
      </div>
    );
  }

  // Wrap the whole tree so deep pages/layouts can read the API base URL via
  // useApiBaseUrl() instead of a window global.
  return (
    <ApiBaseUrlProvider value={apiBaseUrl}>
      {status === 'login' ? (
        <LoginPage onLogin={handleLogin} onRegister={handleRegister} />
      ) : (
        <RouterProvider router={router} />
      )}
      <Toaster />
    </ApiBaseUrlProvider>
  );
}
