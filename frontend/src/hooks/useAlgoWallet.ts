import { useWallet } from '@txnlab/use-wallet-react';
export function useAlgoWallet() {
  const {
    wallets,
    activeWallet,
    activeAddress,
    activeAccount,
    isReady,
    signTransactions,
    transactionSigner,
    algodClient
  } = useWallet();
  const connectWallet = async (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (wallet) {
      await wallet.connect();
    } else {
      throw new Error(`Wallet ${walletId} not found`);
    }
  };
  const disconnectWallet = async () => {
    if (activeWallet) {
      await activeWallet.disconnect();
    }
  };
  const isConnected = !!activeAddress;
  return {
    wallets,
    activeWallet,
    activeAddress,
    activeAccount,
    isReady,
    isConnected,
    connectWallet,
    disconnectWallet,
    signTransactions,
    transactionSigner,
    algodClient
  };
}