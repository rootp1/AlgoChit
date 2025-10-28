import { useState } from 'react';
import { WalletProvider } from '@txnlab/use-wallet-react';
import { SnackbarProvider } from 'notistack';
import Dashboard from './components/Dashboard';
import ContributeForm from './components/ContributeForm';
import BidForm from './components/BidForm';
import ManagerPanel from './components/ManagerPanel';
import ConnectWallet from './components/ConnectWallet';
import { walletManager } from './walletConfig';
function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contribute' | 'bid' | 'manager'>('dashboard');
  return <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <div className="min-h-screen bg-primary-900">
          {}
          <header className="bg-primary-800/70 border-b border-brand-900/40 backdrop-blur-md shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-light text-white tracking-tight">AlgoChit</h1>
                  <p className="text-sm text-brand-300 mt-1">Blockchain Chit Fund Manager</p>
                </div>
                <ConnectWallet />
              </div>
            </div>
          </header>

          {}
          <nav className="bg-primary-800/60 border-b border-brand-900/40 backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-1">
                <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-4 text-sm font-medium transition-all border-b-2 ${activeTab === 'dashboard' ? 'border-brand-400 text-white bg-primary-700/60' : 'border-transparent text-accent-300 hover:text-white hover:bg-primary-700/40 hover:border-brand-700/40'}`}>
                  Dashboard
                </button>
                <button onClick={() => setActiveTab('contribute')} className={`px-6 py-4 text-sm font-medium transition-all border-b-2 ${activeTab === 'contribute' ? 'border-brand-400 text-white bg-primary-700/60' : 'border-transparent text-accent-300 hover:text-white hover:bg-primary-700/40 hover:border-brand-700/40'}`}>
                  Contribute
                </button>
                <button onClick={() => setActiveTab('bid')} className={`px-6 py-4 text-sm font-medium transition-all border-b-2 ${activeTab === 'bid' ? 'border-brand-400 text-white bg-primary-700/60' : 'border-transparent text-accent-300 hover:text-white hover:bg-primary-700/40 hover:border-brand-700/40'}`}>
                  Submit Bid
                </button>
                <button onClick={() => setActiveTab('manager')} className={`px-6 py-4 text-sm font-medium transition-all border-b-2 ${activeTab === 'manager' ? 'border-brand-400 text-white bg-primary-700/60' : 'border-transparent text-accent-300 hover:text-white hover:bg-primary-700/40 hover:border-brand-700/40'}`}>
                  Manager
                </button>
              </div>
            </div>
          </nav>

          {}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'contribute' && <ContributeForm />}
            {activeTab === 'bid' && <BidForm />}
            {activeTab === 'manager' && <ManagerPanel />}
          </main>
        </div>
      </WalletProvider>
    </SnackbarProvider>;
}
export default App;