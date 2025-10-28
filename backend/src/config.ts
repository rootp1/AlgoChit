import dotenv from 'dotenv';
import algosdk from 'algosdk';
dotenv.config();
export const config = {
  port: parseInt(process.env.PORT || '3000'),
  algod: {
    server: process.env.ALGOD_SERVER || 'http://localhost',
    port: process.env.ALGOD_PORT !== undefined ? process.env.ALGOD_PORT : '4001',
    token: process.env.ALGOD_TOKEN !== undefined ? process.env.ALGOD_TOKEN : 'a'.repeat(64)
  },
  indexer: {
    server: process.env.INDEXER_SERVER || 'http://localhost',
    // If using https endpoint (e.g., Algonode), default to empty port; else default to 8980
    port: process.env.INDEXER_PORT !== undefined ? process.env.INDEXER_PORT : ((process.env.INDEXER_SERVER || '').startsWith('https://') ? '' : '8980'),
    token: process.env.INDEXER_TOKEN !== undefined ? process.env.INDEXER_TOKEN : 'a'.repeat(64)
  },
  appId: parseInt(process.env.APP_ID || '0'),
  managerMnemonic: process.env.MANAGER_MNEMONIC || ''
};
export const getAlgodClient = () => {
  return new algosdk.Algodv2(config.algod.token, config.algod.server, config.algod.port);
};
export const getIndexerClient = () => {
  return new algosdk.Indexer(config.indexer.token, config.indexer.server, config.indexer.port);
};
export const getManagerAccount = () => {
  if (!config.managerMnemonic) {
    throw new Error('MANAGER_MNEMONIC not set in environment');
  }
  return algosdk.mnemonicToSecretKey(config.managerMnemonic);
};