import { WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet-react';
const supportedWallets = [{
  id: WalletId.DEFLY
}, {
  id: WalletId.PERA
}, {
  id: WalletId.EXODUS
}, {
  id: WalletId.LUTE
}];
export const walletManager = new WalletManager({
  wallets: supportedWallets,
  defaultNetwork: NetworkId.TESTNET,
  networks: {
    [NetworkId.TESTNET]: {
      algod: {
        baseServer: 'https://testnet-api.algonode.cloud',
        port: '',
        token: ''
      }
    },
    [NetworkId.MAINNET]: {
      algod: {
        baseServer: 'https://mainnet-api.algonode.cloud',
        port: '',
        token: ''
      }
    }
  },
  options: {
    resetNetwork: true
  }
});