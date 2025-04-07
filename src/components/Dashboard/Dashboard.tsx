import React from 'react';
import { useDashboard } from '../../contexts/DashboardContext';

const Dashboard: React.FC = () => {
  // Get everything from the dashboard context
  const {
    ledgerEntries,
    invoices,
    inventory,
    calculatePendingAmount,
    calculateOverdueAmount,
    useRecentInvoices
  } = useDashboard();

  // Calculate total income
  const totalIncome = ledgerEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  
  // Calculate total inventory value
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  
  // Calculate total outstanding amount
  const totalOutstandingAmount = calculatePendingAmount('sales') + calculateOverdueAmount('sales');
  
  // Get recent invoices
  const recentInvoices = useRecentInvoices();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="Top-cards">
          <h3 className="text-lg font-medium text-gray-700">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2">AED {totalIncome.toLocaleString()}</p>
        </div>
        <div className="Top-cards">
          <h3 className="text-lg font-medium text-gray-700">Outstanding Invoices</h3>
          <p className="text-3xl font-bold mt-2">AED {totalOutstandingAmount.toLocaleString()}</p>
        </div>
        <div className="Top-cards">
          <h3 className="text-lg font-medium text-gray-700">Inventory Value</h3>
          <p className="text-3xl font-bold mt-2">AED {totalInventoryValue.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium">{invoice.number}</p>
                  <p className="text-sm text-gray-500">{invoice.date}</p>
                </div>
                <p className={`font-medium ${
                  invoice.type === 'sales' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {invoice.type === 'sales' ? '+' : '-'}AED {invoice.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Upcoming Payments</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium">Invoice #{i + 100}</p>
                  <p className="text-sm text-gray-500">Due: 2023-10-{i + 15}</p>
                </div>
                <p className="font-medium text-blue-600">₹{i * 7500}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;