import { Router, Request, Response } from 'express';
import { ChitFundService } from '../services/chitFundService.js';
import { getManagerAccount } from '../config.js';
import algosdk from 'algosdk';

const router = Router();
const chitFundService = new ChitFundService();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'AlgoChit Backend' });
});

// Get chit fund state
router.get('/state', async (req: Request, res: Response) => {
  try {
    const state = await chitFundService.getAppState();
    res.json({ success: true, state });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add member (manager only)
router.post('/members/add', async (req: Request, res: Response) => {
  try {
    const { memberAddress } = req.body;

    if (!memberAddress) {
      return res.status(400).json({ success: false, error: 'memberAddress is required' });
    }

    const managerAccount = getManagerAccount();
    const result = await chitFundService.addMember(managerAccount, memberAddress);

    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start chit fund (manager only)
router.post('/start', async (req: Request, res: Response) => {
  try {
    const managerAccount = getManagerAccount();
    const result = await chitFundService.startChit(managerAccount);

    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Make contribution
router.post('/contribute', async (req: Request, res: Response) => {
  try {
    const { mnemonic, amount } = req.body;

    if (!mnemonic || !amount) {
      return res.status(400).json({ success: false, error: 'mnemonic and amount are required' });
    }

    const userAccount = algosdk.mnemonicToSecretKey(mnemonic);
    const result = await chitFundService.contribute(userAccount, amount);

    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit bid
router.post('/bid', async (req: Request, res: Response) => {
  try {
    const { mnemonic, discountPercent } = req.body;

    if (!mnemonic || discountPercent === undefined) {
      return res.status(400).json({ success: false, error: 'mnemonic and discountPercent are required' });
    }

    const userAccount = algosdk.mnemonicToSecretKey(mnemonic);
    const result = await chitFundService.submitBid(userAccount, discountPercent);

    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Select winner and distribute (manager only)
router.post('/distribute', async (req: Request, res: Response) => {
  try {
    const { winnerAddress } = req.body;

    if (!winnerAddress) {
      return res.status(400).json({ success: false, error: 'winnerAddress is required' });
    }

    const managerAccount = getManagerAccount();
    const result = await chitFundService.selectWinnerAndDistribute(managerAccount, winnerAddress);

    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get member details
router.get('/members/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const member = await chitFundService.getMemberDetails(address);

    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    res.json({ success: true, member });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction history
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const transactions = await chitFundService.getTransactionHistory(limit);

    res.json({ success: true, transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pause chit fund (manager only)
router.post('/pause', async (req: Request, res: Response) => {
  try {
    const managerAccount = getManagerAccount();
    const result = await chitFundService.pauseChit(managerAccount);

    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resume chit fund (manager only)
router.post('/resume', async (req: Request, res: Response) => {
  try {
    const managerAccount = getManagerAccount();
    const result = await chitFundService.resumeChit(managerAccount);

    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
