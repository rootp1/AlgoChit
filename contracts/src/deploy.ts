import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
async function deploy() {
  const algodToken = 'a'.repeat(64);
  const algodServer = 'http://localhost';
  const algodPort = 4001;
  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
  const deployer = await algokit.getAccount({
    config: algokit.getAccountConfigFromEnvironment('DEPLOYER')
  }, algodClient);
  console.log('Deployer Address:', deployer.addr);
  const monthlyContribution = 10_000_000;
  const commissionPercent = 5;
  const totalMembers = 10;
  console.log('\nDeploying ChitFund Contract...');
  console.log('Monthly Contribution:', monthlyContribution / 1_000_000, 'ALGO');
  console.log('Manager Commission:', commissionPercent, '%');
  console.log('Total Members:', totalMembers);
  console.log('\nDeployment template ready!');
  console.log('Next steps:');
  console.log('1. Compile ChitFund.algo.ts to TEAL');
  console.log('2. Deploy using AlgoKit or goal');
  console.log('3. Note the Application ID');
}
deploy().catch(console.error);