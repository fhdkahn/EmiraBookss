import React, { createContext, useContext, ReactNode } from 'react';
import { useInventory } from '../../App';
import { useAccounting } from '../AccountingContext';
import { useInvoices } from '../InvoicesContext';

interface DashboardContextType {
  ledgerEntries: any[];
  invoices: any[];
  inventory: any[];
  calculatePendingAmount: (type: 'sales' | 'purchase') => number;
  calculateOverdueAmount: (type: 'sales' | 'purchase') => number;
  useRecentInvoices: () => any[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { invoices } = useInvoices();
  const { inventory } = useInventory();
  const { ledgerEntries } = useAccounting();

  const calculatePendingAmount = (type: 'sales' | 'purchase') => {
    return invoices
      .filter(inv => inv.type === type && inv.status === 'Pending')
      .reduce((total, inv) => total + inv.amount, 0);
  };

  const calculateOverdueAmount = (type: 'sales' | 'purchase') => {
    return invoices
      .filter(inv => inv.type === type && inv.status === 'Overdue')
      .reduce((total, inv) => total + inv.amount, 0);
  };

  const useRecentInvoices = () => {
    return invoices
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  };

  const value = {
    ledgerEntries,
    invoices,
    inventory,
    calculatePendingAmount,
    calculateOverdueAmount,
    useRecentInvoices
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

// Export both named and default exports
export { DashboardContext };
export default DashboardProvider;
