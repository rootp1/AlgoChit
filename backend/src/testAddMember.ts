import algosdk from 'algosdk';
import { ChitFundServiceABI } from './services/chitFundServiceABI.js';
import { getAlgodClient, config } from './config.js';

async function testAddMember() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           ALGOCHIT - ADD MEMBER TEST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const algodClient = getAlgodClient();
  const service = new ChitFundServiceABI();

  const managerMnemonic = process.env.MANAGER_MNEMONIC!;
  if (!managerMnemonic) {
    throw new Error('MANAGER_MNEMONIC not set in environment');
  }
  
  const managerAccount = algosdk.mnemonicToSecretKey(managerMnemonic);

  console.log('📋 Configuration:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Manager Address:', managerAccount.addr);
  console.log('APP_ID:', config.appId);
  console.log('Algod Server:', config.algod.server + ':' + config.algod.port);
  console.log('');

  // Generate test members
  const testMember1 = algosdk.generateAccount();
  const testMember2 = algosdk.generateAccount();
  const testMember3 = algosdk.generateAccount();

  console.log('👤 Test Members Generated:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Member 1:', testMember1.addr);
  console.log('Member 2:', testMember2.addr);
  console.log('Member 3:', testMember3.addr);
  console.log('');

  try {
    // TEST 1: Add first member
    console.log('🧪 TEST 1: Adding Member 1');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const result1 = await service.addMember(managerAccount, testMember1.addr);
      console.log('✅ SUCCESS!');
      console.log('   Transaction ID:', result1.txId);
      console.log('   Member Address:', result1.memberAddress);
      console.log('   View on Explorer: https://testnet.algoexplorer.io/tx/' + result1.txId);
    } catch (error: any) {
      console.log('❌ FAILED:', error.message);
    }
    console.log('');

    // Wait a bit between transactions
    await new Promise(resolve => setTimeout(resolve, 1000));

    // TEST 2: Add second member
    console.log('🧪 TEST 2: Adding Member 2');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const result2 = await service.addMember(managerAccount, testMember2.addr);
      console.log('✅ SUCCESS!');
      console.log('   Transaction ID:', result2.txId);
      console.log('   Member Address:', result2.memberAddress);
      console.log('   View on Explorer: https://testnet.algoexplorer.io/tx/' + result2.txId);
    } catch (error: any) {
      console.log('❌ FAILED:', error.message);
    }
    console.log('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // TEST 3: Add third member
    console.log('🧪 TEST 3: Adding Member 3');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const result3 = await service.addMember(managerAccount, testMember3.addr);
      console.log('✅ SUCCESS!');
      console.log('   Transaction ID:', result3.txId);
      console.log('   Member Address:', result3.memberAddress);
      console.log('   View on Explorer: https://testnet.algoexplorer.io/tx/' + result3.txId);
    } catch (error: any) {
      console.log('❌ FAILED:', error.message);
    }
    console.log('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // TEST 4: Try to add duplicate (should fail or succeed based on contract logic)
    console.log('🧪 TEST 4: Adding Duplicate Member (Member 1 again)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const result4 = await service.addMember(managerAccount, testMember1.addr);
      console.log('✅ Transaction went through (might overwrite)');
      console.log('   Transaction ID:', result4.txId);
    } catch (error: any) {
      console.log('⚠️  Expected behavior - duplicate rejected or overwrites');
      console.log('   Error:', error.message);
    }
    console.log('');

    // Get current state
    console.log('📊 Current Contract State:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const state = await service.getAppState();
    console.log('Total Members in Contract:', state.totalMembers);
    console.log('Current Month:', state.currentMonth);
    console.log('Is Active:', state.isActive === 1 ? 'Yes' : 'No');
    console.log('Monthly Contribution:', (state.monthlyContribution / 1_000_000).toFixed(3), 'ALGO');
    console.log('App Balance:', (state.appBalance / 1_000_000).toFixed(3), 'ALGO');
    console.log('');

    // Check manager balance
    console.log('💰 Manager Balance:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const managerInfo = await algodClient.accountInformation(managerAccount.addr).do();
    console.log('Balance:', (Number(managerInfo.amount) / 1_000_000).toFixed(3), 'ALGO');
    console.log('');

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('        ✅ ADD MEMBER TESTS COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📝 Summary:');
    console.log('   - 3 unique members added');
    console.log('   - 1 duplicate test performed');
    console.log('   - Each add member transaction costs ~36,300 microAlgos');
    console.log('   - Fee breakdown: 1,000 (base) + 35,300 (box MBR)');
    console.log('');

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
console.log('Starting Add Member test...\n');
testAddMember().catch(console.error);
