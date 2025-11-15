import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { api } from '../services/api';

export type UserRole = 'manager' | 'member' | 'visitor';

interface UserRoleContextType {
  role: UserRole;
  isManager: boolean;
  isMember: boolean;
  managerAddress: string | null;
  loading: boolean;
  refreshRole: () => Promise<void>;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const { activeAddress } = useWallet();
  const [role, setRole] = useState<UserRole>('visitor');
  const [managerAddress, setManagerAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkRole = async () => {
    if (!activeAddress) {
      setRole('visitor');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get manager address
      const managerResponse = await api.getManagerAddress();
      const manager = managerResponse.managerAddress;
      setManagerAddress(manager);

      // Check if connected wallet is the manager
      if (activeAddress === manager) {
        setRole('manager');
        setLoading(false);
        return;
      }

      // Check if connected wallet is a member
      const membershipResponse = await api.checkMembership(activeAddress);
      if (membershipResponse.isMember) {
        setRole('member');
      } else {
        setRole('visitor');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setRole('visitor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkRole();
  }, [activeAddress]);

  const value: UserRoleContextType = {
    role,
    isManager: role === 'manager',
    isMember: role === 'member',
    managerAddress,
    loading,
    refreshRole: checkRole,
  };

  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
}
