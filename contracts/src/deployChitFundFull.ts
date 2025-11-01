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
async function deployChitFundFull() {
  console.log('🚀 Deploying ChitFundFull to TestNet...\n');
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
    throw new Error('❌ Insufficient balance. Fund your account at https://bank.testnet.algorand.network/');
  }
  const artifactsPath = path.join(__dirname, '../artifacts');
  const approvalProgram = fs.readFileSync(path.join(artifactsPath, 'ChitFundFull.approval.teal'), 'utf8');
  const clearProgram = fs.readFileSync(path.join(artifactsPath, 'ChitFundFull.clear.teal'), 'utf8');
  console.log('\n📝 Compiling smart contract...');
  const approvalCompiled = await algodClient.compile(approvalProgram).do();
  const clearCompiled = await algodClient.compile(clearProgram).do();
  const monthlyContribution = 100_000; // 0.1 ALGO
  const commissionPercent = 5;
  const totalMembers = 10;
  console.log('\n=== Deployment Parameters ===');
  console.log('Monthly Contribution:', monthlyContribution / 1_000_000, 'ALGO');
  console.log('Commission:', commissionPercent, '%');
  console.log('Total Members:', totalMembers);
  const params = await algodClient.getTransactionParams().do();
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
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
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
  console.log('\n✅ SUCCESS! ChitFundFull deployed!');
  console.log('=====================================');
  console.log('📋 Application ID:', appId);
  console.log('📍 Application Address:', appAddress);
  console.log('🔗 AlgoExplorer:', `https://testnet.algoexplorer.io/application/${appId}`);
  console.log('=====================================\n');
  console.log('📝 Updating configuration files...\n');
  const backendEnvPath = path.join(__dirname, '../../backend/.env');
  const frontendEnvPath = path.join(__dirname, '../../frontend/.env');
  const backendABIPath = path.join(__dirname, '../../backend/src/ChitFundContract.arc32.json');
  const frontendABIPath = path.join(__dirname, '../../frontend/src/ChitFundContract.arc32.json');
  const sourceABIPath = path.join(artifactsPath, 'ChitFundFull.arc32.json');
  fs.copyFileSync(sourceABIPath, backendABIPath);
  fs.copyFileSync(sourceABIPath, frontendABIPath);
  console.log('✅ Updated ABI files');
  let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
  backendEnv = backendEnv.replace(/APP_ID=\d+/, `APP_ID=${appId}`);
  fs.writeFileSync(backendEnvPath, backendEnv);
  console.log('✅ Updated backend/.env');
  let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
  frontendEnv = frontendEnv.replace(/VITE_APP_ID=\d+/, `VITE_APP_ID=${appId}`);
  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log('✅ Updated frontend/.env');
  console.log('\n🎉 Deployment complete! Next steps:');
  console.log('1. Restart your backend: cd backend && npm run dev');
  console.log('2. Restart your frontend: cd frontend && npm run dev');
  console.log('3. Add members using the Manager Panel');
  console.log('4. Start the chit fund');
  console.log('5. Begin accepting contributions\n');
  return appId;
}
deployChitFundFull().then(() => process.exit(0)).catch(error => {
  console.error('\n❌ Deployment failed:', error.message);
  console.error(error);
  process.exit(1);
});