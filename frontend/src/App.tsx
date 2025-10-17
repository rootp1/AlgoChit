import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ContributeForm from './components/ContributeForm';
import BidForm from './components/BidForm';
import ManagerPanel from './components/ManagerPanel';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contribute' | 'bid' | 'manager'>('dashboard');

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AlgoChit</h1>
          <p className="text-white text-lg">Blockchain-Powered Chit Fund Manager</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6 p-2 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('contribute')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition ${
              activeTab === 'contribute'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Contribute
          </button>
          <button
            onClick={() => setActiveTab('bid')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition ${
              activeTab === 'bid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Submit Bid
          </button>
          <button
            onClick={() => setActiveTab('manager')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition ${
              activeTab === 'manager'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Manager
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'contribute' && <ContributeForm />}
          {activeTab === 'bid' && <BidForm />}
          {activeTab === 'manager' && <ManagerPanel />}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-white text-sm">
          <p>Powered by Algorand Blockchain</p>
          <p className="mt-1 text-xs opacity-80">Transparent, Trustless, Decentralized</p>
        </div>
      </div>
    </div>
  );
}

export default App;
