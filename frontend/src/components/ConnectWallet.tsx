import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
export default function ConnectWallet() {
  const {
    wallets,
    activeWallet,
    activeAddress,
    isReady
  } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD;
  const handleConnect = async (wallet: Wallet) => {
    try {
      await wallet.connect();
      setShowModal(false);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };
  const handleDisconnect = async () => {
    try {
      if (activeWallet) {
        await activeWallet.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };
  if (!isReady) {
    return <div className="flex items-center gap-2 px-4 py-2 bg-accent-900 border border-accent-700 rounded-lg">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-accent-200">Loading wallets...</span>
      </div>;
  }
  return <>
      <div className="flex items-center gap-4">
        {activeAddress ? <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-accent-900 border border-accent-600 rounded-lg">
              <div className="text-xs text-green-400 font-medium mb-1">Connected</div>
              <div className="text-sm font-mono text-white">
                {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
              </div>
            </div>
            <button onClick={handleDisconnect} className="px-4 py-2 bg-accent-700 border border-accent-600 text-white font-medium text-sm rounded-lg hover:bg-accent-600 transition shadow-md">
              Disconnect
            </button>
          </div> : <button onClick={() => setShowModal(true)} className="btn-primary px-5 py-2">
            Connect Wallet
          </button>}
      </div>

      {}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999] p-4">
          <div className="bg-primary-800 border border-accent-700 rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-white">Select Wallet</h2>
              <button onClick={() => setShowModal(false)} className="text-accent-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              {wallets.filter(wallet => !isKmd(wallet)).map(wallet => <button key={wallet.id} onClick={() => handleConnect(wallet)} className="w-full flex items-center gap-3 p-4 bg-accent-900 border border-brand-900/40 rounded-lg hover:border-brand-600 hover:bg-accent-800 transition">
                    {wallet.metadata.icon && <img src={wallet.metadata.icon} alt={wallet.metadata.name} className="w-8 h-8" />}
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white">{wallet.metadata.name}</p>
                      {!wallet.isActive && <p className="text-xs text-accent-400">Extension not detected - click to install</p>}
                    </div>
                  </button>)}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>;
}