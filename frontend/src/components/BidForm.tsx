import { useState } from 'react';
import { api } from '../services/api';

export default function BidForm() {
  const [mnemonic, setMnemonic] = useState('');
  const [discountPercent, setDiscountPercent] = useState('5');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await api.submitBid(mnemonic, parseFloat(discountPercent));
      setResult(response);

      if (response.success) {
        setMnemonic('');
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Submit Bid</h2>
      <p className="text-sm text-gray-600 mb-4">
        Bid with the discount percentage you're willing to accept. Lower bids have better chance of winning.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Mnemonic (25-word phrase)
          </label>
          <textarea
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            placeholder="Enter your 25-word mnemonic phrase"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Percentage (Max 30%)
          </label>
          <input
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            step="0.1"
            min="0"
            max="30"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Lower discount = higher chance to win
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Submitting...' : 'Submit Bid'}
        </button>
      </form>

      {result && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {result.success ? (
            <div>
              <p className="font-semibold">Bid Submitted!</p>
              <p className="text-sm">Transaction ID: {result.result?.txId}</p>
              <p className="text-sm">Discount: {result.result?.discountPercent}%</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
