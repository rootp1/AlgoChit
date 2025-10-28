import { useWallet } from '@txnlab/use-wallet-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
export default function WalletSelector() {
  const {
    wallets,
    activeWallet,
    activeAddress,
    isReady
  } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [panelStyle, setPanelStyle] = useState<{ top: number; left: number; width?: number } | null>(null);
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const width = Math.max(260, rect.width);
      const left = Math.min(window.innerWidth - width - 12, rect.left);
      const top = rect.bottom + 8;
      setPanelStyle({ top, left, width });
    } else {
      setPanelStyle(null);
    }
  }, [isOpen]);
  const handleConnect = async (walletId: string) => {
    try {
      setIsConnecting(true);
      setSelectedWalletId(walletId);
      const wallet = wallets.find(w => w.id === walletId);
      if (wallet) {
        await wallet.connect();
        setIsOpen(false);
      }
    } catch (error) {
      console.error(`Error connecting to ${walletId}:`, error);
    } finally {
      setIsConnecting(false);
      setSelectedWalletId(null);
    }
  };
  const handleDisconnect = async () => {
    try {
      if (activeWallet) {
        await activeWallet.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };
  if (!isReady) {
    return <div className="flex items-center gap-2 px-4 py-2 bg-accent-900 border border-accent-700 rounded-lg">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-accent-200">Loading wallets...</span>
      </div>;
  }
  return <div className="relative">
      {activeAddress ? <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-accent-900 border border-accent-600 rounded-lg">
            <div className="text-xs text-green-400 font-medium mb-1">
              Connected via {activeWallet?.metadata.name || 'Wallet'}
            </div>
            <div className="text-sm font-mono text-white">
              {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
            </div>
          </div>
          <button onClick={handleDisconnect} className="px-4 py-2 bg-accent-700 border border-accent-600 text-white font-medium text-sm rounded-lg hover:bg-accent-600 transition shadow-md">
            Disconnect
          </button>
        </div> : <>
          <button ref={buttonRef} onClick={() => setIsOpen(!isOpen)} className="px-6 py-2.5 bg-white text-primary-900 font-semibold text-sm rounded-lg hover:bg-accent-100 transition shadow-md flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Connect Wallet
            <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {}
          {isOpen && typeof document !== 'undefined' && createPortal(
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <div
                className="bg-primary-800 border border-accent-700 rounded-lg shadow-xl min-w-[260px] z-[99999]"
                style={panelStyle ? { position: 'absolute', top: panelStyle.top, left: panelStyle.left, width: panelStyle.width } : { position: 'absolute', visibility: 'hidden' }}
              >
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-accent-400 uppercase">
                    Select a Wallet
                  </div>
                  {wallets.length === 0 ? <div className="px-3 py-4 text-sm text-accent-400 text-center">
                      No wallets configured
                    </div> : wallets.map(wallet => <button key={wallet.id} onClick={() => handleConnect(wallet.id)} disabled={isConnecting} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent-900 transition text-left disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-accent-600">
                        {wallet.metadata.icon && <img src={wallet.metadata.icon} alt={wallet.metadata.name} className="w-8 h-8 rounded" />}
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {wallet.metadata.name}
                          </div>
                          {wallet.isActive ? (
                            <div className="text-xs text-green-400">Ready</div>
                          ) : (
                            <div className="text-xs text-accent-400">Click to install extension</div>
                          )}
                        </div>
                        {isConnecting && selectedWalletId === wallet.id && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                      </button>)}
                </div>
              </div>
            </>,
            document.body
          )}
        </>}

      {}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>;
}