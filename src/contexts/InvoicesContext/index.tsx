import React, { createContext, useContext, useState } from 'react';

// Define interfaces for type safety
export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  deliveryDate?: string; // Optional delivery date for the item
}

export interface Invoice {
  id: number;
  number: string;
  customer: string;
  date: string;
  amount: number;
  status: string;
  taxRate: number;
  type: 'sales' | 'purchase';
  items: InvoiceItem[];
  address?: string;
  contactNumber?: string;
  terms?: string;
  notes?: string;
}

interface InvoicesContextType {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
}

const defaultInvoices: Invoice[] = [
  { id: 1, number: 'INV-001', customer: 'ABC Corp', date: '2023-10-01', amount: 15000, status: 'Paid', taxRate: 5, type: 'sales', items: [{ id: 1, description: 'Product A', quantity: 3, rate: 5000, deliveryDate: '2023-10-05' }], terms: 'Payment is due within 15 days. Please make the payment via bank transfer or cheque.', notes: 'Thank you for your business!' },
  { id: 2, number: 'INV-002', customer: 'XYZ Ltd', date: '2023-10-05', amount: 8500, status: 'Pending', taxRate: 5, type: 'sales', items: [{ id: 1, description: 'Service B', quantity: 1, rate: 8500, deliveryDate: '2023-10-10' }], terms: 'Payment is due within 15 days. Please make the payment via bank transfer or cheque.', notes: 'Thank you for your business!' },
  { id: 3, number: 'INV-003', customer: '123 Industries', date: '2023-10-10', amount: 12000, status: 'Overdue', taxRate: 5, type: 'sales', items: [{ id: 1, description: 'Product C', quantity: 2, rate: 6000, deliveryDate: '2023-10-15' }], terms: 'Payment is due within 15 days. Please make the payment via bank transfer or cheque.', notes: 'Thank you for your business!' },
  { id: 4, number: 'INV-004', customer: 'Tech Solutions', date: '2023-10-15', amount: 9000, status: 'Paid', taxRate: 5, type: 'sales', items: [{ id: 1, description: 'Service D', quantity: 1, rate: 9000, deliveryDate: '2023-10-20' }], terms: 'Payment is due within 15 days. Please make the payment via bank transfer or cheque.', notes: 'Thank you for your business!' },
  { id: 5, number: 'INV-005', customer: 'Global Traders', date: '2023-10-20', amount: 11500, status: 'Pending', taxRate: 5, type: 'sales', items: [{ id: 1, description: 'Product E', quantity: 5, rate: 2300, deliveryDate: '2023-10-25' }], terms: 'Payment is due within 15 days. Please make the payment via bank transfer or cheque.', notes: 'Thank you for your business!' },
  { id: 6, number: 'PINV-001', customer: 'Supplier A', date: '2023-10-02', amount: 7500, status: 'Paid', taxRate: 5, type: 'purchase', items: [{ id: 1, description: 'Raw Material X', quantity: 10, rate: 750, deliveryDate: '2023-10-07' }], terms: 'Payment is due within 15 days. Please make the payment via bank transfer or cheque.', notes: 'Thank you for your business!' },
  { id: 7, number: 'PINV-002', customer: 'Supplier B', date: '2023-10-07', amount: 12300, status: 'Pending', taxRate: 5, type: 'purchase', items: [{ id: 1, description: 'Equipment Y', quantity: 1, rate: 12300, deliveryDate: '2023-10-12' }], terms: 'Payment is due within 15 days. Please make the payment via bank transfer or cheque.', notes: 'Thank you for your business!' },
  { id: 8, number: 'PINV-003', customer: 'Supplier C', date: '2023-10-12', amount: 5600, status: 'Overdue', taxRate: 5, type: 'purchase', items: [{ id: 1, description: 'Office Supplies', quantity: 4, rate: 1400, deliveryDate: '2023-10-17' }], terms: 'Payment is due within 15 days. Please make the payment via bank transfer or cheque.', notes: 'Thank you for your business!' },
];

// Create the context
export const InvoicesContext = createContext<InvoicesContextType>({
  invoices: [],
  setInvoices: () => {},
});

// Create the provider component
export const InvoicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(defaultInvoices);

  return (
    <InvoicesContext.Provider value={{ invoices, setInvoices }}>
      {children}
    </InvoicesContext.Provider>
  );
};

// Create and export the hook
export const useInvoices = () => {
  const context = useContext(InvoicesContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoicesProvider');
  }
  return context;
};
