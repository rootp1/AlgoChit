import React from 'react';
import ReactDOM from 'react-dom/client';
import { WalletProvider } from '@txnlab/use-wallet-react';
import App from './App';
import './index.css';
import { walletManager } from './walletConfig';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode>
    <WalletProvider manager={walletManager}>
      <App />
    </WalletProvider>
  </React.StrictMode>);