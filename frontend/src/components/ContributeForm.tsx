import { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { useSnackbar } from 'notistack';
import { api } from '../services/api';
export default function ContributeForm() {
  const {
    activeAddress,
    transactionSigner
  } = useWallet();
  const {
    enqueueSnackbar
  } = useSnackbar();
  const desiredAmountAlgo = 0.1; // fixed amount requested
  const [amount, setAmount] = useState(desiredAmountAlgo.toString());
  const [loading, setLoading] = useState(false);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [checkingMembership, setCheckingMembership] = useState(false);
  const [contractMonthlyAlgo, setContractMonthlyAlgo] = useState<number | null>(null);
  const [amountMismatch, setAmountMismatch] = useState(false);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  useEffect(() => {
    const checkMembership = async () => {
      if (!activeAddress) {
        setIsMember(null);
        return;
      }
      setCheckingMembership(true);
      try {
        const storedMembers = localStorage.getItem('chitMembers');
        if (storedMembers) {
          const members = JSON.parse(storedMembers);
          setIsMember(members.includes(activeAddress));
        } else {
          setIsMember(false);
        }
      } catch (error) {
        console.error('Error checking membership:', error);
        setIsMember(false);
      } finally {
        setCheckingMembership(false);
      }
    };
    checkMembership();
  }, [activeAddress]);

  useEffect(() => {
    const fetchContractState = async () => {
      try {
        const stateResp = await api.getState();
        const monthly = stateResp?.state?.monthlyContribution;
        const active = stateResp?.state?.isActive;
        if (typeof monthly === 'number') {
          const algo = monthly / 1_000_000;
          setContractMonthlyAlgo(algo);
          setAmountMismatch(Math.abs(algo - desiredAmountAlgo) > 1e-9);
        }
        if (typeof active === 'number') {
          setIsActive(active === 1);
        }
      } catch (e) {
        // ignore state fetch errors; keep UI default
      }
    };
    fetchContractState();
  }, []);
  const handleJoin = async () => {
    if (!activeAddress) {
      enqueueSnackbar('Please connect your wallet first', {
        variant: 'warning'
      });
      return;
    }
    setLoading(true);
    try {
      enqueueSnackbar('Please contact the manager to add you as a member', {
        variant: 'info',
        autoHideDuration: 5000
      });
      enqueueSnackbar(`Your address: ${activeAddress}`, {
        variant: 'info',
        autoHideDuration: 10000
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAddress) {
      enqueueSnackbar('Please connect your wallet first', {
        variant: 'warning'
      });
      return;
    }
    if (!isMember) {
      enqueueSnackbar('You must be a member to contribute. Please contact the manager.', {
        variant: 'error'
      });
      return;
    }
    if (amountMismatch) {
      enqueueSnackbar(`Contract expects ${contractMonthlyAlgo} ALGO per contribution. Please redeploy or update APP_ID.`, { variant: 'error' });
      return;
    }
    if (isActive === false) {
      enqueueSnackbar('Chit is not active yet. Ask manager to start the chit.', { variant: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const amountInMicroAlgos = Math.round(desiredAmountAlgo * 1_000_000);
      await api.contribute(activeAddress, transactionSigner, amountInMicroAlgos);
      enqueueSnackbar('Contribution successful!', {
        variant: 'success'
      });
      setAmount(desiredAmountAlgo.toString());
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Failed to contribute', {
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="card p-6">
      <h2 className="text-xl font-medium text-white mb-6">Make Contribution</h2>

      {!activeAddress && <div className="mb-6 p-4 bg-accent-900 border border-accent-600 rounded-lg">
          <p className="text-sm text-accent-200">
            Please connect your wallet to make a contribution
          </p>
        </div>}

      {activeAddress && checkingMembership && <div className="mb-6 p-4 bg-accent-900 border border-accent-600 rounded-lg">
          <p className="text-sm text-accent-200">
            Checking membership status...
          </p>
        </div>}

      {activeAddress && !checkingMembership && isMember === false && <div className="mb-6 p-4 bg-accent-900 border border-accent-600 rounded-lg">
          <p className="text-sm text-white mb-4">
            You are not a member of this chit fund yet
          </p>
          <div className="flex justify-end">
            <button onClick={handleJoin} disabled={loading} className="btn-primary px-5 py-2">
              Request to Join
            </button>
          </div>
          <p className="text-xs text-accent-300 mt-3">
            This will show your address. Share it with the manager to be added.
          </p>
        </div>}

      {activeAddress && isMember && <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg">
          <p className="text-sm text-green-300">
            You are a registered member{isActive === false ? ' — but the chit is not active yet' : ''}
          </p>
        </div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-accent-200 mb-2">
            Amount (ALGO) — fixed at {desiredAmountAlgo}
          </label>
          <input type="number" value={amount} readOnly className="w-full px-4 py-2.5 bg-accent-900 border border-accent-600 rounded-lg text-white" step="0.000001" min="0" required disabled />
          {amountMismatch && contractMonthlyAlgo !== null && (
            <p className="mt-2 text-xs text-red-300">
              Warning: Contract requires {contractMonthlyAlgo} ALGO per contribution. Submitting 0.1 ALGO will fail. Consider redeploying with 0.1 ALGO or updating APP_ID.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading || !activeAddress || !isMember || amountMismatch || isActive === false} className="btn-primary px-5 py-2">
            {loading ? 'Processing...' : 'Contribute'}
          </button>
        </div>

        {!isMember && activeAddress && <p className="text-xs text-center text-accent-400 mt-2">
            You must be a member to contribute
          </p>}
        {isActive === false && <p className="text-xs text-center text-accent-400 mt-2">Chit is paused/not started. Ask manager to start it.</p>}
      </form>
    </div>;
}