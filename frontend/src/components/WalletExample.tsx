import { useAlgoWallet } from '../hooks/useAlgoWallet';
import algosdk from 'algosdk';
import { useState } from 'react';
export default function WalletExample() {
  const {
    activeAddress,
    algodClient,
    signTransactions,
    isConnected
  } = useAlgoWallet();
  const [txnStatus, setTxnStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const sendPayment = async () => {
    if (!activeAddress || !algodClient) {
      setTxnStatus('Please connect your wallet first');
      return;
    }
    try {
      setIsLoading(true);
      setTxnStatus('Creating transaction...');
      const suggestedParams = await algodClient.getTransactionParams().do();
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: activeAddress,
        amount: 1_000_000,
        suggestedParams,
        note: new TextEncoder().encode('AlgoChit test transaction')
      });
      const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
      setTxnStatus('Waiting for signature...');
      const signedTxns = await signTransactions([encodedTxn]);
      setTxnStatus('Sending transaction...');
      const signedTxn = signedTxns[0];
      if (!signedTxn) {
        throw new Error('Transaction signing failed');
      }
      const result = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = result.txid;
      setTxnStatus(`Transaction sent! ID: ${txId}`);
      setTxnStatus('Waiting for confirmation...');
      const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
      setTxnStatus(`Transaction confirmed in round ${confirmedTxn.confirmedRound}!`);
    } catch (error) {
      console.error('Transaction error:', error);
      setTxnStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  const getAccountInfo = async () => {
    if (!activeAddress || !algodClient) {
      setTxnStatus('Please connect your wallet first');
      return;
    }
    try {
      setIsLoading(true);
      const accountInfo = await algodClient.accountInformation(activeAddress).do();
      const balance = Number(accountInfo.amount) / 1_000_000;
      setTxnStatus(`Account Balance: ${balance} ALGO`);
    } catch (error) {
      console.error('Account info error:', error);
      setTxnStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  if (!isConnected) {
    return <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Please connect your wallet to use these features</p>
      </div>;
  }
  return <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Wallet Actions</h2>

      <div className="space-y-4">
        <div className="flex gap-3">
          <button onClick={getAccountInfo} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
            Get Balance
          </button>

          <button onClick={sendPayment} disabled={isLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400">
            Send Test Transaction
          </button>
        </div>

        {txnStatus && <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 font-mono break-all">{txnStatus}</p>
          </div>}

        {isLoading && <div className="flex items-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>}
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>
          <strong>Connected Address:</strong>
        </p>
        <p className="font-mono break-all">{activeAddress}</p>
      </div>
    </div>;
}