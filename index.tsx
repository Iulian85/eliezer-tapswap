import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// The manifestUrl is a required parameter for the TonConnectUIProvider.
// It should point to the tonconnect-manifest.json file hosted on your server.
const manifestUrl = new URL('/tonconnect-manifest.json', window.location.origin).toString();

root.render(
  <React.StrictMode>
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/tapswap_bot'
      }}
    >
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
);
