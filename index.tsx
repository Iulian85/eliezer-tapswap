import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* Using local manifest to prevent fetch errors */}
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
);