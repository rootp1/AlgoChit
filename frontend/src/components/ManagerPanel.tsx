import { useState } from 'react';
import { api } from '../services/api';

export default function ManagerPanel() {
  const [memberAddress, setMemberAddress] = useState('');
  const [winnerAddress, setWinnerAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await api.addMember(memberAddress);
      setResult(response);
      if (response.success) setMemberAddress('');
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleStartChit = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await api.startChit();
      setResult(response);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await api.distribute(winnerAddress);
      setResult(response);
      if (response.success) setWinnerAddress('');
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manager Panel</h2>

      <div className="space-y-6">
        {/* Add Member */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Add Member</h3>
          <form onSubmit={handleAddMember} className="space-y-3">
            <input
              type="text"
              value={memberAddress}
              onChange={(e) => setMemberAddress(e.target.value)}
              placeholder="Member Algorand Address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </form>
        </div>

        {/* Start Chit */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Start Chit Fund</h3>
          <button
            onClick={handleStartChit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Starting...' : 'Start Chit'}
          </button>
        </div>

        {/* Distribute Pot */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Distribute Pot to Winner</h3>
          <form onSubmit={handleDistribute} className="space-y-3">
            <input
              type="text"
              value={winnerAddress}
              onChange={(e) => setWinnerAddress(e.target.value)}
              placeholder="Winner Algorand Address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Distributing...' : 'Distribute Pot'}
            </button>
          </form>
        </div>
      </div>

      {result && (
        <div
          className={`mt-6 p-4 rounded-lg ${
            result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {result.success ? (
            <div>
              <p className="font-semibold">Success!</p>
              <p className="text-sm break-all">{JSON.stringify(result.result, null, 2)}</p>
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
