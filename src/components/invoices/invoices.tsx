import React, { useState, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useInvoices, Invoice, InvoiceItem } from '../../contexts/InvoicesContext';
import { useSettings } from '../../contexts/SettingsContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Invoices: React.FC = () => {
  // Add global styles for hiding scrollbars
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;     /* Firefox */
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none;            /* Chrome, Safari and Opera */
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const { globalSearchQuery } = useSearch();
  const { invoices, setInvoices } = useInvoices();
  const { companyInfo } = useSettings();
  const [invoiceType, setInvoiceType] = useState('sales');
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [dateFilter, setDateFilter] = useState('Last 30 days');
  const [showDeliveryDateColumn, setShowDeliveryDateColumn] = useState(true);
  const [deliveryDateLabel, setDeliveryDateLabel] = useState('Delivery Date');
  
  // Use global search query if available, otherwise use local search
  const effectiveSearchQuery = globalSearchQuery || localSearchQuery;
  
  // Filter invoices based on search query, filters, and invoice type
  const filteredInvoices = invoices.filter(invoice => {
    // Invoice type filter
    const matchesType = invoice.type === invoiceType;
    
    // Search query filter
    const matchesSearch = effectiveSearchQuery === '' || 
      invoice.number.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
      invoice.status.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
      invoice.amount.toString().includes(effectiveSearchQuery);
    
    // Status filter
    const matchesStatus = statusFilter === 'All Statuses' || invoice.status === statusFilter;
    
    // For simplicity, we're not implementing actual date filtering logic here
    
    return matchesType && matchesSearch && matchesStatus;
  });
  
  // Update local search when global search changes
  React.useEffect(() => {
    if (globalSearchQuery) {
      setLocalSearchQuery('');
    }
  }, [globalSearchQuery]);

  // Add effect to handle body scroll lock
  useEffect(() => {
    const handleScrollLock = () => {
      if (showCreateModal || showEditModal || showViewModal || showDeleteConfirmation) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    };

    handleScrollLock();
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCreateModal, showEditModal, showViewModal, showDeleteConfirmation]);

  const handleView = (invoice: Invoice) => {
    setCurrentInvoice({
      ...invoice,
      address: invoice.address || 'Customer Address Line 1\nCustomer Address Line 2',
      contactNumber: invoice.contactNumber || '+971 50 123 4567',
      terms: invoice.terms || 'Payment is due within 15 days. Please make the payment via bank transfer or cheque.',
      notes: invoice.notes || 'Thank you for your business!'
    });
    setShowViewModal(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setCurrentInvoice({
      ...invoice,
      address: invoice.address || 'Customer Address Line 1\nCustomer Address Line 2',
      contactNumber: invoice.contactNumber || '+971 50 123 4567',
      terms: invoice.terms || 'Payment is due within 15 days. Please make the payment via bank transfer or cheque.',
      notes: invoice.notes || 'Thank you for your business!'
    });
    setShowEditModal(true);
  };

  const handleCreate = () => {
    const newInvoiceNumber = invoiceType === 'sales' 
      ? `INV-00${invoices.filter(inv => inv.type === 'sales').length + 1}`
      : `PINV-00${invoices.filter(inv => inv.type === 'purchase').length + 1}`;
    
    const today = new Date().toISOString().split('T')[0];
    
    setCurrentInvoice({
      id: invoices.length + 1,
      number: newInvoiceNumber,
      customer: '',
      date: today,
      amount: 0,
      status: 'Pending',
      address: '',
      contactNumber: '',
      taxRate: 5,
      type: invoiceType as 'sales' | 'purchase',
      items: [{ id: 1, description: 'Product/Service', quantity: 1, rate: 0, deliveryDate: today }],
      terms: 'Payment is due within 15 days. Please make the payment via bank transfer or cheque.',
      notes: 'Thank you for your business!'
    });
    setShowCreateModal(true);
  };

  const calculateInvoiceTotal = (items: InvoiceItem[]) => {
    return items.reduce((total, item) => total + (item.quantity * item.rate), 0);
  };

  const calculateTax = (amount: number, taxRate: number) => {
    return amount * (taxRate / 100);
  };

  const calculateTotal = (amount: number, taxAmount: number) => {
    return amount + taxAmount;
  };

  const handleAddItem = () => {
    if (!currentInvoice) return;
    
    const newItem = {
      id: currentInvoice.items.length + 1,
      description: 'New Item',
      quantity: 1,
      rate: 0,
      deliveryDate: currentInvoice.date // Default to invoice date
    };
    
    const updatedItems = [...currentInvoice.items, newItem];
    const newAmount = calculateInvoiceTotal(updatedItems);
    
    setCurrentInvoice({
      ...currentInvoice,
      items: updatedItems,
      amount: newAmount
    });
  };

  const handleDeleteItem = (itemId: number) => {
    if (!currentInvoice || currentInvoice.items.length <= 1) return;
    
    const updatedItems = currentInvoice.items.filter((item: InvoiceItem) => item.id !== itemId);
    const newAmount = calculateInvoiceTotal(updatedItems);
    
    setCurrentInvoice({
      ...currentInvoice,
      items: updatedItems,
      amount: newAmount
    });
  };

  const handleItemChange = (itemId: number, field: string, value: any) => {
    if (!currentInvoice) return;
    
    const updatedItems = currentInvoice.items.map((item: InvoiceItem) => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate item amount if quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          updatedItem.quantity = field === 'quantity' ? Number(value) : item.quantity;
          updatedItem.rate = field === 'rate' ? Number(value) : item.rate;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    const newAmount = calculateInvoiceTotal(updatedItems);
    
    setCurrentInvoice({
      ...currentInvoice,
      items: updatedItems,
      amount: newAmount
    });
  };

  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentInvoice) {
      setCurrentInvoice({
        ...currentInvoice,
        taxRate: Number(e.target.value)
      });
    }
  };

  const handleSaveEdit = () => {
    if (currentInvoice) {
      setInvoices(invoices.map(inv => inv.id === currentInvoice.id ? currentInvoice : inv));
      setShowEditModal(false);
    }
  };

  const handleSaveNew = () => {
    if (currentInvoice) {
      setInvoices([...invoices, currentInvoice]);
      setShowCreateModal(false);
    }
  };

  // Function to handle printing the invoice
  const handlePrintInvoice = () => {
    const printContent = document.getElementById('invoice-to-print');
    const originalContents = document.body.innerHTML;
    
    if (printContent) {
      const printStyles = `
        <style>
          @page { size: A4; margin: 1cm; }
          body { font-family: Arial, sans-serif; }
          .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-header-left { float: left; }
          .invoice-header-right { float: right; text-align: right; }
          img { max-height: 25mm; max-width: 40mm; object-fit: contain; }
          .logo-container { width: 40mm; height: 25mm; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; text-align: left; }
          .text-right { text-align: right; }
          .footer { margin-top: 30px; }
          .clearfix::after { content: ""; clear: both; display: table; }
        </style>
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Invoice</title>');
        printWindow.document.write(printStyles);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        
        // Print after a short delay to ensure content is loaded
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  // Function to generate and download PDF
  const handleDownloadPDF = () => {
    const printContent = document.getElementById('invoice-to-print');
    
    if (printContent && currentInvoice) {
      // Add a temporary class for better PDF rendering
      printContent.classList.add('pdf-export');
      
      // Apply specific styles for PDF export
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .pdf-export {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 10mm;
          font-family: Arial, sans-serif;
          font-size: 10pt;
        }
        .pdf-export h1 {
          font-size: 18pt;
        }
        .pdf-export h2 {
          font-size: 16pt;
        }
        .pdf-export img {
          max-height: 40mm;
          max-width: 60mm;
          height: auto;
          width: auto;
          object-fit: contain;
        }
        .pdf-export .logo-container {
          width: 60mm;
          height: 40mm;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }
        .pdf-export h3 {
          font-size: 12pt;
        }
        .pdf-export table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 9pt;
        }
        .pdf-export th, .pdf-export td {
          border: 1px solid #ddd;
          padding: 4px;
          text-align: left;
        }
        .pdf-export th {
          background-color: #f2f2f2;
        }
        .pdf-export .text-right {
          text-align: right;
        }
        .pdf-export .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .pdf-export .invoice-header-left {
          width: 50%;
          float: left;
        }
        .pdf-export .invoice-header-right {
          width: 50%;
          float: right;
          text-align: right;
        }
        .pdf-export .clearfix::after {
          content: "";
          clear: both;
          display: table;
        }
      `;
      document.head.appendChild(styleElement);
      
      // Use html2pdf library for better formatting
      if (window.html2pdf) {
        const opt = {
          margin: [10, 10, 10, 10], // top, right, bottom, left margins in mm
          filename: `Invoice-${currentInvoice.number}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true,
            letterRendering: true,
            width: 800 // Fixed width to ensure consistent scaling
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
          }
        };
        
        window.html2pdf(printContent, opt)
          .then(() => {
            // Clean up
            printContent.classList.remove('pdf-export');
            document.head.removeChild(styleElement);
          })
          .catch(error => {
            console.error('Error generating PDF:', error);
            alert('Could not generate PDF. Please try again.');
            printContent.classList.remove('pdf-export');
            document.head.removeChild(styleElement);
          });
      } else {
        alert('PDF generation library not loaded. Please try again later.');
        printContent.classList.remove('pdf-export');
        document.head.removeChild(styleElement);
      }
    } else {
      alert('Could not generate PDF. Please try again.');
    }
  };

  // Add script tags for PDF generation libraries
  React.useEffect(() => {
    // Add html2pdf script
    const html2pdfScript = document.createElement('script');
    html2pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    html2pdfScript.async = true;
    document.body.appendChild(html2pdfScript);
    
    // Cleanup function
    return () => {
      document.body.removeChild(html2pdfScript);
    };
  }, []);

  const handleDelete = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (currentInvoice) {
      setInvoices(invoices.filter(inv => inv.id !== currentInvoice.id));
      setShowDeleteConfirmation(false);
      setCurrentInvoice(null);
    }
  };

  // Add functions to calculate summary metrics
  const calculateTotalAmount = (type: 'sales' | 'purchase') => {
    return invoices
      .filter(inv => inv.type === type)
      .reduce((total, inv) => total + inv.amount, 0);
  };

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

  const handleDateChange = (date: Date | null, field: string, itemId?: number) => {
    if (!currentInvoice || !date) return;
    
    if (itemId) {
      // Handle item delivery date change
      handleItemChange(itemId, field, date.toISOString().split('T')[0]);
    } else {
      // Handle invoice date change
      setCurrentInvoice({
        ...currentInvoice,
        [field]: date.toISOString().split('T')[0]
      });
    }
  };

  // Update the DatePicker props
  const datePickerProps = {
    className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    dateFormat: "yyyy-MM-dd",
    isClearable: false,
    showPopperArrow: false,
    showYearDropdown: true,
    showMonthDropdown: true,
    dropdownMode: "select",
    selectsMultiple: false,
    placeholderText: "Select date"
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <div className="mt-2 flex space-x-2">
            <button 
              className={`px-4 py-2 rounded-md font-medium ${
                invoiceType === 'sales' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setInvoiceType('sales')}
            >
              Sales Invoice
            </button>
            <button 
              className={`px-4 py-2 rounded-md font-medium ${
                invoiceType === 'purchase' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setInvoiceType('purchase')}
            >
              Purchase Invoice
            </button>
          </div>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          Create {invoiceType === 'sales' ? 'Sales' : 'Purchase'} Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="Top-cards">
          <h3 className="text-lg font-medium text-gray-700">
            Total {invoiceType === 'sales' ? 'Sales' : 'Purchases'}
          </h3>
          <p className="text-3xl font-bold mt-2">
            AED {calculateTotalAmount(invoiceType as 'sales' | 'purchase').toLocaleString()}
          </p>
        </div>
        <div className="Top-cards">
          <h3 className="text-lg font-medium text-gray-700">Pending Amount</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">
            AED {calculatePendingAmount(invoiceType as 'sales' | 'purchase').toLocaleString()}
          </p>
        </div>
        <div className="Top-cards">
          <h3 className="text-lg font-medium text-gray-700">Overdue Amount</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">
            AED {calculateOverdueAmount(invoiceType as 'sales' | 'purchase').toLocaleString()}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search invoices..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <select 
              className="input-field" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Statuses</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Overdue</option>
            </select>
            <select 
              className="input-field" 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This year</option>
              <option>All time</option>
            </select>
          </div>
        </div>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>{invoiceType === 'sales' ? 'Customer' : 'Supplier'}</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.number}</td>
                  <td>{invoice.customer}</td>
                  <td>{invoice.date}</td>
                  <td>AED {invoice.amount.toLocaleString()}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleView(invoice)}
                      >
                        View
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-800"
                        onClick={() => handleEdit(invoice)}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(invoice)}
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

      {showViewModal && currentInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
              <div id="invoice-to-print" className="p-6">
                <div className="clearfix mb-8 border-b pb-6">
                  <div className="invoice-header-left float-left w-1/2">
                    {companyInfo.logo ? (
                      <div className="logo-container">
                        <img 
                          src={companyInfo.logo} 
                          alt={companyInfo.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <h1 className="text-2xl font-bold text-blue-600">{companyInfo.name}</h1>
                    )}
                    <p className="text-sm text-gray-500">Business Management Suite</p>
                    <p className="mt-2 text-sm">{companyInfo.address}</p>
                    <p className="text-sm">TRN: {companyInfo.TRNNumber}</p>
                  </div>
                  <div className="invoice-header-right float-right w-1/2 text-right">
                    <h2 className="text-xl font-bold">
                      {currentInvoice.type === 'sales' ? 'SALES INVOICE' : 'PURCHASE INVOICE'}
                    </h2>
                    <div className="mt-2 p-2 bg-gray-50 rounded-md">
                      <p className="font-medium text-sm">Invoice Number: <span className="text-gray-700">{currentInvoice.number}</span></p>
                      <p className="font-medium text-sm">Date: <span className="text-gray-700">{currentInvoice.date}</span></p>
                      <p className="font-medium text-sm">Status: 
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                          currentInvoice.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : currentInvoice.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {currentInvoice.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Add invoice customer/supplier information */}
                <div className="mb-6">
                  <h3 className="text-base font-medium text-gray-700 mb-2">
                    {currentInvoice.type === 'sales' ? 'Customer Information' : 'Supplier Information'}
                  </h3>
                  <p className="text-gray-600 text-sm font-medium">{currentInvoice.customer}</p>
                  <p className="text-gray-600 text-sm whitespace-pre-line">{currentInvoice.address}</p>
                  <p className="text-gray-600 text-sm">{currentInvoice.contactNumber}</p>
                </div>

                {/* Add invoice items table */}
                <div className="mb-6">
                  <h3 className="text-base font-medium text-gray-700 mb-2">Invoice Items</h3>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 text-left border border-gray-200">Description</th>
                        <th className="p-2 text-right border border-gray-200">Quantity</th>
                        <th className="p-2 text-right border border-gray-200">Rate (AED)</th>
                        {currentInvoice.items[0]?.deliveryDate && (
                          <th className="p-2 text-left border border-gray-200">Delivery Date</th>
                        )}
                        <th className="p-2 text-right border border-gray-200">Amount (AED)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInvoice.items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2 border border-gray-200">{item.description}</td>
                          <td className="p-2 text-right border border-gray-200">{item.quantity}</td>
                          <td className="p-2 text-right border border-gray-200">{item.rate.toLocaleString()}</td>
                          {currentInvoice.items[0]?.deliveryDate && (
                            <td className="p-2 border border-gray-200">{item.deliveryDate}</td>
                          )}
                          <td className="p-2 text-right border border-gray-200">
                            {(item.quantity * item.rate).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add totals section */}
                <div className="mb-6 flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <span className="font-medium">Subtotal:</span>
                      <span>AED {currentInvoice.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Tax ({currentInvoice.taxRate}%):</span>
                      <span>AED {calculateTax(currentInvoice.amount, currentInvoice.taxRate).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-lg">
                      <span>Total:</span>
                      <span>AED {calculateTotal(
                        currentInvoice.amount,
                        calculateTax(currentInvoice.amount, currentInvoice.taxRate)
                      ).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-base font-medium text-gray-700 mb-2">Terms & Notes</h3>
                  <p className="text-gray-600 text-sm">{currentInvoice.terms || 'Payment is due within 15 days. Please make the payment via bank transfer or cheque.'}</p>
                  <p className="text-gray-600 text-sm mt-2">{currentInvoice.notes || 'Thank you for your business!'}</p>
                </div>
              </div>
            </div>

            <div className="border-t p-6 bg-gray-50 rounded-b-lg">
              <div className="flex justify-end space-x-4">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
                <button 
                  className="btn-primary flex items-center"
                  onClick={handleDownloadPDF}
                >
                  Download PDF
                </button>
                <button 
                  className="btn-primary"
                  onClick={handlePrintInvoice}
                >
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Edit Invoice</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={currentInvoice?.customer || ''}
                    onChange={(e) => setCurrentInvoice(currentInvoice ? {...currentInvoice, customer: e.target.value} : null)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <DatePicker
                    selected={currentInvoice?.date ? new Date(currentInvoice.date) : null}
                    onChange={(date) => handleDateChange(date, 'date')}
                    selectsMultiple={false}
                    {...datePickerProps}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={currentInvoice?.address || ''}
                    onChange={(e) => setCurrentInvoice(currentInvoice ? {...currentInvoice, address: e.target.value} : null)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={currentInvoice?.contactNumber || ''}
                    onChange={(e) => setCurrentInvoice(currentInvoice ? {...currentInvoice, contactNumber: e.target.value} : null)}
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Items</h3>
                <table className="w-full mb-4">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-left">Quantity</th>
                      <th className="p-2 text-left">Rate (AED)</th>
                      <th className="p-2 text-left">Delivery Date</th>
                      <th className="p-2 text-left">Amount (AED)</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoice?.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">
                          <input
                            type="text"
                            className="w-full p-1 border rounded"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            className="w-full p-1 border rounded"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                            min="1"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            className="w-full p-1 border rounded"
                            value={item.rate}
                            onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                            min="0"
                          />
                        </td>
                        <td className="p-2">
                          <DatePicker
                            selected={item.deliveryDate ? new Date(item.deliveryDate) : null}
                            onChange={(date) => handleDateChange(date, 'deliveryDate', item.id)}
                            selectsMultiple={false}
                            {...datePickerProps}
                          />
                        </td>
                        <td className="p-2">
                          {(item.quantity * item.rate).toLocaleString()}
                        </td>
                        <td className="p-2">
                          {currentInvoice.items.length > 1 && (
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={handleAddItem}
                  className="text-blue-600 hover:text-blue-800"
                >
                  + Add Item
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terms</label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={currentInvoice?.terms || ''}
                    onChange={(e) => setCurrentInvoice(currentInvoice ? {...currentInvoice, terms: e.target.value} : null)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={currentInvoice?.notes || ''}
                    onChange={(e) => setCurrentInvoice(currentInvoice ? {...currentInvoice, notes: e.target.value} : null)}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    className="w-32 p-2 border rounded-md"
                    value={currentInvoice?.taxRate || 0}
                    onChange={handleTaxRateChange}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    <span className="font-medium">Subtotal: </span>
                    <span>AED {currentInvoice?.amount.toLocaleString()}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Tax ({currentInvoice?.taxRate}%): </span>
                    <span>AED {calculateTax(currentInvoice?.amount || 0, currentInvoice?.taxRate || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-xl font-bold">
                    <span>Total: </span>
                    <span>AED {calculateTotal(
                      currentInvoice?.amount || 0,
                      calculateTax(currentInvoice?.amount || 0, currentInvoice?.taxRate || 0)
                    ).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && currentInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" style={{ zIndex: 9999 }}>
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl relative"
            style={{
              maxHeight: '90vh',
              margin: '20px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Close button */}
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="overflow-y-auto p-8" style={{ maxHeight: 'calc(90vh - 40px)', overflowX: 'hidden', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              <h2 className="text-2xl font-bold mb-6 border-b pb-4">
                Create New {currentInvoice.type === 'sales' ? 'Sales' : 'Purchase'} Invoice
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Invoice Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={currentInvoice.number}
                        onChange={(e) => setCurrentInvoice({...currentInvoice, number: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <DatePicker
                        selected={currentInvoice?.date ? new Date(currentInvoice.date) : null}
                        onChange={(date) => handleDateChange(date, 'date')}
                        selectsMultiple={false}
                        {...datePickerProps}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select 
                        className="input-field"
                        value={currentInvoice.status}
                        onChange={(e) => setCurrentInvoice({...currentInvoice, status: e.target.value})}
                      >
                        <option>Paid</option>
                        <option>Pending</option>
                        <option>Overdue</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    {currentInvoice.type === 'sales' ? 'Customer Information' : 'Supplier Information'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {currentInvoice.type === 'sales' ? 'Customer Name' : 'Supplier Name'}
                      </label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={currentInvoice.customer}
                        onChange={(e) => setCurrentInvoice({...currentInvoice, customer: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea 
                        className="input-field" 
                        rows={3}
                        placeholder="Enter customer address"
                        value={currentInvoice.address || ''}
                        onChange={(e) => setCurrentInvoice({...currentInvoice, address: e.target.value})}
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Enter contact number"
                        value={currentInvoice.contactNumber || ''}
                        onChange={(e) => setCurrentInvoice({...currentInvoice, contactNumber: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Invoice Items</h3>
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-4">
                    <input
                      type="checkbox"
                      id="showDeliveryDate"
                      className="mr-2"
                      checked={showDeliveryDateColumn}
                      onChange={(e) => setShowDeliveryDateColumn(e.target.checked)}
                    />
                    <label htmlFor="showDeliveryDate" className="text-sm">Show Date Column</label>
                  </div>
                  {showDeliveryDateColumn && (
                    <div className="flex items-center">
                      <label htmlFor="deliveryDateLabel" className="text-sm mr-2">Date Column Label:</label>
                      <input
                        type="text"
                        id="deliveryDateLabel"
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        value={deliveryDateLabel}
                        onChange={(e) => setDeliveryDateLabel(e.target.value)}
                        placeholder="Enter column label"
                      />
                    </div>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse" style={{ overflowX: 'hidden', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-2 px-4 text-center border border-gray-200" style={{width: '5%'}}>No.</th>
                        {showDeliveryDateColumn && (
                          <th className="py-2 px-4 text-center border border-gray-200" style={{width: '15%'}}>{deliveryDateLabel}</th>
                        )}
                        <th className="py-2 px-4 text-left border border-gray-200">Item</th>
                        <th className="py-2 px-4 text-right border border-gray-200">Quantity</th>
                        <th className="py-2 px-4 text-right border border-gray-200">Rate</th>
                        <th className="py-2 px-4 text-right border border-gray-200">Amount</th>
                        <th className="py-2 px-4 text-center border border-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInvoice.items.map((item: InvoiceItem, index: number) => (
                        <tr key={item.id}>
                          <td className="py-2 px-4 text-center border border-gray-200">
                            {index + 1}
                          </td>
                          {showDeliveryDateColumn && (
                            <td className="py-2 px-4 text-center border border-gray-200">
                              <DatePicker
                                selected={item.deliveryDate ? new Date(item.deliveryDate) : null}
                                onChange={(date) => handleDateChange(date, 'deliveryDate', item.id)}
                                selectsMultiple={false}
                                {...datePickerProps}
                              />
                            </td>
                          )}
                          <td className="py-2 px-4 border border-gray-200">
                            <input 
                              type="text" 
                              className="w-full border-0 focus:ring-0" 
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            />
                          </td>
                          <td className="py-2 px-4 text-right border border-gray-200">
                            <input 
                              type="number" 
                              className="w-full border-0 focus:ring-0 text-right" 
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                              min="1"
                            />
                          </td>
                          <td className="py-2 px-4 text-right border border-gray-200">
                            <input 
                              type="number" 
                              className="w-full border-0 focus:ring-0 text-right" 
                              value={item.rate}
                              onChange={(e) => handleItemChange(item.id, 'rate', Number(e.target.value))}
                              min="0"
                            />
                          </td>
                          <td className="py-2 px-4 text-right border border-gray-200">
                            AED {(item.quantity * item.rate).toLocaleString()}
                          </td>
                          <td className="py-2 px-4 text-center border border-gray-200">
                            <div 
                              className="w-4 h-4 inline cursor-pointer text-red-600 hover:text-red-800 ml-4"
                              onClick={() => currentInvoice.items.length > 1 && handleDeleteItem(item.id)}
                              style={{ opacity: currentInvoice.items.length <= 1 ? 0.5 : 1 }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-2">
                    <button 
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                      onClick={handleAddItem}
                    >
                      <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Item
                    </button>
                  </div>
                </div>
              </div>               
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Tax Settings</h3>
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">VAT Rate (%)</label>
                  <input 
                    type="number" 
                    className="input-field w-24" 
                    value={currentInvoice.taxRate}
                    onChange={handleTaxRateChange}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Terms & Notes</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Terms</label>
                    <textarea 
                      className="input-field" 
                      rows={2}
                      placeholder="Enter payment terms"
                      value={currentInvoice.terms || ''}
                      onChange={(e) => setCurrentInvoice({...currentInvoice, terms: e.target.value})}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea 
                      className="input-field" 
                      rows={2}
                      placeholder="Enter additional notes"
                      value={currentInvoice.notes || ''}
                      onChange={(e) => setCurrentInvoice({...currentInvoice, notes: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Amount: AED {currentInvoice.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">VAT ({currentInvoice.taxRate}%): AED {calculateTax(currentInvoice.amount, currentInvoice.taxRate).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                  <p className="text-sm font-medium">Grand Total: AED {calculateTotal(currentInvoice.amount, calculateTax(currentInvoice.amount, currentInvoice.taxRate)).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                </div>
                <div className="flex space-x-4">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handleSaveNew}
                  >
                    Create Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmation && currentInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p className="mb-6">Are you sure you want to delete invoice {currentInvoice.number}? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowDeleteConfirmation(false)}
                >
                  Cancel
                </button>
                <button 
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
  