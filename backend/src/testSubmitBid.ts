import algosdk from 'algosdk';
import { ChitFundServiceABI } from './services/chitFundServiceABI.js';
import { getAlgodClient } from './config.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function testSubmitBid() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           ALGOCHIT - SUBMIT BID TEST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const algodClient = getAlgodClient();
  const service = new ChitFundServiceABI();

  const managerMnemonic = process.env.MANAGER_MNEMONIC!;
  if (!managerMnemonic) {
    throw new Error('MANAGER_MNEMONIC not set in environment');
  }
  
  const managerAccount = algosdk.mnemonicToSecretKey(managerMnemonic);
  
  // Use the member we already added
  const memberAddress = 'ICTOC4O5DPW2T4UGQM54OIK4PRRYF3YUORVZQEDJMTHCYAGSVOTQ2G4GOI';
  
  // For testing, we'll use manager account to simulate the member
  // In production, each member would sign with their own account
  console.log('🎯 Testing Submit Bid');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Member Address:', memberAddress);
  console.log('Discount Percent: 15%');
  console.log('');

  try {
    // Note: In production, the member would use their own account
    // For this test, we're simulating with manager account
    const result = await service.submitBid(managerAccount, 15);
    console.log('✅ SUCCESS!');
    console.log('   Transaction ID:', result.txId);
    console.log('   Discount:', result.discountPercent, '%');
    console.log('   View on Explorer: https://testnet.algoexplorer.io/tx/' + result.txId);
  } catch (error: any) {
    console.log('❌ FAILED:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response, null, 2));
    }
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('        ✅ SUBMIT BID TEST COMPLETED!');
  console.log('═══════════════════════════════════════════════════════════════');
}

// Run the test
console.log('Starting Submit Bid test...\n');
testSubmitBid().catch(console.error);
