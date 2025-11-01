import algosdk from 'algosdk';
import { Buffer } from 'buffer';
import contractABI from '../ChitFundContract.arc32.json';
const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL 
  ? `${(import.meta as any).env.VITE_BACKEND_URL}/api/chitfund`
  : 'https://yttric-socorro-maniacally.ngrok-free.dev/api/chitfund';
const APP_ID = parseInt((import.meta as any).env?.VITE_APP_ID || '748490425');
const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
const contract = new algosdk.ABIContract(contractABI.contract);
const getMethod = (name: string): algosdk.ABIMethod => {
  const method = contract.methods.find(m => m.name === name);
  if (!method) {
    throw new Error(`Method ${name} not found in contract ABI`);
  }
  return method;
};
export const api = {
  getState: async () => {
    const response = await fetch(`${API_BASE_URL}/state`);
    return response.json();
  },
  addMember: async (memberAddress: string) => {
    const response = await fetch(`${API_BASE_URL}/members/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        memberAddress
      })
    });
    return response.json();
  },
  removeMember: async (memberAddress: string) => {
    const response = await fetch(`${API_BASE_URL}/members/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        memberAddress
      })
    });
    return response.json();
  },
  startChit: async () => {
    const response = await fetch(`${API_BASE_URL}/start`, {
      method: 'POST'
    });
    return response.json();
  },
  contribute: async (senderAddress: string, transactionSigner: any, amount: number) => {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do();
      const atc = new algosdk.AtomicTransactionComposer();
      const walletSigner: algosdk.TransactionSigner = async (unsignedTxns: algosdk.Transaction[]) => {
        const encoded = unsignedTxns.map(txn => algosdk.encodeUnsignedTransaction(txn));
        const signed = await transactionSigner(encoded);
        return signed;
      };
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: senderAddress,
        receiver: algosdk.getApplicationAddress(APP_ID),
        amount: amount,
        suggestedParams: suggestedParams
      });
      const boxName = new Uint8Array(Buffer.concat([Buffer.from('m'), algosdk.decodeAddress(senderAddress).publicKey]));
      atc.addTransaction({
        txn: paymentTxn,
        signer: walletSigner
      });
      atc.addMethodCall({
        appID: APP_ID,
        method: getMethod('contribute'),
        methodArgs: [],
        sender: senderAddress,
        signer: walletSigner,
        suggestedParams,
        boxes: [{
          appIndex: APP_ID,
          name: boxName
        }]
      });
      const result = await atc.execute(algodClient, 4);
      return {
        success: true,
        txId: result.txIDs[result.txIDs.length - 1],
        amount
      };
    } catch (error: any) {
      console.error('Contribution error:', error);
      throw new Error(error.message || 'Failed to contribute');
    }
  },
  submitBid: async (senderAddress: string, transactionSigner: any, discountPercent: number) => {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do();
      const atc = new algosdk.AtomicTransactionComposer();
      const walletSigner: algosdk.TransactionSigner = async (unsignedTxns: algosdk.Transaction[]) => {
        const encoded = unsignedTxns.map(txn => algosdk.encodeUnsignedTransaction(txn));
        const signed = await transactionSigner(encoded);
        return signed;
      };
      const memberBoxName = new Uint8Array(Buffer.concat([Buffer.from('m'), algosdk.decodeAddress(senderAddress).publicKey]));
      const bidBoxName = new Uint8Array(Buffer.concat([Buffer.from('b'), algosdk.decodeAddress(senderAddress).publicKey]));
      const discountPercentUint64 = Math.floor(discountPercent);
      atc.addMethodCall({
        appID: APP_ID,
        method: getMethod('submitBid'),
        methodArgs: [discountPercentUint64],
        sender: senderAddress,
        signer: walletSigner,
        suggestedParams,
        boxes: [{
          appIndex: APP_ID,
          name: memberBoxName
        }, {
          appIndex: APP_ID,
          name: bidBoxName
        }]
      });
      const result = await atc.execute(algodClient, 4);
      return {
        success: true,
        txId: result.txIDs[0],
        discountPercent
      };
    } catch (error: any) {
      console.error('Submit bid error:', error);
      throw new Error(error.message || 'Failed to submit bid');
    }
  },
  distribute: async (winnerAddress: string, discountPercent: number = 0) => {
    const response = await fetch(`${API_BASE_URL}/distribute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        winnerAddress,
        discountPercent
      })
    });
    return response.json();
  },
  getMember: async (address: string) => {
    const response = await fetch(`${API_BASE_URL}/members/${address}`);
    return response.json();
  },
  getTransactions: async (limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/transactions?limit=${limit}`);
    return response.json();
  },
  pauseChit: async () => {
    const response = await fetch(`${API_BASE_URL}/pause`, {
      method: 'POST'
    });
    return response.json();
  },
  resumeChit: async () => {
    const response = await fetch(`${API_BASE_URL}/resume`, {
      method: 'POST'
    });
    return response.json();
  },
  updateTotalMembers: async (newTotal: number) => {
    const response = await fetch(`${API_BASE_URL}/members/update-total`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newTotal }),
    });
    return response.json();
  },

  getBids: async (limit = 100) => {
    const response = await fetch(`${API_BASE_URL}/bids?limit=${limit}`);
    return response.json();
  },

  // Auto-select winner by maximum discount and distribute
  distributeAuto: async () => {
    const response = await fetch(`${API_BASE_URL}/distribute/auto`, {
      method: 'POST',
    });
    return response.json();
  },
};