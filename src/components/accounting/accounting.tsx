import React, { useState } from 'react';
import { useAccounting } from '../../contexts/AccountingContext';
import { LedgerEntry } from '../../contexts/AccountingContext';

const Accounting: React.FC = () => {
  const { ledgerEntries, addEntry, updateEntry, deleteEntry, getBalance } = useAccounting();
  
  // Calculate current balance using the getBalance function from context
  const currentBalance = getBalance();

  // Add state for the transaction modal and edit/delete functionality
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<LedgerEntry | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    debit: 0,
    credit: 0
  });

  // Function to handle editing a transaction
  const handleEditTransaction = (transaction: LedgerEntry) => {
    setSelectedTransaction(transaction);
    setNewTransaction({
      date: transaction.date,
      description: transaction.description,
      debit: transaction.debit,
      credit: transaction.credit
    });
    setShowEditModal(true);
  };

  // Function to handle deleting a transaction
  const handleDeleteTransaction = (transaction: LedgerEntry) => {
    setSelectedTransaction(transaction);
    setShowDeleteModal(true);
  };

  // Function to save edited transaction
  const handleSaveEdit = () => {
    if (!newTransaction.description) {
      alert('Please enter a description');
      return;
    }
    
    if (newTransaction.debit === 0 && newTransaction.credit === 0) {
      alert('Please enter either a debit or credit amount');
      return;
    }

    if (!selectedTransaction) return;

    // Create updated entry data
    const updatedData = {
      date: newTransaction.date,
      description: newTransaction.description,
      debit: newTransaction.debit,
      credit: newTransaction.credit
    };

    // Update the entry
    updateEntry(selectedTransaction.id, updatedData);
    
    setShowEditModal(false);
    setSelectedTransaction(null);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: '',
      debit: 0,
      credit: 0
    });
  };

  // Function to confirm delete
  const handleConfirmDelete = () => {
    if (!selectedTransaction) return;
    
    // Delete the entry using its ID
    deleteEntry(selectedTransaction.id);
    
    setShowDeleteModal(false);
    setSelectedTransaction(null);
  };

  // Function to handle adding a new transaction
  const handleAddTransaction = () => {
    setShowAddModal(true);
  };

  // Function to save a new transaction
  const handleSaveTransaction = () => {
    // Validate the transaction
    if (!newTransaction.description) {
      alert('Please enter a description');
      return;
    }
    
    if (newTransaction.debit === 0 && newTransaction.credit === 0) {
      alert('Please enter either a debit or credit amount');
      return;
    }
    
    // Calculate the new balance
    const newBalance = currentBalance + (newTransaction.credit - newTransaction.debit);
    
    // Create the new entry
    const newEntry = {
      id: String(Date.now()), // Use timestamp as unique ID
      date: newTransaction.date,
      description: newTransaction.description,
      debit: newTransaction.debit,
      credit: newTransaction.credit,
      balance: newBalance,
      category: 'General' // Add a default category
    };
    
    // Add the new entry to the ledger
    addEntry(newEntry);
    
    // Reset the form and close the modal
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: '',
      debit: 0,
      credit: 0
    });
    setShowAddModal(false);
  };

  // Function to handle exporting the ledger
  const handleExport = () => {
    // Format date to ensure it displays correctly in Excel
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };
    
    // Create CSV content with headers
    let csvContent = "Date,Description,Debit (AED),Credit (AED),Balance (AED)\n";
    
    // Add all ledger entries
    ledgerEntries.forEach(entry => {
      csvContent += `${formatDate(entry.date)},${entry.description},${entry.debit},${entry.credit},${entry.balance}\n`;
    });
    
    // Add empty row before totals
    csvContent += "\n";
    
    // Add totals row
    const totalIncome = ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0);
    const totalExpenses = ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0);
    const currentBalance = ledgerEntries[ledgerEntries.length - 1].balance;
    
    csvContent += `Total,,${totalExpenses},${totalIncome},${currentBalance}\n`;
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'general_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate totals
  const totalIncome = ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0);
  const totalExpenses = ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Accounting</h1>
        <div className="flex space-x-2">
          <button className="btn-primary" onClick={handleAddTransaction}>Add Transaction</button>
          <button className="btn-secondary" onClick={handleExport}>Export</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="Top-cards">
          <h3 className="text-lg font-medium text-gray-700">Current Balance</h3>
          <p className="text-3xl font-bold mt-2">AED {currentBalance.toLocaleString()}</p>
        </div>
        <div className="Top-cards">
          <h3 className="text-lg font-medium text-gray-700">Total Income</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">AED {totalIncome.toLocaleString()}</p>
        </div>
        <div className="Top-cards">
          <h3 className="text-lg font-medium text-gray-700">Total Expenses</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">AED {totalExpenses.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-medium text-gray-700 mb-4">General Ledger</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Debit (AED)</th>
                <th>Credit (AED)</th>
                <th>Balance (AED)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td>{entry.description}</td>
                  <td>{entry.debit > 0 ? entry.debit.toLocaleString() : '-'}</td>
                  <td>{entry.credit > 0 ? entry.credit.toLocaleString() : '-'}</td>
                  <td>{entry.balance.toLocaleString()}</td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEditTransaction(entry)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteTransaction(entry)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Transaction</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="Enter transaction description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Debit Amount (AED)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                  value={newTransaction.debit || ''}
                  onChange={(e) => setNewTransaction({...newTransaction, debit: Number(e.target.value), credit: 0})}
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Amount (AED)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                  value={newTransaction.credit || ''}
                  onChange={(e) => setNewTransaction({...newTransaction, credit: Number(e.target.value), debit: 0})}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleSaveTransaction}
              >
                Save Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Transaction</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="Enter transaction description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Debit Amount (AED)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                  value={newTransaction.debit || ''}
                  onChange={(e) => setNewTransaction({...newTransaction, debit: Number(e.target.value), credit: 0})}
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Amount (AED)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                  value={newTransaction.credit || ''}
                  onChange={(e) => setNewTransaction({...newTransaction, credit: Number(e.target.value), debit: 0})}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTransaction(null);
                  setNewTransaction({
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    debit: 0,
                    credit: 0
                  });
                }}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Transaction</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTransaction(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;
