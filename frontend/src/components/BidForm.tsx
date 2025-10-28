import { useState } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { useSnackbar } from 'notistack';
import { api } from '../services/api';
export default function BidForm() {
  const {
    activeAddress,
    transactionSigner
  } = useWallet();
  const {
    enqueueSnackbar
  } = useSnackbar();
  const [discountPercent, setDiscountPercent] = useState('5');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAddress) {
      enqueueSnackbar('Please connect your wallet first', {
        variant: 'warning'
      });
      return;
    }
    setLoading(true);
    try {
      await api.submitBid(activeAddress, transactionSigner, parseFloat(discountPercent));
      enqueueSnackbar('Bid submitted successfully!', {
        variant: 'success'
      });
      setDiscountPercent('5');
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Failed to submit bid', {
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="card p-6">
      <h2 className="text-xl font-medium text-white mb-2">Submit Bid</h2>
      <p className="text-sm text-accent-300 mb-6">
        Bid with the discount percentage you're willing to accept. Lower bids have better chance of winning.
      </p>

      {!activeAddress && <div className="mb-6 p-4 bg-accent-900 border border-accent-600 rounded-lg">
          <p className="text-sm text-accent-200">
            Please connect your wallet to submit a bid
          </p>
        </div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-accent-200 mb-2">
            Discount Percentage (Max 30%)
          </label>
          <input type="number" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} className="w-full px-4 py-2.5 bg-accent-900 border border-accent-600 rounded-lg focus:ring-2 focus:ring-white focus:border-white transition text-white placeholder-accent-500" step="0.1" min="0" max="30" required disabled={!activeAddress} />
          <p className="mt-2 text-xs text-accent-400">
            Lower discount = higher chance to win
          </p>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading || !activeAddress} className="btn-primary px-5 py-2">
            {loading ? 'Submitting...' : 'Submit Bid'}
          </button>
        </div>
      </form>
    </div>;
}