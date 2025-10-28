import algosdk from 'algosdk';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({
  path: path.join(__dirname, '../../backend/.env')
});
async function deployChitFundContract() {
  console.log('🚀 Deploying ChitFundContract to TestNet...\n');
  const algodToken = '';
  const algodServer = 'https://testnet-api.algonode.cloud';
  const algodPort = 443;
  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
  const mnemonicFromEnv = process.env.MANAGER_MNEMONIC;
  if (!mnemonicFromEnv) {
    throw new Error('MANAGER_MNEMONIC not set in backend/.env');
  }
  const deployerAccount = algosdk.mnemonicToSecretKey(mnemonicFromEnv);
  console.log('📍 Deployer Address:', deployerAccount.addr);
  const accountInfo = await algodClient.accountInformation(deployerAccount.addr).do();
  console.log('💰 Balance:', (accountInfo.amount / 1_000_000).toFixed(3), 'ALGO');
  if (accountInfo.amount < 1_000_000) {
    throw new Error('❌ Insufficient balance. Please fund your account with testnet ALGO from https://bank.testnet.algorand.network/');
  }
  const artifactsPath = path.join(__dirname, '../artifacts');
  const approvalProgram = fs.readFileSync(path.join(artifactsPath, 'ChitFundContract.approval.teal'), 'utf8');
  const clearProgram = fs.readFileSync(path.join(artifactsPath, 'ChitFundContract.clear.teal'), 'utf8');
  console.log('\n📝 Compiling smart contract...');
  const approvalCompiled = await algodClient.compile(approvalProgram).do();
  const clearCompiled = await algodClient.compile(clearProgram).do();
  const monthlyContribution = 10_000_000;
  const commissionPercent = 5;
  const totalMembers = 10;
  console.log('\n=== Deployment Parameters ===');
  console.log('Monthly Contribution:', monthlyContribution / 1_000_000, 'ALGO');
  console.log('Commission:', commissionPercent, '%');
  console.log('Total Members:', totalMembers);
  const params = await algodClient.getTransactionParams().do();
  const onComplete = algosdk.OnApplicationComplete.NoOpOC;
  const methodSelector = algosdk.ABIMethod.fromSignature('createApplication(uint64,uint64,uint64)void').getSelector();
  const uint64Type = algosdk.ABIType.from('uint64');
  const appArgs = [methodSelector, uint64Type.encode(monthlyContribution), uint64Type.encode(commissionPercent), uint64Type.encode(totalMembers)];
  const localInts = 0;
  const localBytes = 0;
  const globalInts = 6;
  const globalBytes = 1;
  const extraPages = 3;
  console.log('\n📤 Creating application transaction...');
  const txn = algosdk.makeApplicationCreateTxnFromObject({
    from: deployerAccount.addr,
    suggestedParams: params,
    onComplete,
    approvalProgram: new Uint8Array(Buffer.from(approvalCompiled.result, 'base64')),
    clearProgram: new Uint8Array(Buffer.from(clearCompiled.result, 'base64')),
    numLocalInts: localInts,
    numLocalByteSlices: localBytes,
    numGlobalInts: globalInts,
    numGlobalByteSlices: globalBytes,
    extraPages,
    appArgs
  });
  const signedTxn = txn.signTxn(deployerAccount.sk);
  console.log('🔐 Signed transaction');
  console.log('📡 Sending transaction to network...');
  const {
    txId
  } = await algodClient.sendRawTransaction(signedTxn).do();
  console.log('Transaction ID:', txId);
  console.log('⏳ Waiting for confirmation...');
  const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
  const appId = confirmedTxn['application-index'];
  const appAddress = algosdk.getApplicationAddress(appId);
  console.log('\n✅ SUCCESS! ChitFundContract deployed!');
  console.log('=====================================');
  console.log('📋 Application ID:', appId);
  console.log('📍 Application Address:', appAddress);
  console.log('🔗 View on AlgoExplorer:', `https://testnet.algoexplorer.io/application/${appId}`);
  console.log('=====================================\n');
  console.log('📝 Updating .env files with new APP_ID...\n');
  const backendEnvPath = path.join(__dirname, '../../backend/.env');
  const frontendEnvPath = path.join(__dirname, '../../frontend/.env');
  let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
  backendEnv = backendEnv.replace(/APP_ID=\d+/, `APP_ID=${appId}`);
  fs.writeFileSync(backendEnvPath, backendEnv);
  console.log('✅ Updated backend/.env');
  let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
  frontendEnv = frontendEnv.replace(/VITE_APP_ID=\d+/, `VITE_APP_ID=${appId}`);
  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log('✅ Updated frontend/.env');
  console.log('\n🎉 Deployment complete! You can now:');
  console.log('1. Restart your backend and frontend servers');
  console.log('2. Add members using the Manager Panel');
  console.log('3. Start the chit fund');
  console.log('4. Begin accepting contributions\n');
  return appId;
}
deployChitFundContract().then(() => process.exit(0)).catch(error => {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
});