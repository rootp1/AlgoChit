import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../backend/.env') });

async function deployToTestnet() {
  // Connect to TestNet
  const algodToken = '';
  const algodServer = 'https://testnet-api.algonode.cloud';
  const algodPort = 443;

  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

  // Get deployer account from mnemonic
  const mnemonicFromEnv = process.env.MANAGER_MNEMONIC;
  if (!mnemonicFromEnv) {
    throw new Error('MANAGER_MNEMONIC not set in environment');
  }

  const deployerAccount = algosdk.mnemonicToSecretKey(mnemonicFromEnv);
  console.log('Deployer Address:', deployerAccount.addr);

  // Check balance
  const accountInfo = await algodClient.accountInformation(deployerAccount.addr).do();
  console.log('Balance:', accountInfo.amount / 1_000_000, 'ALGO');

  if (accountInfo.amount < 1_000_000) {
    throw new Error('Insufficient balance. Please fund your account with testnet ALGO.');
  }

  // Load compiled TEAL programs
  const artifactsPath = path.join(__dirname, '../artifacts');
  const approvalProgram = fs.readFileSync(
    path.join(artifactsPath, 'ChitFundSimple.approval.teal'),
    'utf8'
  );
  const clearProgram = fs.readFileSync(
    path.join(artifactsPath, 'ChitFundSimple.clear.teal'),
    'utf8'
  );

  // Compile programs
  const approvalCompiled = await algodClient.compile(approvalProgram).do();
  const clearCompiled = await algodClient.compile(clearProgram).do();

  // Contract parameters
  const monthlyContribution = 10_000_000; // 10 ALGO
  const commissionPercent = 5; // 5%
  const totalMembers = 10;

  console.log('\n=== Deployment Parameters ===');
  console.log('Monthly Contribution:', monthlyContribution / 1_000_000, 'ALGO');
  console.log('Commission:', commissionPercent, '%');
  console.log('Total Members:', totalMembers);

  // Get suggested params
  const params = await algodClient.getTransactionParams().do();

  // Create application with ABI method call
  const onComplete = algosdk.OnApplicationComplete.NoOpOC;

  // ABI encode the method call: createApplication(uint64,uint64,uint64)void
  const methodSelector = algosdk.ABIMethod.fromSignature('createApplication(uint64,uint64,uint64)void').getSelector();

  // Encode each argument individually as ABI uint64
  const uint64Type = algosdk.ABIType.from('uint64');

  const appArgs = [
    methodSelector,
    uint64Type.encode(monthlyContribution),
    uint64Type.encode(commissionPercent),
    uint64Type.encode(totalMembers),
  ];

  // Define schema
  const localInts = 0;
  const localBytes = 0;
  const globalInts = 6; // monthlyContribution, commissionPercent, totalMembers, currentMonth, chitValue, isActive
  const globalBytes = 1; // manager address

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
    appArgs,
  });

  // Sign and send transaction
  const signedTxn = txn.signTxn(deployerAccount.sk);
  const txId = txn.txID().toString();

  console.log('\nSending transaction...');
  console.log('Transaction ID:', txId);

  await algodClient.sendRawTransaction(signedTxn).do();

  // Wait for confirmation
  const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

  const appId = confirmedTxn['application-index'];
  console.log('\n=== Deployment Successful ===');
  console.log('Application ID:', appId);
  console.log('Application Address:', algosdk.getApplicationAddress(appId));
  console.log('\nTestNet Explorer:');
  console.log(`https://testnet.explorer.perawallet.app/application/${appId}`);
  console.log(`https://testnet.algoexplorer.io/application/${appId}`);

  console.log('\n=== Next Steps ===');
  console.log(`1. Update backend/.env with: APP_ID=${appId}`);
  console.log('2. Fund the app address if needed for inner transactions');
  console.log('3. Add members using the addMember method');
  console.log('4. Start the chit using the startChit method');

  return appId;
}

// Run deployment
deployToTestnet()
  .then((appId) => {
    console.log(`\nDeployment complete! App ID: ${appId}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });