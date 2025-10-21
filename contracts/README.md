# AlgoChit Smart Contract

Algorand smart contract for decentralized chit fund management.

## Overview

The ChitFund smart contract manages the entire lifecycle of a chit fund:
- Member registration
- Monthly contributions
- Auction bidding
- Pot distribution
- Manager commission

## Contract Structure

### Global State
- `manager` - Manager address
- `monthlyContribution` - Fixed monthly amount
- `managerCommissionPercent` - Commission rate
- `totalMembers` - Number of participants
- `currentMonth` - Current cycle month
- `chitValue` - Total pot value
- `isActive` - Active status

### Box Storage
- Members data (per address)
- Current month bids (per address)

## Methods

### createApplication
Initialize the chit fund with parameters.

### addMember
Register a new participant (manager only).

### startChit
Activate the chit fund cycle (manager only).

### contribute
Member submits monthly payment.

### submitBid
Member bids with discount percentage (0-30%).

### selectWinnerAndDistribute
Manager selects winner and triggers distribution.

### pauseChit / resumeChit
Emergency controls (manager only).

## Compilation

```bash
npm install
npm run build
```

## Deployment

See `deploy.ts` for deployment script.

Requires:
- Algorand sandbox running
- Funded deployer account
- AlgoKit CLI

## Testing

Test on local sandbox before deploying to TestNet/MainNet.
