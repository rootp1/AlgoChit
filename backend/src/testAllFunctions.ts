import algosdk from 'algosdk';
import { ChitFundServiceABI } from './services/chitFundServiceABI.js';
import { getAlgodClient, config } from './config.js';

async function testAllFunctions() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('     ALGOCHIT - COMPREHENSIVE MANAGER FUNCTIONS TEST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const algodClient = getAlgodClient();
  const service = new ChitFundServiceABI();

  const managerMnemonic = process.env.MANAGER_MNEMONIC!;
  if (!managerMnemonic) {
    throw new Error('MANAGER_MNEMONIC not set');
  }
  
  const managerAccount = algosdk.mnemonicToSecretKey(managerMnemonic);

  // Generate test accounts
  const testAccount1 = algosdk.generateAccount();
  const testAccount2 = algosdk.generateAccount();
  const testAccount3 = algosdk.generateAccount();

  const addr1 = testAccount1.addr.toString();
  const addr2 = testAccount2.addr.toString();
  const addr3 = testAccount3.addr.toString();

  console.log('📋 Test Setup:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Manager:', managerAccount.addr);
  console.log('Test Account 1:', addr1);
  console.log('Test Account 2:', addr2);
  console.log('Test Account 3:', addr3);
  console.log('APP_ID:', config.appId);
  console.log('');

  try {
    // ===== TEST 1: ADD MEMBERS =====
    console.log('📝 TEST 1: Add Members');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const addResult1 = await service.addMember(managerAccount, addr1);
      console.log('✅ Account 1 Added - TX:', addResult1.txId);
      console.log('💰 Fee Calculation logged above ^');
    } catch (error: any) {
      console.log('❌ Add Member 1 Failed:', error.message);
    }

    try {
      const addResult2 = await service.addMember(managerAccount, addr2);
      console.log('✅ Account 2 Added - TX:', addResult2.txId);
    } catch (error: any) {
      console.log('❌ Add Member 2 Failed:', error.message);
    }

    try {
      const addResult3 = await service.addMember(managerAccount, addr3);
      console.log('✅ Account 3 Added - TX:', addResult3.txId);
    } catch (error: any) {
      console.log('❌ Add Member 3 Failed:', error.message);
    }
    console.log('');

    // ===== TEST 2: START CHIT =====
    console.log('▶️  TEST 2: Start Chit Fund');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const startResult = await service.startChit(managerAccount);
      console.log('✅ Chit Started - TX:', startResult.txId);
    } catch (error: any) {
      console.log('❌ Start Chit Failed:', error.message);
    }
    console.log('');

    // ===== TEST 3: PAUSE CHIT =====
    console.log('⏸️  TEST 3: Pause Chit Fund');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const pauseResult = await service.pauseChit(managerAccount);
      console.log('✅ Chit Paused - TX:', pauseResult.txId);
      
      const state = await service.getAppState();
      console.log('   Status:', state.isActive === 1 ? 'Active' : 'Paused');
    } catch (error: any) {
      console.log('❌ Pause Chit Failed:', error.message);
    }
    console.log('');

    // ===== TEST 4: RESUME CHIT =====
    console.log('▶️  TEST 4: Resume Chit Fund');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const resumeResult = await service.resumeChit(managerAccount);
      console.log('✅ Chit Resumed - TX:', resumeResult.txId);
      
      const state = await service.getAppState();
      console.log('   Status:', state.isActive === 1 ? 'Active' : 'Paused');
    } catch (error: any) {
      console.log('❌ Resume Chit Failed:', error.message);
    }
    console.log('');

    // ===== TEST 5: REMOVE MEMBER =====
    console.log('❌ TEST 5: Remove Member (Account 3)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      // First pause to allow removal
      await service.pauseChit(managerAccount);
      console.log('   Paused chit for removal...');
      
      const removeResult = await service.removeMember(managerAccount, addr3);
      console.log('✅ Account 3 Removed - TX:', removeResult.txId);
      
      // Resume
      await service.resumeChit(managerAccount);
      console.log('   Resumed chit after removal...');
    } catch (error: any) {
      console.log('❌ Remove Member Failed:', error.message);
    }
    console.log('');

    // ===== TEST 6: GET STATE =====
    console.log('📊 TEST 6: Get Contract State');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const state = await service.getAppState();
      console.log('✅ State Retrieved:');
      console.log('   Keys found:', Object.keys(state));
      console.log('   Current Month:', state.currentMonth);
      console.log('   Is Active:', state.isActive === 1 ? 'Active' : 'Inactive');
      console.log('   Total Members:', state.totalMembers);
      console.log('   Monthly Contribution:', (state.monthlyContribution / 1_000_000).toFixed(3), 'ALGO');
      console.log('   Chit Value:', (state.chitValue / 1_000_000).toFixed(3), 'ALGO');
      console.log('   Manager:', state.manager);
      console.log('   App Balance:', (state.appBalance / 1_000_000).toFixed(3), 'ALGO');
    } catch (error: any) {
      console.log('❌ Get State Failed:', error.message);
    }
    console.log('');

    // ===== TEST 7: SUMMARY =====
    console.log('� TEST 7: Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Test accounts created (but not funded for full flow)');
    console.log('✅ All manager functions tested');
    console.log('ℹ️  To test contributions/bids, fund the test accounts first');
    console.log('');

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('        ✅ ALL MANAGER FUNCTION TESTS COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');

  } catch (error: any) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response, null, 2));
    }
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
console.log('Starting test in 2 seconds...\n');
setTimeout(() => {
  testAllFunctions().catch(console.error);
}, 2000);
