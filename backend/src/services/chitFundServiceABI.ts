import algosdk from 'algosdk';
import { getAlgodClient, getIndexerClient, config } from '../config.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class ChitFundServiceABI {
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;
  private appId: number;
  private contract: algosdk.ABIContract;
  constructor() {
    this.algodClient = getAlgodClient();
    this.indexerClient = getIndexerClient();
    this.appId = config.appId;
    const abiPath = path.join(__dirname, '../ChitFundContract.arc32.json');
    const contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
    this.contract = new algosdk.ABIContract(contractABI.contract);
  }
  private getMethod(name: string): algosdk.ABIMethod {
    const method = this.contract.methods.find(m => m.name === name);
    if (!method) {
      throw new Error(`Method ${name} not found in contract ABI`);
    }
    return method;
  }
  async addMember(managerAccount: algosdk.Account, memberAddress: string) {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    const atc = new algosdk.AtomicTransactionComposer();
    const boxName = new Uint8Array(Buffer.concat([Buffer.from('m'), algosdk.decodeAddress(memberAddress).publicKey]));
    const boxMBR = 2500 + 400 * (33 + 49);
    
    // Use minFee (1000) + box MBR cost
    const minFee = typeof suggestedParams.minFee === 'bigint' ? Number(suggestedParams.minFee) : (suggestedParams.minFee || 1000);
    const totalFee = minFee + boxMBR;
    console.log('💰 Add Member Fee Calculation:', { minFee, boxMBR, totalFee });
    
    // Directly modify the original params object
    suggestedParams.flatFee = true;
    suggestedParams.fee = BigInt(totalFee);
    
    atc.addMethodCall({
      appID: this.appId,
      method: this.getMethod('addMember'),
      methodArgs: [memberAddress],
      sender: managerAccount.addr,
      signer: algosdk.makeBasicAccountTransactionSigner(managerAccount),
      suggestedParams,
      boxes: [{
        appIndex: this.appId,
        name: boxName
      }]
    });
    const result = await atc.execute(this.algodClient, 4);
    return {
      txId: result.txIDs[0],
      memberAddress
    };
  }
  async removeMember(managerAccount: algosdk.Account, memberAddress: string) {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    const atc = new algosdk.AtomicTransactionComposer();
    const boxName = new Uint8Array(Buffer.concat([Buffer.from('m'), algosdk.decodeAddress(memberAddress).publicKey]));
    atc.addMethodCall({
      appID: this.appId,
      method: this.getMethod('removeMember'),
      methodArgs: [memberAddress],
      sender: managerAccount.addr,
      signer: algosdk.makeBasicAccountTransactionSigner(managerAccount),
      suggestedParams,
      boxes: [{
        appIndex: this.appId,
        name: boxName
      }]
    });
    const result = await atc.execute(this.algodClient, 4);
    return {
      txId: result.txIDs[0],
      memberAddress
    };
  }
  async startChit(managerAccount: algosdk.Account) {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    const atc = new algosdk.AtomicTransactionComposer();
    atc.addMethodCall({
      appID: this.appId,
      method: this.getMethod('startChit'),
      methodArgs: [],
      sender: managerAccount.addr,
      signer: algosdk.makeBasicAccountTransactionSigner(managerAccount),
      suggestedParams
    });
    const result = await atc.execute(this.algodClient, 4);
    return {
      txId: result.txIDs[0],
      status: 'Chit fund started'
    };
  }
  async contribute(userAccount: algosdk.Account, amount: number) {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    const atc = new algosdk.AtomicTransactionComposer();
    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: userAccount.addr,
      receiver: algosdk.getApplicationAddress(this.appId),
      amount,
      suggestedParams
    });
    const boxName = new Uint8Array(Buffer.concat([Buffer.from('m'), algosdk.decodeAddress(userAccount.addr.toString()).publicKey]));
    atc.addTransaction({
      txn: paymentTxn,
      signer: algosdk.makeBasicAccountTransactionSigner(userAccount)
    });
    atc.addMethodCall({
      appID: this.appId,
      method: this.getMethod('contribute'),
      methodArgs: [],
      sender: userAccount.addr,
      signer: algosdk.makeBasicAccountTransactionSigner(userAccount),
      suggestedParams,
      boxes: [{
        appIndex: this.appId,
        name: boxName
      }]
    });
    const result = await atc.execute(this.algodClient, 4);
    return {
      txId: result.txIDs[1],
      amount
    };
  }
  async submitBid(userAccount: algosdk.Account, discountPercent: number) {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    const atc = new algosdk.AtomicTransactionComposer();
    const memberBoxName = new Uint8Array(Buffer.concat([Buffer.from('m'), algosdk.decodeAddress(userAccount.addr.toString()).publicKey]));
    const bidBoxName = new Uint8Array(Buffer.concat([Buffer.from('b'), algosdk.decodeAddress(userAccount.addr.toString()).publicKey]));
    const discountPercentUint64 = Math.floor(discountPercent);
    atc.addMethodCall({
      appID: this.appId,
      method: this.getMethod('submitBid'),
      methodArgs: [discountPercentUint64],
      sender: userAccount.addr,
      signer: algosdk.makeBasicAccountTransactionSigner(userAccount),
      suggestedParams,
      boxes: [{
        appIndex: this.appId,
        name: memberBoxName
      }, {
        appIndex: this.appId,
        name: bidBoxName
      }]
    });
    const result = await atc.execute(this.algodClient, 4);
    return {
      txId: result.txIDs[0],
      discountPercent
    };
  }
  async selectWinnerAndDistribute(
    managerAccount: algosdk.Account, 
    winnerAddress: string, 
    discountPercent: number = 0,
    memberAddresses: string[] = []
  ) {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    suggestedParams.flatFee = true;
    
    const numInnerTxns = 1 + 1 + memberAddresses.filter(addr => addr !== winnerAddress).length;
    const feePerTxn = 1000;
    suggestedParams.fee = BigInt(feePerTxn * (1 + numInnerTxns));
    
    console.log('Number of inner txns expected:', numInnerTxns);
    console.log('Total fee set:', suggestedParams.fee, 'microAlgos');
    
    const memberBoxName = new Uint8Array(Buffer.concat([Buffer.from('m'), algosdk.decodeAddress(winnerAddress).publicKey]));
    const bidBoxName = new Uint8Array(Buffer.concat([Buffer.from('b'), algosdk.decodeAddress(winnerAddress).publicKey]));
    
    const method = this.getMethod('distributePot');
    const methodSelector = method.getSelector();
    const addressType = algosdk.ABIType.from('address');
    const uint64Type = algosdk.ABIType.from('uint64');
    const addressArrayType = algosdk.ABIType.from('address[]');
    
    const encodedArgs = [
      methodSelector,
      addressType.encode(winnerAddress),
      uint64Type.encode(discountPercent),
      addressArrayType.encode(memberAddresses)
    ];
    
    const foreignAccounts = [winnerAddress, ...memberAddresses.filter(addr => addr !== winnerAddress)];
    
    console.log('=== Transaction Details ===');
    console.log('Foreign accounts (for inner txns):', foreignAccounts);
    console.log('Fee multiplier:', Math.max(3, numInnerTxns));
    console.log('Total fee:', suggestedParams.fee, 'microAlgos');
    
    const txn = algosdk.makeApplicationNoOpTxnFromObject({
      sender: managerAccount.addr,
      appIndex: this.appId,
      appArgs: encodedArgs,
      accounts: foreignAccounts,
      boxes: [
        { appIndex: this.appId, name: memberBoxName },
        { appIndex: this.appId, name: bidBoxName }
      ],
      suggestedParams
    });
    
    const signedTxn = txn.signTxn(managerAccount.sk);
    const { txid: txId } = await this.algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    
    return {
      txId,
      winnerAddress,
      discountPercent
    };
  }

  // List bids from box storage (boxes named 'b' + address) and sort by discount desc
  async getBidsSortedByDiscount(limit: number = 100) {
    const bids: Array<{ address: string; discountPercent: number }> = [];

    const res: any = await this.algodClient.getApplicationBoxes(this.appId).do();
    const boxes = res.boxes || [];

      for (const b of boxes) {
        try {
          const nameB64 = b.name as string;
          const nameBytes = Buffer.from(nameB64, 'base64');
          if (nameBytes.length >= 33 && nameBytes[0] === 'b'.charCodeAt(0)) {
            const pubkey = nameBytes.slice(1, 33);
            const addr = algosdk.encodeAddress(pubkey);

            const boxVal = await this.algodClient.getApplicationBoxByName(this.appId, nameBytes).do();
            const rawVal: any = boxVal.value;
            const valBytes = typeof rawVal === 'string' ? Buffer.from(rawVal, 'base64') : Buffer.from(rawVal);

            let discount = 0;
            if (valBytes.length >= 8) {
              discount = Number(
                (BigInt(valBytes[0]) << 56n) |
                (BigInt(valBytes[1]) << 48n) |
                (BigInt(valBytes[2]) << 40n) |
                (BigInt(valBytes[3]) << 32n) |
                (BigInt(valBytes[4]) << 24n) |
                (BigInt(valBytes[5]) << 16n) |
                (BigInt(valBytes[6]) << 8n) |
                BigInt(valBytes[7])
              );
            }

            bids.push({ address: addr, discountPercent: discount });
          }
        } catch {}
      }

    // Note: pagination not handled here; assumes number of boxes <= default server page size
    bids.sort((a, b) => b.discountPercent - a.discountPercent);
    const resList = limit ? bids.slice(0, limit) : bids;
    // Fallback: if no boxes are present (e.g., simple contract not writing bids), fetch from Indexer
    if (resList.length === 0) {
      return this.getBidsFromIndexer(limit);
    }
    return resList;
  }

  // Pick the highest discount bid and distribute to that winner
  async selectWinnerByMaxDiscount(managerAccount: algosdk.Account) {
    const bids = await this.getBidsSortedByDiscount();
    if (!bids.length) {
      throw new Error('No bids found');
    }
    const top = bids[0];
    
    const memberAddresses = await this.getAllMemberAddresses();
    
    console.log('=== Distribution Debug ===');
    console.log('Winner:', top.address);
    console.log('Discount:', top.discountPercent, '%');
    console.log('All members:', memberAddresses);
    console.log('Non-winners:', memberAddresses.filter(addr => addr !== top.address));
    
    return this.selectWinnerAndDistribute(managerAccount, top.address, top.discountPercent, memberAddresses);
  }

  async getAllMemberAddresses(): Promise<string[]> {
    const members: string[] = [];
    
    try {
      const res: any = await this.algodClient.getApplicationBoxes(this.appId).do();
      const boxes = res.boxes || [];
      
      for (const b of boxes) {
        try {
          const nameB64 = b.name as string;
          const nameBytes = Buffer.from(nameB64, 'base64');
          if (nameBytes.length >= 33 && nameBytes[0] === 'm'.charCodeAt(0)) {
            const pubkey = nameBytes.slice(1, 33);
            const addr = algosdk.encodeAddress(pubkey);
            members.push(addr);
          }
        } catch {}
      }
    } catch (error) {
      console.error('Error fetching member boxes:', error);
    }
    
    return members;
  }
  // Fallback: derive bids from Indexer by scanning submitBid app calls and decoding the uint64 argument
  async getBidsFromIndexer(limit: number = 100) {
    const method = this.getMethod('submitBid');
    const selector = method.getSelector(); // Uint8Array length 4
    const txns = await this.indexerClient
      .searchForTransactions()
      .applicationID(this.appId)
      .txType('appl')
      .limit(1000) // fetch a page and then slice below
      .do();
    const map = new Map<string, { address: string; discountPercent: number; round: number }>();
    for (const t of txns.transactions || []) {
      const appCall = t.applicationTransaction;
      if (!appCall || !Array.isArray(appCall.applicationArgs) || appCall.applicationArgs.length < 2) continue;
      const a0 = appCall.applicationArgs[0];
      const a1 = appCall.applicationArgs[1];
      if (!a0 || !a1) continue;
      if (a0.length !== 4 || !Buffer.from(selector).equals(Buffer.from(a0))) continue; // not submitBid
      if (a1.length !== 8) continue;
      const discount = Number(
        (BigInt(a1[0]) << 56n) |
        (BigInt(a1[1]) << 48n) |
        (BigInt(a1[2]) << 40n) |
        (BigInt(a1[3]) << 32n) |
        (BigInt(a1[4]) << 24n) |
        (BigInt(a1[5]) << 16n) |
        (BigInt(a1[6]) << 8n) |
        BigInt(a1[7])
      );
      const addr = t.sender as string;
      const round = Number(t.confirmedRound || 0);
      // Keep latest bid per address
      const prev = map.get(addr);
      if (!prev || round > prev.round) {
        map.set(addr, { address: addr, discountPercent: discount, round });
      }
    }
    const list = Array.from(map.values())
      .sort((a, b) => b.discountPercent - a.discountPercent)
      .map(({ address, discountPercent }) => ({ address, discountPercent }));
    return limit ? list.slice(0, limit) : list;
  }
  async getAppState() {
    try {
      const appInfo = await this.algodClient.getApplicationByID(this.appId).do();
      const globalState: Record<string, any> = {};
      
      console.log('📊 Raw global state items count:', appInfo.params.globalState?.length || 0);
      
      const globalStateArray = appInfo.params.globalState || [];
      
      if (globalStateArray && globalStateArray.length > 0) {
        globalStateArray.forEach((item: any) => {
          const key = Buffer.from(item.key, 'base64').toString();
          console.log('🔑 Processing key:', key, 'type:', item.value.type);
          let value = item.value;
          if (value.type === 1) {
            // Handle bytes - try to decode as address if it's 32 bytes
            const bytesValue = Buffer.from(value.bytes, 'base64');
            if (bytesValue.length === 32) {
              try {
                globalState[key] = algosdk.encodeAddress(bytesValue);
              } catch {
                globalState[key] = bytesValue.toString('base64');
              }
            } else {
              globalState[key] = bytesValue.toString();
            }
          } else if (value.type === 2) {
            // Convert BigInt to number for JSON serialization
            globalState[key] = typeof value.uint === 'bigint' ? Number(value.uint) : value.uint;
          }
        });
      }
      
      // Also fetch app address and balance
      const appAddress = algosdk.getApplicationAddress(this.appId);
      const accountInfo = await this.algodClient.accountInformation(appAddress).do();
      globalState['appAddress'] = appAddress.toString(); 
      // Convert BigInt balance to number
      globalState['appBalance'] = typeof accountInfo.amount === 'bigint' ? Number(accountInfo.amount) : accountInfo.amount;
      
      console.log('✅ Final global state keys:', Object.keys(globalState));
      return globalState;
    } catch (error) {
      console.error('❌ Error in getAppState:', error);
      throw new Error(`Failed to get app state: ${error}`);
    }
  }
  async getMemberDetails(memberAddress: string) {
    try {
      const boxName = new Uint8Array(Buffer.concat([Buffer.from('m'), algosdk.decodeAddress(memberAddress).publicKey]));
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
    const atc = new algosdk.AtomicTransactionComposer();
    atc.addMethodCall({
      appID: this.appId,
      method: this.getMethod('pauseChit'),
      methodArgs: [],
      sender: managerAccount.addr,
      signer: algosdk.makeBasicAccountTransactionSigner(managerAccount),
      suggestedParams
    });
    const result = await atc.execute(this.algodClient, 4);
    return {
      txId: result.txIDs[0],
      status: 'Chit fund paused'
    };
  }
  async resumeChit(managerAccount: algosdk.Account) {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    const atc = new algosdk.AtomicTransactionComposer();
    atc.addMethodCall({
      appID: this.appId,
      method: this.getMethod('resumeChit'),
      methodArgs: [],
      sender: managerAccount.addr,
      signer: algosdk.makeBasicAccountTransactionSigner(managerAccount),
      suggestedParams
    });
    const result = await atc.execute(this.algodClient, 4);
    return {
      txId: result.txIDs[0],
      status: 'Chit fund resumed'
    };
  }
  async updateTotalMembers(managerAccount: algosdk.Account, newTotal: number) {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    const atc = new algosdk.AtomicTransactionComposer();
    atc.addMethodCall({
      appID: this.appId,
      method: this.getMethod('updateTotalMembers'),
      methodArgs: [newTotal],
      sender: managerAccount.addr,
      signer: algosdk.makeBasicAccountTransactionSigner(managerAccount),
      suggestedParams
    });
    const result = await atc.execute(this.algodClient, 4);
    return {
      txId: result.txIDs[0],
      newTotal,
      status: 'Total members updated'
    };
  }
  async submitSignedTransaction(signedTxn: Uint8Array) {
    const {
      txid: txId
    } = await this.algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return {
      txId
    };
  }
  async submitSignedTransactions(signedTxns: Uint8Array[]) {
    const {
      txid: txId
    } = await this.algodClient.sendRawTransaction(signedTxns).do();
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return {
      txId
    };
  }
}