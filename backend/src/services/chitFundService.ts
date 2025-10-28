import algosdk from 'algosdk';
import { getAlgodClient, getIndexerClient, config } from '../config.js';
export class ChitFundService {
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;
  private appId: number;
  constructor() {
    this.algodClient = getAlgodClient();
    this.indexerClient = getIndexerClient();
    this.appId = config.appId;
  }
  async addMember(managerAccount: algosdk.Account, memberAddress: string) {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    const appArgs = [new Uint8Array(Buffer.from('addMember')), algosdk.decodeAddress(memberAddress).publicKey];
    const txn = algosdk.makeApplicationNoOpTxn(managerAccount.addr, suggestedParams, this.appId, appArgs);
    const signedTxn = txn.signTxn(managerAccount.sk);
    const {
      txId
    } = await this.algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return {
      txId,
      memberAddress
    };
  }
  async startChit(managerAccount: algosdk.Account) {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    const appArgs = [new Uint8Array(Buffer.from('startChit'))];
    const txn = algosdk.makeApplicationNoOpTxn(managerAccount.addr, suggestedParams, this.appId, appArgs);
    const signedTxn = txn.signTxn(managerAccount.sk);
    const {
      txId
    } = await this.algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return {
      txId,
      status: 'Chit fund started'
    };
  }
  async contribute(userAccount: algosdk.Account, amount: number) {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParams(userAccount.addr, algosdk.getApplicationAddress(this.appId), amount, undefined, undefined, suggestedParams);
    const appArgs = [new Uint8Array(Buffer.from('contribute'))];
    const appCallTxn = algosdk.makeApplicationNoOpTxn(userAccount.addr, suggestedParams, this.appId, appArgs);
    const txns = [paymentTxn, appCallTxn];
    const txnGroup = algosdk.assignGroupID(txns);
    const signedTxns = txnGroup.map(txn => txn.signTxn(userAccount.sk));
    const {
      txId
    } = await this.algodClient.sendRawTransaction(signedTxns).do();
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return {
      txId,
      amount
    };
  }
  async submitBid(userAccount: algosdk.Account, discountPercent: number) {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    const appArgs = [new Uint8Array(Buffer.from('submitBid')), algosdk.encodeUint64(discountPercent)];
    const txn = algosdk.makeApplicationNoOpTxn(userAccount.addr, suggestedParams, this.appId, appArgs);
    const signedTxn = txn.signTxn(userAccount.sk);
    const {
      txId
    } = await this.algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return {
      txId,
      discountPercent
    };
  }
  async selectWinnerAndDistribute(managerAccount: algosdk.Account, winnerAddress: string) {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    const appArgs = [new Uint8Array(Buffer.from('selectWinnerAndDistribute')), algosdk.decodeAddress(winnerAddress).publicKey];
    const txn = algosdk.makeApplicationNoOpTxn(managerAccount.addr, suggestedParams, this.appId, appArgs);
    const signedTxn = txn.signTxn(managerAccount.sk);
    const {
      txId
    } = await this.algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return {
      txId,
      winnerAddress
    };
  }
  async getAppState() {
    try {
      const appInfo = await this.algodClient.getApplicationByID(this.appId).do();
      const globalState: Record<string, any> = {};
      if (appInfo.params['global-state']) {
        appInfo.params['global-state'].forEach((item: any) => {
          const key = Buffer.from(item.key, 'base64').toString();
          let value = item.value;
          if (value.type === 1) {
            globalState[key] = Buffer.from(value.bytes, 'base64').toString();
          } else if (value.type === 2) {
            globalState[key] = value.uint;
          }
        });
      }
      return globalState;
    } catch (error) {
      throw new Error(`Failed to get app state: ${error}`);
    }
  }
  async getMemberDetails(memberAddress: string) {
    try {
      const boxName = algosdk.decodeAddress(memberAddress).publicKey;
      const boxValue = await this.algodClient.getApplicationBoxByName(this.appId, boxName).do();
      return {
        address: memberAddress,
        boxData: Buffer.from(boxValue.value).toString('base64')
      };
    } catch (error) {
      return null;
    }
  }
  async getTransactionHistory(limit = 10) {
    try {
      const txns = await this.indexerClient.searchForTransactions().applicationID(this.appId).limit(limit).do();
      return txns.transactions;
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error}`);
    }
  }
  async pauseChit(managerAccount: algosdk.Account) {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    const appArgs = [new Uint8Array(Buffer.from('pauseChit'))];
    const txn = algosdk.makeApplicationNoOpTxn(managerAccount.addr, suggestedParams, this.appId, appArgs);
    const signedTxn = txn.signTxn(managerAccount.sk);
    const {
      txId
    } = await this.algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return {
      txId,
      status: 'Chit fund paused'
    };
  }
  async resumeChit(managerAccount: algosdk.Account) {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    const appArgs = [new Uint8Array(Buffer.from('resumeChit'))];
    const txn = algosdk.makeApplicationNoOpTxn(managerAccount.addr, suggestedParams, this.appId, appArgs);
    const signedTxn = txn.signTxn(managerAccount.sk);
    const {
      txId
    } = await this.algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return {
      txId,
      status: 'Chit fund resumed'
    };
  }
  async submitSignedTransaction(signedTxn: Uint8Array) {
    const {
      txId
    } = await this.algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return {
      txId
    };
  }
  async submitSignedTransactions(signedTxns: Uint8Array[]) {
    const {
      txId
    } = await this.algodClient.sendRawTransaction(signedTxns).do();
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return {
      txId
    };
  }
}