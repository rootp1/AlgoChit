import algosdk from 'algosdk';
import { ChitFundServiceABI } from './services/chitFundServiceABI.js';
import { getAlgodClient } from './config.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function testDistributePot() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           ALGOCHIT - DISTRIBUTE POT TEST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const algodClient = getAlgodClient();
  const service = new ChitFundServiceABI();

  const managerMnemonic = process.env.MANAGER_MNEMONIC!;
  if (!managerMnemonic) {
    throw new Error('MANAGER_MNEMONIC not set in environment');
  }
  
  const managerAccount = algosdk.mnemonicToSecretKey(managerMnemonic);

  try {
    // Get all members
    console.log('📋 Getting all members...');
    const members = await service.getAllMemberAddresses();
    console.log('Members:', members);
    console.log('');

    // Get all bids
    console.log('📋 Getting all bids...');
    const bids = await service.getBidsSortedByDiscount();
    console.log('Bids:', bids);
    console.log('');

    if (bids.length === 0) {
      console.log('❌ No bids found. Please submit bids first.');
      return;
    }

    // Test distribute pot by selecting highest bidder
    console.log('🎯 Testing Distribute Pot');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Winner:', bids[0].address);
    console.log('Discount:', bids[0].discountPercent, '%');
    console.log('Members for distribution:', members);
    console.log('');

    const result = await service.selectWinnerByMaxDiscount(managerAccount);
    console.log('✅ SUCCESS!');
    console.log('   Transaction ID:', result.txId);
    console.log('   Winner:', result.winnerAddress);
    console.log('   Discount:', result.discountPercent, '%');
    console.log('   View on Explorer: https://testnet.algoexplorer.io/tx/' + result.txId);
  } catch (error: any) {
    console.log('❌ FAILED:', error.message);
    if (error.response?.body) {
      console.error('Response body:', JSON.stringify(error.response.body, null, 2));
    }
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('        ✅ DISTRIBUTE POT TEST COMPLETED!');
  console.log('═══════════════════════════════════════════════════════════════');
}

// Run the test
console.log('Starting Distribute Pot test...\n');
testDistributePot().catch(console.error);
