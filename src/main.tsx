import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { initTheme } from '@/lib/theme';
import { useHistoryStore } from '@/store/historyStore';
import { router } from '@/App';
import '@/styles/index.css';

initTheme();

void useHistoryStore.getState().hydrate();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root was not found.');
}

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
