import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import { router } from '@/routes';
import { QueryProvider } from '@/context/QueryProvider';
import { enableMocking } from './mocks/mock'
enableMocking().then(() => {
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  </StrictMode>,
);
})
