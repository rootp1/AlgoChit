# AlgoChit - Blockchain-based Chit Fund Manager

A decentralized chit fund platform built on the Algorand blockchain, bringing transparency, security, and automation to traditional chit fund operations.

---

## 📚 Table of Contents

- [What is a Chit Fund?](#what-is-a-chit-fund)
- [AlgoChit Features](#algochit-features)
- [How AlgoChit Works](#how-algochit-works)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Smart Contract Overview](#smart-contract-overview)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 What is a Chit Fund?

A **chit fund** is a traditional rotating savings and credit association popular in many parts of the world, particularly in South Asia. Here's how it works:

### Traditional Chit Fund Concept

1. **Group Formation**: A group of people (e.g., 10-20 members) come together under a manager/organizer.

2. **Monthly Contributions**: Each member contributes a fixed amount every month (e.g., $100/month).

3. **Monthly Auction**: Each month, members bid by offering discounts on the total pot. The member willing to accept the lowest amount wins the auction.

4. **Distribution**: The winner receives the pot (minus discount) and the manager takes a commission from the discount amount.

5. **Rotation**: This continues for as many months as there are members, with each member winning once.

### Example Scenario

- **10 members**, each contributing **$100/month**
- **Total pot each month**: $1,000
- **Month 1**: Member A bids 20% discount → receives $800
- **Manager commission**: Takes 10% of the $200 discount = $20
- **Remaining discount**: $180 distributed among all members
- **Process repeats** for 10 months until everyone has received the pot

### Challenges in Traditional Chit Funds

- ❌ **Trust Issues**: Requires trust in the manager
- ❌ **Lack of Transparency**: Difficult to verify contributions and distributions
- ❌ **Manual Record-keeping**: Prone to errors and disputes
- ❌ **Risk of Fraud**: Centralized control can lead to mismanagement
- ❌ **No Automation**: All processes are manual

---

## ✨ AlgoChit Features

AlgoChit solves traditional chit fund problems by leveraging blockchain technology:

### Core Features

#### 🔐 **Trustless Operations**
- Smart contract enforces all rules automatically
- No need to trust a central authority
- Transparent execution on Algorand blockchain

#### 💰 **Automated Fund Management**
- Monthly contributions tracked on-chain
- Automatic pot calculation and distribution
- Commission distribution handled by smart contract

#### 🎫 **Transparent Bidding System**
- On-chain bid submissions
- Public bid history
- Fair winner selection by manager with verifiable bids

#### 👥 **Member Management**
- Add/remove members before chit starts
- Track contribution history for each member
- Verify member eligibility for pot distribution

#### 📊 **Real-time Dashboard**
- View current chit fund status
- Track monthly contributions
- Monitor member participation
- View total chit value and current month

#### 🔄 **Lifecycle Management**
- Start chit fund when all members are ready
- Automatic month progression after distribution
- Pause/resume functionality for manager
- Automatic completion after all members receive pot

#### 🛡️ **Security & Immutability**
- All transactions recorded on Algorand blockchain
- Immutable contribution and distribution history
- Member data stored in smart contract boxes
- Protection against double-spending and fraud

---

## 🔧 How AlgoChit Works

### 1. **Setup Phase**

```
Manager deploys smart contract
    ↓
Sets monthly contribution amount
    ↓
Sets manager commission percentage
    ↓
Defines total number of members
    ↓
Adds member addresses
```

### 2. **Active Phase (Monthly Cycle)**

```
Month starts
    ↓
Members contribute monthly amount
    ↓
Members submit discount bids
    ↓
Manager selects winner with highest discount
    ↓
Smart contract distributes:
  - Pot to winner (total - discount)
  - Commission to manager
    ↓
Month increments
    ↓
Repeat until all members have won
```

### 3. **Technical Flow**

#### Member Contribution
1. Member initiates payment transaction to contract
2. Member calls `contribute()` method
3. Contract verifies payment amount
4. Updates member's contribution record
5. Marks member as eligible to bid

#### Bid Submission
1. Member calls `submitBid(discountPercent)`
2. Contract verifies:
   - Member has contributed this month
   - Member hasn't received pot yet
   - Discount is ≤ 30%
3. Stores bid in contract storage

#### Winner Selection & Distribution
1. Manager calls `selectWinnerAndDistribute(winnerAddress)`
2. Contract calculates:
   - Discount amount = Total pot × Discount%
   - Commission = Discount × Commission%
   - Winner receives = Total pot - Discount
3. Transfers funds automatically
4. Marks winner as having received pot
5. Clears all bids
6. Increments month counter

---

## 🛠️ Technology Stack

### Smart Contract
- **Algorand TEALScript**: Smart contract development
- **AlgoKit**: Development framework and tooling
- **Algorand SDK**: Blockchain interaction

### Backend
- **Node.js**: Runtime environment
- **Express.js**: REST API framework
- **TypeScript**: Type-safe development
- **Algosdk**: Algorand JavaScript SDK

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **TailwindCSS**: Styling framework
- **@txnlab/use-wallet-react**: Wallet integration

### DevOps
- **LocalNet**: Local Algorand network for development
- **AlgoKit**: CLI tools for deployment

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher): [Download](https://nodejs.org/)
- **npm** or **pnpm**: Package manager
- **Git**: Version control
- **AlgoKit** (optional): For contract deployment
  ```bash
  brew install algorandfoundation/tap/algokit  # macOS
  # or
  pipx install algokit  # Python pipx
  ```
- **Docker** (optional): For running LocalNet
  ```bash
  # Install Docker Desktop from https://www.docker.com/products/docker-desktop
  ```

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/AlgoChit.git
cd AlgoChit
```

### 2. Install All Dependencies

```bash
# Install dependencies for all packages (root, contracts, backend, frontend)
npm run install:all
```

Or install individually:

```bash
# Root dependencies
npm install

# Smart contract dependencies
cd contracts
npm install
cd ..

# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Set Up Local Algorand Network (Optional)

If you want to test locally:

```bash
# Start LocalNet using AlgoKit
algokit localnet start

# Check status
algokit localnet status
```

Alternatively, use Algorand TestNet for testing.

### 4. Configure Environment Variables

#### Backend Configuration

Create `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Server Configuration
PORT=3001

# Algorand Node Configuration
ALGOD_SERVER=http://localhost
ALGOD_PORT=4001
ALGOD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

# Algorand Indexer Configuration
INDEXER_SERVER=http://localhost
INDEXER_PORT=8980
INDEXER_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

# Smart Contract
APP_ID=<YOUR_APP_ID_AFTER_DEPLOYMENT>

# Manager Account (25-word mnemonic)
MANAGER_MNEMONIC="your twenty five word mnemonic phrase goes here from algorand wallet account"
```

**Note**: For TestNet, use:
```env
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_PORT=443
ALGOD_TOKEN=
INDEXER_SERVER=https://testnet-idx.algonode.cloud
INDEXER_PORT=443
INDEXER_TOKEN=
```

### 5. Deploy Smart Contract

```bash
cd contracts

# Build the contract
npm run build

# Deploy to LocalNet or TestNet
npm run deploy

# Note the APP_ID from deployment output
# Update backend/.env with the APP_ID
```

---

## 🏃 Running the Application

### Development Mode

You can run all services simultaneously or individually:

#### Option 1: Run All Services

```bash
# Terminal 1 - Backend
npm run backend:dev

# Terminal 2 - Frontend
npm run frontend:dev
```

#### Option 2: Run Individually

**Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

**Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Base URL**: http://localhost:3001/api/chitfund

---

## 📁 Project Structure

```
AlgoChit/
├── contracts/              # Smart contract code
│   ├── src/
│   │   ├── ChitFund.algo.ts      # Main smart contract
│   │   └── deploy.ts             # Deployment scripts
│   └── artifacts/          # Compiled TEAL files and ABI
│
├── backend/               # Express.js backend
│   ├── src/
│   │   ├── index.ts              # Server entry point
│   │   ├── config.ts             # Algorand client config
│   │   ├── routes/
│   │   │   └── chitFundRoutes.ts # API routes
│   │   └── services/
│   │       └── chitFundService.ts # Contract interaction logic
│   └── package.json
│
├── frontend/              # React frontend
│   ├── src/
│   │   ├── App.tsx               # Main app component
│   │   ├── components/
│   │   │   ├── Dashboard.tsx     # Status dashboard
│   │   │   ├── ContributeForm.tsx # Contribution UI
│   │   │   ├── BidForm.tsx       # Bidding UI
│   │   │   ├── ManagerPanel.tsx  # Admin panel
│   │   │   └── ConnectWallet.tsx # Wallet connection
│   │   └── services/
│   │       └── api.ts            # API client
│   └── package.json
│
├── scripts/               # Utility scripts
├── package.json          # Root package.json
└── README.md             # This file
```

---

## 🔗 Smart Contract Overview

### Contract State

**Global State:**
- `manager`: Address of the chit fund manager
- `monthlyContribution`: Fixed contribution amount per member
- `managerCommissionPercent`: Manager's commission on discount
- `totalMembers`: Total number of participants
- `currentMonth`: Current month in the cycle
- `chitValue`: Total pot value (monthly contribution × total members)
- `isActive`: Whether the chit fund is currently active

**Box Storage:**
- `members`: Map of member addresses to member data
  - `address`: Member's Algorand address
  - `contributed`: Total amount contributed
  - `hasReceivedPot`: Whether member has received pot
  - `lastContributionMonth`: Last month they contributed
- `currentBids`: Map of active bids for current month
  - `bidder`: Bidder's address
  - `discountPercentage`: Offered discount (0-30%)
  - `timestamp`: Bid submission time

### Key Methods

| Method | Description | Caller |
|--------|-------------|--------|
| `createApplication` | Initialize chit fund with parameters | Manager |
| `addMember` | Add member before chit starts | Manager |
| `removeMember` | Remove member before chit starts | Manager |
| `startChit` | Activate the chit fund | Manager |
| `contribute` | Submit monthly contribution | Member |
| `submitBid` | Submit discount bid for current month | Member |
| `selectWinnerAndDistribute` | Select winner and distribute pot | Manager |
| `pauseChit` | Pause the chit fund | Manager |
| `resumeChit` | Resume the chit fund | Manager |
| `getMemberDetails` | Query member information | Anyone |
| `getCurrentMonth` | Get current month | Anyone |
| `getChitStatus` | Check if chit is active | Anyone |

---

## 📡 API Documentation

### Base URL
```
http://localhost:3001/api/chitfund
```

### Endpoints

#### Get Chit Fund Status
```http
GET /status
```

**Response:**
```json
{
  "currentMonth": 3,
  "totalMembers": 10,
  "monthlyContribution": 100000000,
  "chitValue": 1000000000,
  "isActive": true
}
```

#### Get Member Details
```http
GET /member/:address
```

#### Add Member
```http
POST /member/add
Content-Type: application/json

{
  "memberAddress": "ALGORAND_ADDRESS"
}
```

#### Contribute
```http
POST /contribute
Content-Type: application/json

{
  "memberAddress": "ALGORAND_ADDRESS"
}
```

#### Submit Bid
```http
POST /bid
Content-Type: application/json

{
  "memberAddress": "ALGORAND_ADDRESS",
  "discountPercent": 15
}
```

#### Distribute Pot
```http
POST /distribute
Content-Type: application/json

{
  "winnerAddress": "ALGORAND_ADDRESS"
}
```

---

## 🎮 Usage Guide

### For Members

1. **Connect Wallet**: Click "Connect Wallet" and choose your Algorand wallet
2. **View Dashboard**: See current chit status and your contribution history
3. **Contribute Monthly**: Navigate to "Contribute" tab and submit your monthly amount
4. **Submit Bid**: After contributing, go to "Submit Bid" tab and enter your discount percentage
5. **Receive Pot**: If you win, funds are automatically transferred to your wallet

### For Managers

1. **Deploy Contract**: Deploy the smart contract with initial parameters
2. **Add Members**: Use Manager Panel to add member addresses
3. **Start Chit**: Once all members are added, start the chit fund
4. **Select Winners**: Each month, review bids and select the winner with highest discount
5. **Monitor**: Track contributions and ensure smooth operation

---

## 🧪 Testing

### Run Smart Contract Tests

```bash
cd contracts
npm test
```

### Run Backend Tests

```bash
cd backend
npm test
```

### Run Frontend Tests

```bash
cd frontend
npm test
```

---

## 🔒 Security Considerations

- ✅ All financial transactions are on-chain and verifiable
- ✅ Smart contract enforces business rules automatically
- ✅ Manager cannot directly access member funds
- ✅ Each member can only contribute/bid once per month
- ✅ Discount percentage capped at 30% to prevent manipulation
- ✅ Winner must have valid bid and contribution
- ⚠️ Manager must be trusted for winner selection (future: automated auction)
- ⚠️ Ensure proper key management for manager account
- ⚠️ Review smart contract before deploying to MainNet

---

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic chit fund smart contract
- ✅ Manager-controlled operations
- ✅ Member contribution tracking
- ✅ Manual winner selection

### Phase 2 (In Progress)
- 🔄 Wallet integration (Pera Wallet, Defly)
- 🔄 Automated winner selection based on bids
- 🔄 Transaction history viewer

### Phase 3 (Planned)
- 📋 Multi-chit fund management
- 📋 Member voting mechanism
- 📋 Dynamic member addition mid-cycle
- 📋 Oracle integration for fiat conversions
- 📋 Mobile app

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built on [Algorand](https://www.algorand.com/) blockchain
- Developed with [AlgoKit](https://github.com/algorandfoundation/algokit-cli)
- Inspired by traditional chit fund systems

---

## 📞 Support

For questions, issues, or suggestions:

- 🐛 Open an issue on GitHub
- 📧 Email: support@algochit.com
- 💬 Discord: [AlgoChit Community]

---

## ⚖️ Disclaimer

AlgoChit is a decentralized application for educational and experimental purposes. Users should:
- Understand blockchain technology and smart contracts
- Be aware of the risks involved in cryptocurrency transactions
- Comply with local regulations regarding chit funds and financial instruments
- Never invest more than they can afford to lose
- Conduct their own due diligence before participating

The developers are not responsible for any financial losses incurred through the use of this platform.

---

**Built with ❤️ on Algorand**
