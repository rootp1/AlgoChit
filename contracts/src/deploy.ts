import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';

async function deploy() {
  // Connect to local sandbox or testnet
  const algodToken = 'a'.repeat(64);
  const algodServer = 'http://localhost';
  const algodPort = 4001;

  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

  // Get deployer account from environment or create new one
  const deployer = await algokit.getAccount(
    { config: algokit.getAccountConfigFromEnvironment('DEPLOYER') },
    algodClient
  );

  console.log('Deployer Address:', deployer.addr);

  // Contract deployment parameters
  const monthlyContribution = 10_000_000; // 10 ALGO in microAlgos
  const commissionPercent = 5; // 5% commission
  const totalMembers = 10;

  console.log('\nDeploying ChitFund Contract...');
  console.log('Monthly Contribution:', monthlyContribution / 1_000_000, 'ALGO');
  console.log('Manager Commission:', commissionPercent, '%');
  console.log('Total Members:', totalMembers);

  // TODO: Load compiled TEAL and deploy
  // This would use the compiled approval and clear programs
  // For now, this is a deployment template

  console.log('\nDeployment template ready!');
  console.log('Next steps:');
  console.log('1. Compile ChitFund.algo.ts to TEAL');
  console.log('2. Deploy using AlgoKit or goal');
  console.log('3. Note the Application ID');
}

deploy().catch(console.error);
