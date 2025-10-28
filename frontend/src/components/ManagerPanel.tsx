import { useState, useEffect } from 'react';
import { api } from '../services/api';
export default function ManagerPanel() {
  const [memberAddress, setMemberAddress] = useState('');
  const [removeAddress, setRemoveAddress] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [bids, setBids] = useState<Array<{ address: string; discountPercent: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [autoSelecting, setAutoSelecting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [contractTotalMembers, setContractTotalMembers] = useState<number | null>(null);
  const [bulkMembers, setBulkMembers] = useState('');
  const [chitValue, setChitValue] = useState<number>(0);
  const [commission, setCommission] = useState<number>(5);
  const [newTotalMembers, setNewTotalMembers] = useState('');

  useEffect(() => {
    loadMembers();
    loadBids();
    loadContractState();
  }, []);

  const loadContractState = async () => {
    try {
      const stateResp = await api.getState();
      const total = stateResp?.state?.totalMembers;
      if (typeof total === 'number') {
        setContractTotalMembers(total);
      }
      const cv = stateResp?.state?.chitValue;
      if (typeof cv === 'number') {
        setChitValue(cv);
      }
      const comm = stateResp?.state?.managerCommissionPercent;
      if (typeof comm === 'number') {
        setCommission(comm);
      }
    } catch (e) {
      console.error('Failed to load contract state:', e);
    }
  };
  const loadMembers = async () => {
    try {
      const storedMembers = localStorage.getItem('chitMembers');
      if (storedMembers) {
        setMembers(JSON.parse(storedMembers));
      }
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };
  const loadBids = async () => {
    try {
      setBidsLoading(true);
      const data = await api.getBids(100);
      const list = Array.isArray(data) ? data : (data?.bids || []);
      setBids(list);
    } catch (error) {
      console.error('Failed to load bids:', error);
    } finally {
      setBidsLoading(false);
    }
  };
  const saveMembersToStorage = (membersList: string[]) => {
    localStorage.setItem('chitMembers', JSON.stringify(membersList));
    setMembers(membersList);
  };
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await api.addMember(memberAddress);
      setResult(response);
      if (response.success) {
        setMemberAddress('');
        const updatedMembers = [...members, memberAddress];
        saveMembersToStorage(updatedMembers);
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };
    const handleRemoveMember = async (address: string) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await api.removeMember(address);
      if (response.success) {
        const updatedMembers = members.filter(m => m !== address);
        saveMembersToStorage(updatedMembers);
        setResult({
          success: true,
          message: 'Member removed successfully from blockchain!'
        });
        setRemoveAddress('');
      } else {
        setResult({
          success: false,
          error: response.error || 'Failed to remove member'
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSetMembers = () => {
    const addresses = bulkMembers
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (addresses.length === 0) {
      setResult({ success: false, error: 'No addresses provided' });
      return;
    }

    const validAddresses = addresses.filter(addr => addr.length === 58);
    if (validAddresses.length !== addresses.length) {
      setResult({ 
        success: false, 
        error: `Found ${addresses.length - validAddresses.length} invalid addresses. Algorand addresses must be 58 characters.` 
      });
      return;
    }

    saveMembersToStorage(validAddresses);
    setBulkMembers('');
    setResult({
      success: true,
      message: `Successfully set ${validAddresses.length} members in local tracking`
    });
  };

  const handleUpdateTotalMembers = async () => {
    const newTotal = parseInt(newTotalMembers);
    if (isNaN(newTotal) || newTotal <= 0) {
      setResult({ success: false, error: 'Please enter a valid number greater than 0' });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const response = await api.updateTotalMembers(newTotal);
      if (response.success) {
        setResult({
          success: true,
          message: `Total members updated to ${newTotal} on blockchain!`
        });
        setNewTotalMembers('');
        await loadContractState();
      } else {
        setResult({
          success: false,
          error: response.error || 'Failed to update total members'
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
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
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  const handlePauseChit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await api.pauseChit();
      setResult(response);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  const handleResumeChit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await api.resumeChit();
      setResult(response);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAutoSelectMaxDiscount = async () => {
    setAutoSelecting(true);
    setResult(null);
    try {
      const response = await api.distributeAuto();
      setResult(response);
      await loadBids();
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setAutoSelecting(false);
    }
  };
  return <div className="card p-6">
      <h2 className="text-xl font-medium text-white mb-6">Manager Panel</h2>

      <div className="space-y-6">
        {}
        <div className="border-b border-accent-700 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">
              Current Members 
              <span className="ml-2 text-brand-300">({members.length}</span>
              {contractTotalMembers !== null && (
                <span className="text-accent-400"> / {contractTotalMembers}</span>
              )}
              <span className="text-brand-300">)</span>
            </h3>
          </div>
          {members.length === 0 ? <p className="text-sm text-accent-400 italic">No members added yet</p> : <div className="space-y-2 max-h-60 overflow-y-auto">
              {members.map((member, index) => <div key={index} className="p-3 bg-accent-900 rounded-lg border border-accent-700 flex items-center justify-between">
                  <p className="text-xs font-mono break-all text-accent-200 flex-1 mr-3">{member}</p>
                  <button
                    onClick={() => handleRemoveMember(member)}
                    disabled={loading}
                    className="btn-outline px-2 py-1 text-xs"
                  >
                    Remove
                  </button>
                </div>)}
            </div>}
        </div>

        {/* Bids sorted by discount (desc) */}
        <div className="border-b border-accent-700 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Current Bids (by discount)</h3>
            <button onClick={loadBids} disabled={bidsLoading} className="btn-outline px-3 py-1 text-sm">
              {bidsLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          {bidsLoading ? (
            <p className="text-sm text-accent-400">Loading bids…</p>
          ) : bids.length === 0 ? (
            <p className="text-sm text-accent-400 italic">No bids submitted yet</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {bids.map((b, idx) => (
                <div key={b.address + idx} className="p-3 bg-accent-900 rounded-lg border border-accent-700 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono break-all text-accent-200">{b.address}</p>
                    {idx === 0 && <span className="text-[10px] text-brand-300">Top bidder</span>}
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {b.discountPercent}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {bids.length > 0 && (
            <div className="mt-4 p-4 bg-brand-900/20 border border-brand-700/40 rounded-lg">
              <h4 className="text-sm font-semibold text-brand-200 mb-3">💰 Distribution Preview (Top Bid)</h4>
              {(() => {
                const topBid = bids[0];
                const chitValueAlgo = chitValue / 1_000_000;
                const discountAmount = chitValueAlgo * (topBid.discountPercent / 100);
                const potAfterDiscount = chitValueAlgo - discountAmount;
                const managerCommission = discountAmount * (commission / 100);
                const remainingDiscount = discountAmount - managerCommission;
                const otherMembersCount = Math.max(0, members.length - 1);
                const perMemberShare = otherMembersCount > 0 ? remainingDiscount / otherMembersCount : 0;

                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Pot:</span>
                      <span className="text-white font-semibold">{chitValueAlgo.toFixed(4)} ALGO</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Discount ({topBid.discountPercent}%):</span>
                      <span className="text-red-400">-{discountAmount.toFixed(4)} ALGO</span>
                    </div>
                    <div className="h-px bg-brand-700/40 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-brand-300">→ Winner gets:</span>
                      <span className="text-green-400 font-bold">{potAfterDiscount.toFixed(4)} ALGO</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-brand-300">→ Manager commission:</span>
                      <span className="text-yellow-400 font-bold">{managerCommission.toFixed(4)} ALGO</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-brand-300">→ Each member ({otherMembersCount}):</span>
                      <span className="text-blue-400 font-bold">{perMemberShare.toFixed(4)} ALGO</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Winner: {topBid.address.slice(0, 8)}...{topBid.address.slice(-6)}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="flex justify-end mt-3">
            <button onClick={handleAutoSelectMaxDiscount} disabled={autoSelecting || bids.length === 0} className="btn-primary px-4 py-2">
              {autoSelecting ? 'Distributing…' : '🎯 Select Winner & Distribute'}
            </button>
          </div>
        </div>

        {}
        <div className="border-b border-accent-700 pb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Add Member</h3>
          <form onSubmit={handleAddMember} className="space-y-3">
            <input type="text" value={memberAddress} onChange={e => setMemberAddress(e.target.value)} placeholder="Member Algorand Address" className="w-full px-4 py-2 bg-accent-900 border border-accent-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 text-white placeholder-accent-500" required />
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary px-4 py-2">
                {loading ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>

        {}
        <div className="border-b border-accent-700 pb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Bulk Set Members</h3>
          <p className="text-xs text-accent-400 mb-3">
            Set all members at once (one address per line). This will replace the current member list in local tracking.
          </p>
          <div className="space-y-3">
            <textarea
              value={bulkMembers}
              onChange={e => setBulkMembers(e.target.value)}
              placeholder="Paste addresses, one per line&#10;Example:&#10;ABC123...XYZ&#10;DEF456...UVW"
              rows={6}
              className="w-full px-4 py-2 bg-accent-900 border border-accent-600 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 text-white placeholder-accent-500 font-mono text-sm"
            />
            <div className="flex justify-end">
              <button
                onClick={handleBulkSetMembers}
                disabled={loading || !bulkMembers.trim()}
                className="btn-primary px-4 py-2"
              >
                Set Members
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="border-b border-accent-700 pb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Update Total Members (Blockchain)</h3>
          <p className="text-xs text-accent-400 mb-3">
            Change the maximum number of members on the smart contract. This will also update the total chit value.
            {contractTotalMembers !== null && (
              <span className="block mt-1 text-brand-300">Current: {contractTotalMembers}</span>
            )}
          </p>
          <div className="space-y-3">
            <input
              type="number"
              value={newTotalMembers}
              onChange={e => setNewTotalMembers(e.target.value)}
              placeholder={`Current: ${contractTotalMembers || '?'}`}
              min="1"
              className="w-full px-4 py-2 bg-accent-900 border border-accent-600 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 text-white placeholder-accent-500"
            />
            <div className="flex justify-end">
              <button
                onClick={handleUpdateTotalMembers}
                disabled={loading || !newTotalMembers}
                className="btn-primary px-4 py-2"
              >
                {loading ? 'Updating...' : 'Update Total'}
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="border-b border-accent-700 pb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Remove Member (Manual)</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleRemoveMember(removeAddress);
          }} className="space-y-3">
            <input type="text" value={removeAddress} onChange={e => setRemoveAddress(e.target.value)} placeholder="Member Algorand Address to Remove" className="w-full px-4 py-2 bg-accent-900 border border-accent-600 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-white placeholder-accent-500" required />
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="btn-secondary px-4 py-2">
                {loading ? 'Removing...' : 'Remove Member'}
              </button>
            </div>
            <p className="text-xs text-accent-400">
              This will delete the member's box storage from the blockchain when paused.
            </p>
          </form>
        </div>

        {}
        <div className="border-b border-accent-700 pb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Chit Fund Controls</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={handleStartChit} disabled={loading} className="btn-primary w-full py-2">
              {loading ? 'Starting...' : 'Start'}
            </button>
            <button onClick={handlePauseChit} disabled={loading} className="btn-secondary w-full py-2">
              {loading ? 'Pausing...' : 'Pause (Add)'}
            </button>
            <button onClick={handleResumeChit} disabled={loading} className="btn-outline w-full py-2">
              {loading ? 'Resuming...' : 'Resume'}
            </button>
          </div>
        </div>

        {/* Manual discount distribution removed; use auto-select by max discount instead */}
      </div>

      {result && <div className={`mt-6 p-4 rounded-lg border ${result.success ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-red-900/30 border-red-700 text-red-300'}`}>
          {result.success ? <div>
              <p className="font-semibold">Success!</p>
              <p className="text-sm break-all">{JSON.stringify(result.result, null, 2)}</p>
            </div> : <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{result.error}</p>
            </div>}
        </div>}
    </div>;
}