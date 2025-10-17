import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import chitFundRoutes from './routes/chitFundRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chitfund', chitFundRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AlgoChit Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/chitfund/health',
      state: '/api/chitfund/state',
      addMember: 'POST /api/chitfund/members/add',
      start: 'POST /api/chitfund/start',
      contribute: 'POST /api/chitfund/contribute',
      bid: 'POST /api/chitfund/bid',
      distribute: 'POST /api/chitfund/distribute',
      memberDetails: 'GET /api/chitfund/members/:address',
      transactions: 'GET /api/chitfund/transactions',
      pause: 'POST /api/chitfund/pause',
      resume: 'POST /api/chitfund/resume',
    },
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`AlgoChit Backend running on port ${config.port}`);
  console.log(`App ID: ${config.appId || 'Not configured'}`);
  console.log(`Algod: ${config.algod.server}:${config.algod.port}`);
});
