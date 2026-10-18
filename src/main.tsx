import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/queryClient';
import HomePage from '@/pages/HomePage';
import { Toaster } from '@/components/ui/sonner';
import '@/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HomePage />
      <Toaster position="top-right" closeButton />
    </QueryClientProvider>
  </React.StrictMode>
);
