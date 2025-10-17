const API_BASE_URL = 'http://localhost:3000/api/chitfund';

export const api = {
  // Get chit fund state
  getState: async () => {
    const response = await fetch(`${API_BASE_URL}/state`);
    return response.json();
  },

  // Add member
  addMember: async (memberAddress: string) => {
    const response = await fetch(`${API_BASE_URL}/members/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberAddress }),
    });
    return response.json();
  },

  // Start chit fund
  startChit: async () => {
    const response = await fetch(`${API_BASE_URL}/start`, {
      method: 'POST',
    });
    return response.json();
  },

  // Make contribution
  contribute: async (mnemonic: string, amount: number) => {
    const response = await fetch(`${API_BASE_URL}/contribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mnemonic, amount }),
    });
    return response.json();
  },

  // Submit bid
  submitBid: async (mnemonic: string, discountPercent: number) => {
    const response = await fetch(`${API_BASE_URL}/bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mnemonic, discountPercent }),
    });
    return response.json();
  },

  // Distribute pot
  distribute: async (winnerAddress: string) => {
    const response = await fetch(`${API_BASE_URL}/distribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerAddress }),
    });
    return response.json();
  },

  // Get member details
  getMember: async (address: string) => {
    const response = await fetch(`${API_BASE_URL}/members/${address}`);
    return response.json();
  },

  // Get transactions
  getTransactions: async (limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/transactions?limit=${limit}`);
    return response.json();
  },

  // Pause chit
  pauseChit: async () => {
    const response = await fetch(`${API_BASE_URL}/pause`, {
      method: 'POST',
    });
    return response.json();
  },

  // Resume chit
  resumeChit: async () => {
    const response = await fetch(`${API_BASE_URL}/resume`, {
      method: 'POST',
    });
    return response.json();
  },
};
