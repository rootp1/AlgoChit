
import algosdk from 'algosdk';

async function testContract() {
  const appId = parseInt(process.env.APP_ID || '0');
  const mnemonic = process.env.MANAGER_MNEMONIC || '';

  const algodClient = new algosdk.Algodv2(
    '',
    'https://testnet-api.algonode.cloud',
    443
  );

  const managerAccount = algosdk.mnemonicToSecretKey(mnemonic);

  // Generate test member
  const memberAccount = algosdk.generateAccount();
  console.log('Test Member Address:', memberAccount.addr);
  console.log('Test Member Mnemonic:', algosdk.secretKeyToMnemonic(memberAccount.sk));

  // Fund member from dispenser
  console.log('\nFund this address from: https://bank.testnet.algorand.network/');
  console.log('Address:', memberAccount.addr);

  // Wait for user to fund
  console.log('\nPress Enter after funding the account...');
  await new Promise((resolve) => process.stdin.once('data', resolve));

  // Add member to chit fund
  const params = await algodClient.getTransactionParams().do();

  const appArgs = [
    new Uint8Array(Buffer.from('addMember')),
    algosdk.decodeAddress(memberAccount.addr).publicKey,
  ];

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: managerAccount.addr,
    appIndex: appId,
    appArgs,
    suggestedParams: params,
  });

  const signedTxn = txn.signTxn(managerAccount.sk);
  const txId = txn.txID().toString();

  await algodClient.sendRawTransaction(signedTxn).do();
  await algosdk.waitForConfirmation(algodClient, txId, 4);

  console.log('\nMember added successfully!');
  console.log('Transaction ID:', txId);
}

testContract().catch(console.error);

