import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface ChitState {
  currentMonth?: number;
  totalMembers?: number;
  monthlyContribution?: number;
  chitValue?: number;
  isActive?: boolean;
}

export default function Dashboard() {
  const [state, setState] = useState<ChitState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const result = await api.getState();
      if (result.success) {
        setState(result.state);
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Chit Fund Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Current Month</p>
          <p className="text-2xl font-bold text-blue-600">{state.currentMonth || 0}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Members</p>
          <p className="text-2xl font-bold text-green-600">{state.totalMembers || 0}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Monthly Contribution</p>
          <p className="text-2xl font-bold text-purple-600">
            {state.monthlyContribution ? (state.monthlyContribution / 1_000_000).toFixed(2) : '0'} ALGO
          </p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Status</p>
          <p className={`text-2xl font-bold ${state.isActive ? 'text-green-600' : 'text-red-600'}`}>
            {state.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>

      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Total Chit Value</p>
        <p className="text-3xl font-bold text-gray-800">
          {state.chitValue ? (state.chitValue / 1_000_000).toFixed(2) : '0'} ALGO
        </p>
      </div>
    </div>
  );
}
