import { useState, useEffect } from 'react';
import { api } from '../services/api';
interface ChitState {
  currentMonth?: number;
  totalMembers?: number;
  monthlyContribution?: number;
  chitValue?: number;
  isActive?: boolean;
  appAddress?: string;
  appBalance?: number;
}
export default function Dashboard() {
  const [state, setState] = useState<ChitState>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadState = async () => {
      try {
        const response = await api.getState();
        if (response.state) {
          setState(response.state);
        }
      } catch (error) {
        console.error('Failed to load state:', error);
      } finally {
        setLoading(false);
      }
    };
    loadState();
    const interval = setInterval(loadState, 10000);
    return () => clearInterval(interval);
  }, []);
  if (loading) {
    return <div className="card p-8">
        <p className="text-accent-300 text-center">Loading...</p>
      </div>;
  }
  return <div className="card p-6">
      <h2 className="text-xl font-medium text-white mb-6">Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-accent-900/70 border border-brand-900/40 rounded-lg hover:border-brand-700/40 transition-all shadow-md">
          <p className="text-xs font-medium text-accent-400 uppercase tracking-wide mb-1">Current Month</p>
          <p className="text-3xl font-light text-white">{state.currentMonth || 0}</p>
        </div>

        <div className="p-4 bg-accent-900/70 border border-brand-900/40 rounded-lg hover:border-brand-700/40 transition-all shadow-md">
          <p className="text-xs font-medium text-accent-400 uppercase tracking-wide mb-1">Total Members</p>
          <p className="text-3xl font-light text-white">{state.totalMembers || 0}</p>
        </div>

        <div className="p-4 bg-accent-900/70 border border-brand-900/40 rounded-lg hover:border-brand-700/40 transition-all shadow-md">
          <p className="text-xs font-medium text-accent-400 uppercase tracking-wide mb-1">Monthly Contribution</p>
          <p className="text-3xl font-light text-white">
            {state.monthlyContribution ? (state.monthlyContribution / 1_000_000).toFixed(0) : '0'}
            <span className="text-sm text-accent-400 ml-1">ALGO</span>
          </p>
        </div>

        <div className="p-4 bg-accent-900/70 border border-brand-900/40 rounded-lg hover:border-brand-700/40 transition-all shadow-md">
          <p className="text-xs font-medium text-accent-400 uppercase tracking-wide mb-1">Status</p>
          <p className={`text-3xl font-light ${state.isActive ? 'text-brand-400' : 'text-accent-500'}`}>
            {state.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>

      <div className="p-6 bg-accent-900/70 border border-brand-900/40 rounded-lg shadow-md">
        <p className="text-xs font-medium text-accent-400 uppercase tracking-wide mb-1">Total Chit Value</p>
        <p className="text-4xl font-light text-white">
          {state.chitValue ? (state.chitValue / 1_000_000).toFixed(2) : '0'}
          <span className="text-xl text-brand-300 ml-2">ALGO</span>
        </p>
      </div>

      {state.appAddress && (
        <div className="mt-4 p-4 bg-accent-900/70 border border-brand-900/40 rounded-lg shadow-md">
          <p className="text-xs font-medium text-accent-400 uppercase tracking-wide mb-2">App Contract Balance</p>
          <p className="text-2xl font-light text-white mb-2">
            {state.appBalance ? (state.appBalance / 1_000_000).toFixed(2) : '0'}
            <span className="text-sm text-brand-300 ml-1">ALGO</span>
          </p>
          <p className="text-xs text-accent-500 font-mono break-all">{state.appAddress}</p>
          {state.chitValue && state.appBalance && state.appBalance < state.chitValue && (
            <p className="mt-2 text-xs text-yellow-400">
              ⚠️ App balance is less than chitValue. Distribution may fail. Fund the app address above.
            </p>
          )}
        </div>
      )}
    </div>;
}