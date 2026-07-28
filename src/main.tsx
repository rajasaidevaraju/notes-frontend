import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/queryClient';
import HomePage from '@/pages/HomePage';
import Notification from '@/components/Notification';
import '@fontsource-variable/inter';
import '@/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HomePage />
      <Notification />
    </QueryClientProvider>
  </React.StrictMode>
);
