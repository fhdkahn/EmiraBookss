import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  category: string;
}

interface AccountingContextType {
  ledgerEntries: LedgerEntry[];
  addEntry: (entry: LedgerEntry) => void;
  updateEntry: (id: string, data: Partial<LedgerEntry>) => void;
  deleteEntry: (id: string) => void;
  getBalance: () => number;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

interface AccountingProviderProps {
  children: ReactNode;
}

export const AccountingProvider: React.FC<AccountingProviderProps> = ({ children }) => {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([
    { 
      id: '1', 
      date: '2023-10-01', 
      description: 'Initial Investment', 
      debit: 0, 
      credit: 100000, 
      balance: 100000,
      category: 'Investment'
    },
    { 
      id: '2', 
      date: '2023-10-05', 
      description: 'Office Rent', 
      debit: 15000, 
      credit: 0, 
      balance: 85000,
      category: 'Expenses'
    },
    { 
      id: '3', 
      date: '2023-10-10', 
      description: 'Sales Revenue', 
      debit: 0, 
      credit: 35000, 
      balance: 120000,
      category: 'Revenue'
    }
  ]);

  const addEntry = (entry: LedgerEntry) => {
    setLedgerEntries(prev => [...prev, entry]);
  };

  const updateEntry = (id: string, data: Partial<LedgerEntry>) => {
    setLedgerEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...data } : entry
    ));
  };

  const deleteEntry = (id: string) => {
    setLedgerEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const getBalance = () => {
    return ledgerEntries.reduce((acc, entry) => {
      return acc + (entry.credit || 0) - (entry.debit || 0);
    }, 0);
  };

  return (
    <AccountingContext.Provider value={{ ledgerEntries, addEntry, updateEntry, deleteEntry, getBalance }}>
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (context === undefined) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};

export default AccountingProvider;
