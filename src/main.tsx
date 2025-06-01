import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppProviders } from '@/context/AppProviders';
import App from './App';
import { enableMocking } from './mocks/mock';
import AppWrapper from './components/layouts/common/AppWrapper';
enableMocking().then(() => {
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <AppWrapper>
        <App />
      </AppWrapper>
    </AppProviders>
  </StrictMode>
);})
