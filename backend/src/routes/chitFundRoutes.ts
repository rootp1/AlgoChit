import { Router, Request, Response } from 'express';
import { ChitFundServiceABI } from '../services/chitFundServiceABI.js';
import { getManagerAccount } from '../config.js';
import algosdk from 'algosdk';
const router = Router();
const chitFundService = new ChitFundServiceABI();
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'AlgoChit Backend'
  });
});
router.get('/state', async (req: Request, res: Response) => {
  try {
    const state = await chitFundService.getAppState();
    res.json({
      success: true,
      state
    });
  } catch (error: any) {
    console.error('Error getting state:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.post('/members/add', async (req: Request, res: Response) => {
  try {
    const {
      memberAddress
    } = req.body;
    if (!memberAddress) {
      return res.status(400).json({
        success: false,
        error: 'memberAddress is required'
      });
    }
    const managerAccount = getManagerAccount();
    const result = await chitFundService.addMember(managerAccount, memberAddress);
    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.post('/members/remove', async (req: Request, res: Response) => {
  try {
    const {
      memberAddress
    } = req.body;
    if (!memberAddress) {
      return res.status(400).json({
        success: false,
        error: 'memberAddress is required'
      });
    }
    const managerAccount = getManagerAccount();
    const result = await chitFundService.removeMember(managerAccount, memberAddress);
    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.post('/start', async (req: Request, res: Response) => {
  try {
    const managerAccount = getManagerAccount();
    const result = await chitFundService.startChit(managerAccount);
    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.post('/contribute', async (req: Request, res: Response) => {
  try {
    const {
      signedTxns
    } = req.body;
    if (!signedTxns || !Array.isArray(signedTxns)) {
      return res.status(400).json({
        success: false,
        error: 'signedTxns array is required'
      });
    }
    const signedTxnsUint8 = signedTxns.map((txn: number[]) => new Uint8Array(txn));
    const result = await chitFundService.submitSignedTransactions(signedTxnsUint8);
    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.post('/bid', async (req: Request, res: Response) => {
  try {
    const {
      signedTxn,
      discountPercent
    } = req.body;
    if (!signedTxn || !Array.isArray(signedTxn)) {
      return res.status(400).json({
        success: false,
        error: 'signedTxn is required'
      });
    }
    const signedTxnUint8 = new Uint8Array(signedTxn);
    const result = await chitFundService.submitSignedTransaction(signedTxnUint8);
    res.json({
      success: true,
      result: {
        ...result,
        discountPercent
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.post('/distribute', async (req: Request, res: Response) => {
  try {
    const {
      winnerAddress,
      discountPercent
    } = req.body;
    if (!winnerAddress) {
      return res.status(400).json({
        success: false,
        error: 'winnerAddress is required'
      });
    }
    const discount = discountPercent !== undefined ? parseInt(discountPercent) : 0;
    const managerAccount = getManagerAccount();
    const result = await chitFundService.selectWinnerAndDistribute(managerAccount, winnerAddress, discount);
    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Auto-select winner by maximum discount and distribute (manager only)
router.post('/distribute/auto', async (req: Request, res: Response) => {
  try {
    const managerAccount = getManagerAccount();
    const result = await chitFundService.selectWinnerByMaxDiscount(managerAccount);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List bids sorted by discount desc
router.get('/bids', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit)) : 100;
    const bids = await chitFundService.getBidsSortedByDiscount(limit);
    res.json({ success: true, bids });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get('/members/:address', async (req: Request, res: Response) => {
  try {
    const {
      address
    } = req.params;
    const member = await chitFundService.getMemberDetails(address);
    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }
    res.json({
      success: true,
      member
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const transactions = await chitFundService.getTransactionHistory(limit);
    res.json({
      success: true,
      transactions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.post('/pause', async (req: Request, res: Response) => {
  try {
    const managerAccount = getManagerAccount();
    const result = await chitFundService.pauseChit(managerAccount);
    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.post('/resume', async (req: Request, res: Response) => {
  try {
    const managerAccount = getManagerAccount();
    const result = await chitFundService.resumeChit(managerAccount);
    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.post('/members/update-total', async (req: Request, res: Response) => {
  try {
    const { newTotal } = req.body;
    if (!newTotal || typeof newTotal !== 'number' || newTotal <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid newTotal (number > 0) is required'
      });
    }
    const managerAccount = getManagerAccount();
    const result = await chitFundService.updateTotalMembers(managerAccount, newTotal);
    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
export default router;