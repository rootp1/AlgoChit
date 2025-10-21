# AlgoChit Backend

REST API server for AlgoChit smart contract interaction.

## Overview

Express.js server that provides HTTP endpoints for:
- Smart contract method calls
- State queries
- Transaction submission
- Member management

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## Configuration

Create `.env` file:

```
PORT=3000
ALGOD_SERVER=http://localhost
ALGOD_PORT=4001
ALGOD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
INDEXER_SERVER=http://localhost
INDEXER_PORT=8980
INDEXER_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
APP_ID=<YOUR_APP_ID>
MANAGER_MNEMONIC="your 25-word mnemonic"
```

## API Endpoints

See `../API_REFERENCE.md` for complete API documentation.

Base URL: `http://localhost:3000/api/chitfund`

## Development

```bash
# Run with hot-reload
npm run dev

# Build
npm run build

# Production
npm start
```

## Services

### ChitFundService
Handles all smart contract interactions:
- Transaction construction
- Signing and submission
- State queries

### Config
Manages Algod and Indexer client connections.

## Security

**Production checklist**:
- [ ] Use environment variables for secrets
- [ ] Implement authentication (JWT)
- [ ] Add rate limiting
- [ ] Enable HTTPS
- [ ] Validate all inputs
- [ ] Add request logging
- [ ] Implement CORS properly
