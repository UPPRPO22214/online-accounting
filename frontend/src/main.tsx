import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { client } from './shared/api/gen/client.gen';
import { App } from '@/app';

export const serverUrl = import.meta.env.VITE_API_HOSTNAME;
client.setConfig({
  baseUrl: serverUrl,
  credentials: 'include'
});

const queryClient = new QueryClient();

const container = document.getElementById(`root`);
const root = createRoot(container!);
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <App />
    </QueryClientProvider>
  </StrictMode>
);