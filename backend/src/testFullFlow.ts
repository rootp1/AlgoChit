import algosdk from 'algosdk';
import { ChitFundServiceABI } from './services/chitFundServiceABI.js';
import { getAlgodClient, config } from './config.js';

// Test account mnemonics (from user)
const MNEMONIC_1 = "occur miss cable middle champion goat bachelor cloth drift salute slender happy roof opera kitchen auto crouch chat scrap kangaroo liar capital column able quit";
const MNEMONIC_2 = "water phone forest phone toddler other thumb mention police diamond crouch crack execute hole crawl window dirt noble scrap canvas rescue cement leisure abandon print";

async function runFullTest() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('        ALGOCHIT - COMPLETE FLOW TEST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const algodClient = getAlgodClient();
  const service = new ChitFundServiceABI();

  // Restore accounts from mnemonics
  const account1 = algosdk.mnemonicToSecretKey(MNEMONIC_1);
  const account2 = algosdk.mnemonicToSecretKey(MNEMONIC_2);
  const managerMnemonic = process.env.MANAGER_MNEMONIC!;
  const managerAccount = algosdk.mnemonicToSecretKey(managerMnemonic);

  const addr1 = account1.addr.toString();
  const addr2 = account2.addr.toString();

  console.log('📋 Account Information:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Account 1:', addr1);
  console.log('Account 2:', addr2);
  console.log('Manager:', managerAccount.addr);
  console.log('APP_ID:', config.appId);
  console.log('');

  // Check balances
  console.log('💰 Initial Balances:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const bal1Initial = await algodClient.accountInformation(addr1).do();
  const bal2Initial = await algodClient.accountInformation(addr2).do();
  console.log('Account 1:', (Number(bal1Initial.amount) / 1_000_000).toFixed(3), 'ALGO');
  console.log('Account 2:', (Number(bal2Initial.amount) / 1_000_000).toFixed(3), 'ALGO');
  console.log('');

  try {
    // Step 1: Add members
    console.log('📝 Step 1: Adding Members');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const addResult1 = await service.addMember(managerAccount, addr1);
    console.log('✅ Account 1 Added - TX:', addResult1.txId);
    
    const addResult2 = await service.addMember(managerAccount, addr2);
    console.log('✅ Account 2 Added - TX:', addResult2.txId);
    console.log('');

    // Step 2: Start chit fund
    console.log('▶️  Step 2: Starting Chit Fund');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const startResult = await service.startChit(managerAccount);
    console.log('✅ Chit Started - TX:', startResult.txId);
    console.log('');

    // Step 3: Contribute
    console.log('💸 Step 3: Members Contributing');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      // Configuration
  const appId = Number(process.env.APP_ID);
  const contributionAmount = 100_000; // 0.1 ALGO (must match contract's monthlyContribution)

    const contributeResult1 = await service.contribute(account1, contributionAmount);
    console.log('✅ Account 1 Contributed 0.1 ALGO - TX:', contributeResult1.txId);

    const contributeResult2 = await service.contribute(account2, contributionAmount);
    console.log('✅ Account 2 Contributed 0.1 ALGO - TX:', contributeResult2.txId);
    console.log('');

    // Check contract balance
    const appAddress = algosdk.getApplicationAddress(config.appId);
    const appInfo = await algodClient.accountInformation(appAddress).do();
    console.log('📊 Contract Balance:', (Number(appInfo.amount) / 1_000_000).toFixed(3), 'ALGO');
    console.log('');

    // Step 4: Submit bids
    console.log('🎯 Step 4: Submitting Bids');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const bidResult1 = await service.submitBid(account1, 5); // 5% discount
    console.log('✅ Account 1 Bid: 5% discount - TX:', bidResult1.txId);

    const bidResult2 = await service.submitBid(account2, 10); // 10% discount
    console.log('✅ Account 2 Bid: 10% discount - TX:', bidResult2.txId);
    console.log('');

    // Step 5: Get bids
    console.log('📋 Step 5: Checking Bids');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const bids = await service.getBidsSortedByDiscount(10);
    console.log('Bids received:', bids.length);
    bids.forEach((bid, idx) => {
      console.log(`  ${idx + 1}. ${bid.address} - ${bid.discountPercent}% discount`);
    });
    console.log('');

    // Step 6: Select winner and distribute
    console.log('🏆 Step 6: Selecting Winner and Distributing Pot');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const memberAddresses = [addr1, addr2];
    const winner = bids[0]; // Highest bidder
    
    console.log('Winner:', winner.address);
    console.log('Discount:', winner.discountPercent + '%');
    console.log('');

    const distributeResult = await service.selectWinnerAndDistribute(
      managerAccount,
      winner.address,
      winner.discountPercent,
      memberAddresses
    );
    console.log('✅ Pot Distributed - TX:', distributeResult.txId);
    console.log('');

    // Step 7: Check final balances
    console.log('💰 Final Balances:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const bal1Final = await algodClient.accountInformation(addr1).do();
    const bal2Final = await algodClient.accountInformation(addr2).do();
    const appInfoFinal = await algodClient.accountInformation(appAddress).do();

    console.log('Account 1:', (Number(bal1Final.amount) / 1_000_000).toFixed(3), 'ALGO',
      `(${Number(bal1Final.amount) - Number(bal1Initial.amount) > 0 ? '+' : ''}${((Number(bal1Final.amount) - Number(bal1Initial.amount)) / 1_000_000).toFixed(3)})`);
    console.log('Account 2:', (Number(bal2Final.amount) / 1_000_000).toFixed(3), 'ALGO',
      `(${Number(bal2Final.amount) - Number(bal2Initial.amount) > 0 ? '+' : ''}${((Number(bal2Final.amount) - Number(bal2Initial.amount)) / 1_000_000).toFixed(3)})`);
    console.log('Contract:', (Number(appInfoFinal.amount) / 1_000_000).toFixed(3), 'ALGO');
    console.log('');

    // Step 8: Get final state
    console.log('📊 Final Contract State:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const state = await service.getAppState();
    console.log('Current Month:', state.currentMonth);
    console.log('Is Active:', state.isActive === 1 ? 'Yes' : 'No');
    console.log('Total Members:', state.totalMembers);
    console.log('');

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('        ✅ ALL TESTS COMPLETED SUCCESSFULLY! ');
    console.log('═══════════════════════════════════════════════════════════════');

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    throw error;
  }
}

runFullTest().catch(console.error);
