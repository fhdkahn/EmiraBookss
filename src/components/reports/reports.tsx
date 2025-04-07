import React, { useState, useEffect } from 'react';
import { useInvoices } from '../../contexts/InvoicesContext';
import { useInventory } from '../../contexts/InventoryContext';
import { useAccounting } from '../../contexts/AccountingContext';
import type {
  ReportData,
  BalanceSheetData,
  CashFlowData,
  VATSummaryData,
  CorporateTaxData,
  InvoiceReportData,
  StockSummaryData,
  StockMovementData,
  AccountingReportData
} from '../../types/reports';

// Define interfaces for type safety
interface ReportDateRange {
  startDate: string;
  endDate: string;
}

interface ReportData {
  type: string;
  data: any; // This will be typed more specifically based on report type
}

export const Reports: React.FC = () => {
    const { invoices } = useInvoices();
    const { inventory } = useInventory();
    const { ledgerEntries } = useAccounting();
    // Add this state for loading
    const [isLoading, setIsLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState<ReportType | ''>('');
    const [dateRange, setDateRange] = useState<ReportDateRange>({
      startDate: '2023-01-01',
      endDate: '2023-12-31'
    });
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  
    // Update report data when dependencies change
    useEffect(() => {
      if (selectedReport && showReportModal) {
        const data = generateReportData(selectedReport);
        setReportData(data);
      }
    }, [selectedReport, dateRange, ledgerEntries, showReportModal]);
  
    // Function to generate report data
    const generateReportData = (reportType) => {
      switch (reportType) {
        case 'profitLoss':
          return getAccountingReport('profitLoss', dateRange.startDate, dateRange.endDate);
        case 'balanceSheet':
          return calculateBalanceSheet(dateRange.startDate, dateRange.endDate);
        case 'cashFlow':
          return calculateCashFlow(dateRange.startDate, dateRange.endDate);
        case 'vatSummary':
          return calculateVATSummary(dateRange.startDate, dateRange.endDate);
        case 'corporateTax':
          return calculateCorporateTax(dateRange.startDate, dateRange.endDate);
        case 'salesInvoice':
          return getInvoiceReport('sales', dateRange.startDate, dateRange.endDate, statusFilter);
        case 'purchaseInvoice':
          return getInvoiceReport('purchase', dateRange.startDate, dateRange.endDate, statusFilter);
        case 'stockSummary':
          return getInventoryReport('stockSummary');
        case 'stockMovement':
          return getInventoryReport('stockMovement');
        default:
          return null;
      }
    };
  
    // Function to calculate Balance Sheet
    const calculateBalanceSheet = (startDate, endDate) => {
      // Ensure we have ledger entries data
      if (!ledgerEntries || ledgerEntries.length === 0) {
        return {
          message: "No ledger data available to generate Balance Sheet"
        };
      }
  
      // Filter entries within the date range
      const startTimestamp = new Date(startDate).getTime();
      const endTimestamp = new Date(endDate).getTime();
      
      const filteredEntries = ledgerEntries.filter(entry => {
        const entryTimestamp = new Date(entry.date).getTime();
        return entryTimestamp >= startTimestamp && entryTimestamp <= endTimestamp;
      });
  
      if (filteredEntries.length === 0) {
        return {
          message: "No ledger entries found in the selected date range"
        };
      }
  
      // Calculate assets, liabilities and equity
      const assets = {
        cash: filteredEntries[filteredEntries.length - 1].balance || 0,
        accountsReceivable: invoices
          .filter(inv => inv.type === 'sales' && inv.status === 'pending')
          .reduce((sum, inv) => sum + inv.amount, 0),
        inventory: inventory
          ? inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0)
          : 0
      };
  
      const liabilities = {
        accountsPayable: invoices
          .filter(inv => inv.type === 'purchase' && inv.status === 'pending')
          .reduce((sum, inv) => sum + inv.amount, 0)
      };
  
      // Calculate totals
      const totalAssets = assets.cash + assets.accountsReceivable + assets.inventory;
      const totalLiabilities = liabilities.accountsPayable;
      const equity = totalAssets - totalLiabilities;
  
      return {
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        date: endDate
      };
    };
  
    // Function to calculate Cash Flow Statement
    const calculateCashFlow = (startDate, endDate) => {
      // Ensure we have ledger entries data
      if (!ledgerEntries || ledgerEntries.length === 0) {
        return {
          message: "No ledger data available to generate Cash Flow Statement"
        };
      }
  
      // Filter entries within the date range
      const startTimestamp = new Date(startDate).getTime();
      const endTimestamp = new Date(endDate).getTime();
      
      const filteredEntries = ledgerEntries.filter(entry => {
        const entryTimestamp = new Date(entry.date).getTime();
        return entryTimestamp >= startTimestamp && entryTimestamp <= endTimestamp;
      });
  
      if (filteredEntries.length === 0) {
        return {
          message: "No ledger entries found in the selected date range"
        };
      }
  
      // Calculate operating activities
      const operatingActivities = {
        inflows: filteredEntries
          .filter(entry => entry.credit > 0 && entry.description.toLowerCase().includes('sales'))
          .reduce((sum, entry) => sum + entry.credit, 0),
        outflows: filteredEntries
          .filter(entry => entry.debit > 0 && (
            entry.description.toLowerCase().includes('expense') || 
            entry.description.toLowerCase().includes('purchase') ||
            entry.description.toLowerCase().includes('salary') ||
            entry.description.toLowerCase().includes('rent')
          ))
          .reduce((sum, entry) => sum + entry.debit, 0)
      };
  
      // Calculate investing activities
      const investingActivities = {
        inflows: filteredEntries
          .filter(entry => entry.credit > 0 && (
            entry.description.toLowerCase().includes('asset sale') ||
            entry.description.toLowerCase().includes('investment return')
          ))
          .reduce((sum, entry) => sum + entry.credit, 0),
        outflows: filteredEntries
          .filter(entry => entry.debit > 0 && (
            entry.description.toLowerCase().includes('asset purchase') ||
            entry.description.toLowerCase().includes('investment')
          ))
          .reduce((sum, entry) => sum + entry.debit, 0)
      };
  
      // Calculate financing activities
      const financingActivities = {
        inflows: filteredEntries
          .filter(entry => entry.credit > 0 && (
            entry.description.toLowerCase().includes('loan') ||
            entry.description.toLowerCase().includes('capital')
          ))
          .reduce((sum, entry) => sum + entry.credit, 0),
        outflows: filteredEntries
          .filter(entry => entry.debit > 0 && (
            entry.description.toLowerCase().includes('loan repayment') ||
            entry.description.toLowerCase().includes('dividend')
          ))
          .reduce((sum, entry) => sum + entry.debit, 0)
      };
  
      // Calculate net cash flows
      const netOperatingCashFlow = operatingActivities.inflows - operatingActivities.outflows;
      const netInvestingCashFlow = investingActivities.inflows - investingActivities.outflows;
      const netFinancingCashFlow = financingActivities.inflows - financingActivities.outflows;
      const netCashFlow = netOperatingCashFlow + netInvestingCashFlow + netFinancingCashFlow;
  
      // Get beginning and ending cash balances
      const beginningCashBalance = filteredEntries.length > 0 ? 
        (filteredEntries[0].balance - (filteredEntries[0].credit || 0) + (filteredEntries[0].debit || 0)) : 0;
      const endingCashBalance = filteredEntries.length > 0 ? 
        filteredEntries[filteredEntries.length - 1].balance : 0;
  
      return {
        operatingActivities,
        investingActivities,
        financingActivities,
        netOperatingCashFlow,
        netInvestingCashFlow,
        netFinancingCashFlow,
        netCashFlow,
        beginningCashBalance,
        endingCashBalance,
        date: endDate
      };
    };
  
    const handleReportClick = (reportType) => {
      setIsLoading(true); // Start loading
      setSelectedReport(reportType);
      setShowReportModal(true);
  
      // Initialize default data structure based on report type
      let initialData = null;
      switch (reportType) {
        case 'balanceSheet':
          initialData = {
            assets: { cash: 0, accountsReceivable: 0, inventory: 0 },
            liabilities: { accountsPayable: 0 },
            equity: 0,
            totalAssets: 0,
            totalLiabilities: 0,
            date: dateRange.endDate
          };
          break;
        case 'profitLoss':
          initialData = {
            income: 0,
            expenses: 0,
            netProfit: 0,
            incomeByCategory: {},
            expensesByCategory: {},
            transactions: []
          };
          break;
        case 'cashFlow':
          initialData = {
            operatingActivities: { inflows: 0, outflows: 0 },
            investingActivities: { inflows: 0, outflows: 0 },
            financingActivities: { inflows: 0, outflows: 0 },
            netOperatingCashFlow: 0,
            netInvestingCashFlow: 0,
            netFinancingCashFlow: 0,
            netCashFlow: 0,
            beginningCashBalance: 0,
            endingCashBalance: 0,
            date: dateRange.endDate
          };
          break;
      }
  
      // Set initial data structure
      setReportData(initialData);
  
      // Generate actual report data with a slight delay
      setTimeout(() => {
        const data = generateReportData(reportType);
        setReportData(data);
        setIsLoading(false); // End loading
      }, 100);
    };
  
    // Function to calculate VAT Summary
    const calculateVATSummary = (startDate, endDate) => {
      // Ensure we have invoices data
      if (!invoices || invoices.length === 0) {
        return {
          salesVAT: 0,
          purchaseVAT: 0,
          netVATPayable: 0,
          totalSales: 0,
          totalPurchases: 0,
          salesInvoices: [],
          purchaseInvoices: [],
          message: "No invoice data available"
        };
      }
  
      const salesInvoices = invoices.filter(inv => 
        inv.type === 'sales' && 
        inv.date >= startDate && 
        inv.date <= endDate
      );
      
      const purchaseInvoices = invoices.filter(inv => 
        inv.type === 'purchase' && 
        inv.date >= startDate && 
        inv.date <= endDate
      );
  
      const salesVAT = salesInvoices.reduce((total, inv) => {
        return total + (inv.amount * (inv.taxRate / 100));
      }, 0);
  
      const purchaseVAT = purchaseInvoices.reduce((total, inv) => {
        return total + (inv.amount * (inv.taxRate / 100));
      }, 0);
  
      const netVATPayable = salesVAT - purchaseVAT;
  
      return {
        salesVAT,
        purchaseVAT,
        netVATPayable,
        totalSales: salesInvoices.reduce((total, inv) => total + inv.amount, 0),
        totalPurchases: purchaseInvoices.reduce((total, inv) => total + inv.amount, 0),
        salesInvoices,
        purchaseInvoices
      };
    };
  
    // Function to calculate Corporate Tax
    const calculateCorporateTax = (startDate, endDate) => {
      // Ensure we have invoices data
      if (!invoices || invoices.length === 0) {
        return {
          totalRevenue: 0,
          isEligible: false,
          taxAmount: 0,
          revenueByCustomer: {},
          monthlyRevenue: {},
          projectedRevenue: 0,
          message: "No invoice data available"
        };
      }
  
      // Filter sales invoices within the date range
      const salesInvoices = invoices.filter(inv => 
        inv.type === 'sales' && 
        inv.date >= startDate && 
        inv.date <= endDate
      );
      
      // Calculate total revenue
      const totalRevenue = salesInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      
      // Check eligibility (threshold is 375,000 AED)
      const isEligible = totalRevenue > 375000;
      
      // Calculate tax amount (9% of revenue if eligible)
      const taxAmount = isEligible ? totalRevenue * 0.09 : 0;
      
      // Group revenue by customer
      const revenueByCustomer = salesInvoices.reduce((acc, inv) => {
        if (!acc[inv.customer]) {
          acc[inv.customer] = 0;
        }
        acc[inv.customer] += inv.amount;
        return acc;
      }, {});
      
      // Group revenue by month
      const monthlyRevenue = salesInvoices.reduce((acc, inv) => {
        const month = inv.date.substring(0, 7); // Format: YYYY-MM
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += inv.amount;
        return acc;
      }, {});
      
      // Calculate projected revenue (simple projection based on average monthly revenue)
      const monthsInRange = Object.keys(monthlyRevenue).length || 1;
      const projectedRevenue = (totalRevenue / monthsInRange) * 3; // 3 months projection
      
      return {
        totalRevenue,
        isEligible,
        taxAmount,
        revenueByCustomer,
        monthlyRevenue,
        projectedRevenue
      };
    };
  
    // Function to get invoice report data
    const getInvoiceReport = (type, startDate, endDate, status) => {
      // Ensure we have invoices data
      if (!invoices || invoices.length === 0) {
        return {
          invoices: [],
          totalAmount: 0,
          totalVAT: 0,
          groupedInvoices: {},
          message: "No invoice data available"
        };
      }
  
      let filteredInvoices = invoices.filter(inv => 
        inv.type === type && 
        inv.date >= startDate && 
        inv.date <= endDate
      );
  
      if (status !== 'All') {
        filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
      }
  
      // Calculate totals
      const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const totalVAT = filteredInvoices.reduce((sum, inv) => sum + (inv.amount * inv.taxRate / 100), 0);
  
      // Group by customer/vendor
      const groupedInvoices = filteredInvoices.reduce((acc, inv) => {
        if (!acc[inv.customer]) {
          acc[inv.customer] = {
            invoices: [],
            totalAmount: 0,
            totalVAT: 0
          };
        }
        acc[inv.customer].invoices.push(inv);
        acc[inv.customer].totalAmount += inv.amount;
        acc[inv.customer].totalVAT += (inv.amount * inv.taxRate / 100);
        return acc;
      }, {});
  
      return {
        invoices: filteredInvoices,
        totalAmount,
        totalVAT,
        groupedInvoices
      };
    };
  
    // Function to get inventory report data
    const getInventoryReport = (reportType) => {
      // Ensure we have inventory data
      if (!inventory || inventory.length === 0) {
        return {
          inventory: [],
          totalValue: 0,
          lowStockItems: [],
          byCategory: {},
          message: "No inventory data available"
        };
      }
  
      if (reportType === 'stockSummary') {
        // Calculate total stock value and group by categories
        const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const lowStockItems = inventory.filter(item => item.quantity < (item.reorderLevel || 20));
        
        // Group by category
        const byCategory = inventory.reduce((acc, item) => {
          const category = item.category || 'Uncategorized';
          if (!acc[category]) {
            acc[category] = {
              items: [],
              totalValue: 0,
              totalQuantity: 0
            };
          }
          acc[category].items.push(item);
          acc[category].totalValue += (item.quantity * item.price);
          acc[category].totalQuantity += item.quantity;
          return acc;
        }, {});
        
        return {
          inventory,
          totalValue,
          lowStockItems,
          byCategory
        };
      }
  
      if (reportType === 'stockMovement') {
        // Calculate inventory movements
        const movements = inventory.map(item => ({
          productName: item.name,
          sku: item.sku || '',
          currentQuantity: item.quantity,
          reorderLevel: item.reorderLevel || 20,
          lastUpdated: item.lastUpdated || new Date().toISOString(),
          incomingStock: item.incomingStock || 0,
          outgoingStock: item.outgoingStock || 0,
          category: item.category || 'Uncategorized'
        }));
      
        return {
          movements,
          totalProducts: inventory.length,
          lowStockAlert: movements.filter(item => item.currentQuantity < item.reorderLevel).length,
          byCategory: movements.reduce((acc, item) => {
            const category = item.category;
            if (!acc[category]) {
              acc[category] = {
                items: [],
                totalMovement: 0
              };
            }
            acc[category].items.push(item);
            acc[category].totalMovement += (item.incomingStock - item.outgoingStock);
            return acc;
          }, {})
        };
      }
         
      return null;
    };
  
    // Function to get accounting report data
    const getAccountingReport = (reportType, startDate, endDate) => {
      // Ensure we have ledger entries data
      if (!ledgerEntries || ledgerEntries.length === 0) {
        return {
          income: 0,
          expenses: 0,
          netProfit: 0,
          incomeByCategory: {},
          expensesByCategory: {},
          transactions: [],
          message: "No accounting data available"
        };
      }
  
      // Convert dates to timestamps for comparison
      const startTimestamp = new Date(startDate).getTime();
      const endTimestamp = new Date(endDate).getTime();
  
      // Filter transactions within the date range
      const filteredTransactions = ledgerEntries.filter(entry => {
        const entryTimestamp = new Date(entry.date).getTime();
        return entryTimestamp >= startTimestamp && entryTimestamp <= endTimestamp;
      });
  
      // Calculate totals
      const income = filteredTransactions.reduce((sum, entry) => sum + (entry.credit || 0), 0);
      const expenses = filteredTransactions.reduce((sum, entry) => sum + (entry.debit || 0), 0);
      const netProfit = income - expenses;
  
      // Group transactions by category
      const incomeByCategory = filteredTransactions
        .filter(entry => entry.credit > 0)
        .reduce((acc, entry) => {
          const category = entry.description || 'Uncategorized';
          acc[category] = (acc[category] || 0) + (entry.credit || 0);
          return acc;
        }, {});
  
      const expensesByCategory = filteredTransactions
        .filter(entry => entry.debit > 0)
        .reduce((acc, entry) => {
          const category = entry.description || 'Uncategorized';
          acc[category] = (acc[category] || 0) + (entry.debit || 0);
          return acc;
        }, {});
  
      return {
        income,
        expenses,
        netProfit,
        incomeByCategory,
        expensesByCategory,
        transactions: filteredTransactions,
      };
    };
  
    const exportToExcel = () => {
      if (!reportData) return;
  
      let csvContent = '';
      const separator = ',';
    
      switch (selectedReport) {
        case 'vatSummary':
          // VAT Summary Sheet
          csvContent = 'VAT Summary Report\n';
          csvContent += `Period: ${dateRange.startDate} to ${dateRange.endDate}\n\n`;
          csvContent += 'Category,Net Amount,VAT Amount,Total Amount\n';
          
          // Sales
          csvContent += `Sales,${reportData.totalSales},${reportData.salesVAT},${reportData.totalSales + reportData.salesVAT}\n`;
          // Purchases
          csvContent += `Purchases,${reportData.totalPurchases},${reportData.purchaseVAT},${reportData.totalPurchases + reportData.purchaseVAT}\n`;
          // Net VAT
          csvContent += `\nNet VAT Payable/Refundable,${reportData.netVATPayable}\n`;
          break;
  
        case 'corporateTax':
          // Corporate Tax Sheet
          csvContent = 'Corporate Tax Eligibility Report\n';
          csvContent += `Period: ${dateRange.startDate} to ${dateRange.endDate}\n\n`;
          csvContent += `Total Revenue,${reportData.totalRevenue}\n`;
          csvContent += `Tax Eligibility Threshold,375000\n`;
          csvContent += `Eligible for Corporate Tax,${reportData.isEligible ? 'Yes' : 'No'}\n`;
          csvContent += `Estimated Tax Amount (9%),${reportData.taxAmount}\n\n`;
          
          // Revenue Breakdown
          csvContent += '\nRevenue by Customer\n';
          csvContent += 'Customer,Revenue\n';
          Object.entries(reportData.revenueByCustomer).forEach(([customer, revenue]) => {
            csvContent += `${customer},${revenue}\n`;
          });
  
          // Monthly Trend
          csvContent += '\nMonthly Revenue Trend\n';
          csvContent += 'Month,Revenue\n';
          Object.entries(reportData.monthlyRevenue).forEach(([month, revenue]) => {
            csvContent += `${month},${revenue}\n`;
          });
  
          csvContent += `\nProjected Revenue (3 months),${reportData.projectedRevenue}\n`;
          break;
  
        case 'salesInvoice':
        case 'purchaseInvoice':
          // Invoice Report Sheet
          const type = selectedReport === 'salesInvoice' ? 'Sales' : 'Purchase';
          csvContent = `${type} Invoice Report\n`;
          csvContent += `Period: ${dateRange.startDate} to ${dateRange.endDate}\n`;
          csvContent += `Status Filter: ${statusFilter}\n\n`;
          
          // Summary
          csvContent += 'Summary\n';
          csvContent += `Total Invoices,${reportData.invoices.length}\n`;
          csvContent += `Total Amount,${reportData.totalAmount}\n`;
          csvContent += `Total VAT,${reportData.totalVAT}\n\n`;
          
          // Detailed Report
          csvContent += 'Customer/Vendor,Invoice Number,Date,Amount,VAT Amount,Total Amount,Status\n';
          Object.entries(reportData.groupedInvoices).forEach(([customer, data]) => {
            data.invoices.forEach(invoice => {
              const vatAmount = (invoice.amount * invoice.taxRate) / 100;
              csvContent += `${customer},${invoice.number},${invoice.date},${invoice.amount},${vatAmount},${invoice.amount + vatAmount},${invoice.status}\n`;
            });
          });
          
          // Subtotals by Customer/Vendor
          csvContent += '\nSubtotals by Customer/Vendor\n';
          csvContent += 'Customer/Vendor,Total Amount,Total VAT\n';
          Object.entries(reportData.groupedInvoices).forEach(([customer, data]) => {
            csvContent += `${customer},${data.totalAmount},${data.totalVAT}\n`;
          });
          break;
          
        case 'stockSummary':
          // Stock Summary Sheet
          csvContent = 'Inventory Stock Summary Report\n';
          csvContent += `Date: ${new Date().toISOString().split('T')[0]}\n\n`;
          csvContent += 'Summary\n';
          csvContent += `Total Products,${reportData.inventory.length}\n`;
          csvContent += `Total Stock Value,${reportData.totalValue}\n`;
          csvContent += `Low Stock Items,${reportData.lowStockItems.length}\n\n`;
          
          // Detailed Report
          csvContent += 'Product Name,SKU,Category,Quantity,Unit Price,Total Value\n';
          reportData.inventory.forEach(item => {
            csvContent += `${item.name},${item.sku || ''},${item.category || 'Uncategorized'},${item.quantity},${item.price},${item.quantity * item.price}\n`;
          });
          
          // Category Breakdown
          csvContent += '\nCategory Breakdown\n';
          csvContent += 'Category,Total Products,Total Quantity,Total Value\n';
          Object.entries(reportData.byCategory).forEach(([category, data]) => {
            csvContent += `${category},${data.items.length},${data.totalQuantity},${data.totalValue}\n`;
          });
          break;
          
        case 'stockMovement':
          // Stock Movement Sheet
          csvContent = 'Inventory Stock Movement Report\n';
          csvContent += `Date: ${new Date().toISOString().split('T')[0]}\n\n`;
          csvContent += 'Summary\n';
          csvContent += `Total Products,${reportData.totalProducts}\n`;
          csvContent += `Low Stock Alerts,${reportData.lowStockAlert}\n\n`;
            
          // Detailed Movement Report
          csvContent += 'Product Name,SKU,Category,Current Quantity,Incoming Stock,Outgoing Stock,Net Movement,Last Updated\n';
          reportData.movements.forEach(item => {
            const netMovement = item.incomingStock - item.outgoingStock;
            csvContent += `${item.productName},${item.sku},${item.category},${item.currentQuantity},${item.incomingStock},${item.outgoingStock},${netMovement},${item.lastUpdated}\n`;
          });
            
          // Category Movement Breakdown
          csvContent += '\nCategory Movement Breakdown\n';
          csvContent += 'Category,Total Products,Net Movement\n';
          Object.entries(reportData.byCategory).forEach(([category, data]) => {
            csvContent += `${category},${data.items.length},${data.totalMovement}\n`;
          });
          break;
        
        case 'profitLoss':
          // Profit & Loss Sheet
          csvContent = 'Profit & Loss Statement\n';
          csvContent += `Period: ${dateRange.startDate} to ${dateRange.endDate}\n\n`;
          csvContent += 'Summary\n';
          csvContent += `Total Income,${reportData.income}\n`;
          csvContent += `Total Expenses,${reportData.expenses}\n`;
          csvContent += `Net Profit/Loss,${reportData.netProfit}\n\n`;
          
          // Income Breakdown
          csvContent += '\nIncome by Category\n';
          csvContent += 'Category,Amount\n';
          Object.entries(reportData.incomeByCategory).forEach(([category, amount]) => {
            csvContent += `${category},${amount}\n`;
          });
          
          // Expense Breakdown
          csvContent += '\nExpenses by Category\n';
          csvContent += 'Category,Amount\n';
          Object.entries(reportData.expensesByCategory).forEach(([category, amount]) => {
            csvContent += `${category},${amount}\n`;
          });
          break;
  
        case 'balanceSheet':
          // Balance Sheet
          csvContent = 'Balance Sheet\n';
          csvContent += `As of: ${reportData.date}\n\n`;
          
          // Assets
          csvContent += 'Assets\n';
          csvContent += 'Category,Amount\n';
          csvContent += `Cash,${reportData.assets.cash}\n`;
          csvContent += `Accounts Receivable,${reportData.assets.accountsReceivable}\n`;
          csvContent += `Inventory,${reportData.assets.inventory}\n`;
          csvContent += `Total Assets,${reportData.totalAssets}\n\n`;
          
          // Liabilities
          csvContent += 'Liabilities\n';
          csvContent += 'Category,Amount\n';
          csvContent += `Accounts Payable,${reportData.liabilities.accountsPayable}\n`;
          csvContent += `Total Liabilities,${reportData.totalLiabilities}\n\n`;
          
          // Equity
          csvContent += 'Equity\n';
          csvContent += `Total Equity,${reportData.equity}\n`;
          break;
      }
  
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedReport}_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Financial Reports</h3>
            <ul className="space-y-2">
              <li 
                className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => handleReportClick('profitLoss')}
              >
                <p className="font-medium">Profit & Loss Statement</p>
                <p className="text-sm text-gray-500">View your business performance</p>
              </li>
                          <li 
                className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => handleReportClick('balanceSheet')}
              >
                <p className="font-medium">Balance Sheet</p>
                <p className="text-sm text-gray-500">View your financial position</p>
              </li>
              <li 
                className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => handleReportClick('cashFlow')}
              >
                <p className="font-medium">Cash Flow Statement</p>
                <p className="text-sm text-gray-500">Track your cash movements</p>
              </li>
            </ul>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700 mb-4">VAT & Corporate Tax Reports</h3>
            <ul className="space-y-2">
              <li 
                className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => handleReportClick('vatSummary')}
              >
                <p className="font-medium">VAT Summary Report</p>
                <p className="text-sm text-gray-500">Shows total VAT collected (on sales invoices) and total VAT paid (on purchase invoices) in a given period</p>
              </li>
              <li 
                className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => handleReportClick('vatReturn')}
              >
                <p className="font-medium">VAT Return Report</p>
                <p className="text-sm text-gray-500">Prepares data needed for quarterly VAT return filing (total taxable sales, purchases, VAT payable, and refundable)</p>
              </li>
              <li 
                className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => handleReportClick('salesInvoice')}
              >
                <p className="font-medium">Sales Invoice Report</p>
                <p className="text-sm text-gray-500">Lists all sales invoices, including VAT collected</p>
              </li>
              <li 
                className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => handleReportClick('purchaseInvoice')}
              >
                <p className="font-medium">Purchase Invoice Report</p>
                <p className="text-sm text-gray-500">Lists all purchase invoices, including VAT paid</p>
              </li>
              <li 
                className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => handleReportClick('corporateTax')}
              >
                <p className="font-medium">Corporate Tax Eligibility Report</p>
                <p className="text-sm text-gray-500">Tracks total taxable income and shows whether the business exceeds AED 375,000, making it eligible for corporate tax (9%)</p>
              </li>
            </ul>
          </div>
  
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Inventory Reports</h3>
            <ul className="space-y-2">
              <li 
                className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => handleReportClick('stockSummary')}
              >
                <p className="font-medium">Stock Summary</p>
                <p className="text-sm text-gray-500">View current stock levels</p>
              </li>
              <li 
                className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => handleReportClick('stockMovement')}
              >
                <p className="font-medium">Stock Movement</p>
                <p className="text-sm text-gray-500">Track inventory changes over time</p>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Report Modal */}
        {showReportModal && reportData && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
            <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="inline-block align-top bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedReport === 'vatSummary' ? 'VAT Summary Report' : 
                       selectedReport === 'corporateTax' ? 'Corporate Tax Eligibility Report' :
                       selectedReport === 'salesInvoice' ? 'Sales Invoice Report' :
                       selectedReport === 'purchaseInvoice' ? 'Purchase Invoice Report' :
                       selectedReport === 'stockSummary' ? 'Stock Summary Report' :
                       selectedReport === 'stockMovement' ? 'Stock Movement Report' :
                       selectedReport === 'profitLoss' ? 'Profit & Loss Statement' :
                       selectedReport === 'balanceSheet' ? 'Balance Sheet' :
                       'Cash Flow Statement'}
                    </h2>
                    <button 
                      onClick={() => setShowReportModal(false)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
  
                  <div className="mb-6 flex flex-wrap gap-4">
                    {selectedReport !== 'stockSummary' && selectedReport !== 'stockMovement' && (
                      <>
                        <div className="w-full sm:w-auto">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                          />
                        </div>
                        <div className="w-full sm:w-auto">
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                          />
                        </div>
                      </>
                    )}
                    
                    {(selectedReport === 'salesInvoice' || selectedReport === 'purchaseInvoice') && (
                      <div className="w-full sm:w-auto">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Paid' | 'Pending' | 'Overdue')}
                        >
                          <option value="All">All Statuses</option>
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>
                    )}
                    
                    <div className="w-full sm:w-auto flex items-end">
                      <button 
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={exportToExcel}
                      >
                        Export to Excel
                      </button>
                    </div>
                  </div>
  
                  <div className="overflow-x-auto">
                    {/* Display report content based on selected report type */}
                    {reportData.message ? (
                      <div className="text-center py-10">
                        <p className="text-lg text-gray-500">{reportData.message}</p>
                      </div>
                    ) : (
                      <div>
                        {/* Debug information */}
                        <div className="bg-gray-100 p-4 mb-4 rounded">
                          <h3 className="font-medium mb-2">Debug Information:</h3>
                          <p>Date Range: {dateRange.startDate} to {dateRange.endDate}</p>
                          {selectedReport === 'profitLoss' && (
                            <>
                              <p>Filtered Transactions: {reportData.transactions ? reportData.transactions.length : 0}</p>
                              <p>Total Income: {reportData.income}</p>
                              <p>Total Expenses: {reportData.expenses}</p>
                              <p>Net Profit/Loss: {reportData.netProfit}</p>
                            </>
                          )}
                          {selectedReport === 'balanceSheet' && (
                            <>
                              <p>Total Assets: {reportData.totalAssets}</p>
                              <p>Total Liabilities: {reportData.totalLiabilities}</p>
                              <p>Total Equity: {reportData.equity}</p>
                            </>
                          )}
                          {selectedReport === 'cashFlow' && (
                            <>
                              <p>Beginning Cash Balance: {reportData.beginningCashBalance}</p>
                              <p>Net Cash Flow: {reportData.netCashFlow}</p>
                              <p>Ending Cash Balance: {reportData.endingCashBalance}</p>
                            </>
                          )}
                        </div>
                        
                        {selectedReport === 'profitLoss' && (
                          <div className="bg-white overflow-hidden border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={2}>
                                    Profit & Loss Statement
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={2}>
                                    Summary
                                  </td>
                                  <td></td>
                                </tr>
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                                    Total Income
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                    {reportData.income.toLocaleString()}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                                    Total Expenses
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                    {reportData.expenses.toLocaleString()}
                                  </td>
                                </tr>
                                <tr className="bg-green-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={2}>
                                    Net Profit/Loss
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                    {reportData.netProfit.toLocaleString()}
                                  </td>
                                </tr>
                                
                                {/* Income by Category */}
                                <tr className="bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={3}>
                                    Income by Category
                                  </td>
                                </tr>
                                {Object.entries(reportData.incomeByCategory).map(([category, amount], index) => (
                                  <tr key={`income-${index}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                                      {category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                      {amount.toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                                
                                {/* Expenses by Category */}
                                <tr className="bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={3}>
                                    Expenses by Category
                                  </td>
                                </tr>
                                {Object.entries(reportData.expensesByCategory).map(([category, amount], index) => (
                                  <tr key={`expense-${index}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                                      {category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                      {amount.toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        
                        {selectedReport === 'balanceSheet' && (
                          <div className="bg-white overflow-hidden border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={2}>
                                    Balance Sheet
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={3}>
                                    Assets
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                                    Cash
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                    {reportData.assets.cash.toLocaleString()}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                                    Accounts Receivable
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                    {reportData.assets.accountsReceivable.toLocaleString()}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                                    Inventory
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                    {reportData.assets.inventory.toLocaleString()}
                                  </td>
                                </tr>
                                <tr className="bg-blue-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={2}>
                                    Total Assets
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                    {reportData.totalAssets.toLocaleString()}
                                  </td>
                                </tr>
                                
                                <tr className="bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={3}>
                                    Liabilities
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                                    Accounts Payable
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                    {reportData.liabilities.accountsPayable.toLocaleString()}
                                  </td>
                                </tr>
                                <tr className="bg-blue-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={2}>
                                    Total Liabilities
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                    {reportData.totalLiabilities.toLocaleString()}
                                  </td>
                                </tr>
                                
                                <tr className="bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={3}>
                                    Equity
                                  </td>
                                </tr>
                                <tr className="bg-green-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={2}>
                                    Total Equity
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                    {reportData.equity.toLocaleString()}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}
                        {selectedReport === 'cashFlow' && (
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={2}>
                                  Category
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              <tr className="bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={3}>
                                  Beginning Cash Balance
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                                  Cash at Start of Period
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {reportData.beginningCashBalance.toLocaleString()}
                                </td>
                              </tr>
                              
                              <tr className="bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={3}>
                                  Operating Activities
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                                  Cash Inflows
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {reportData.operatingActivities.inflows.toLocaleString()}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                                  Cash Outflows
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {reportData.operatingActivities.outflows.toLocaleString()}
                                </td>
                              </tr>
                              <tr className="bg-blue-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={2}>
                                  Net Operating Cash Flow
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                  {reportData.netOperatingCashFlow.toLocaleString()}
                                </td>
                              </tr>
                              
                              <tr className="bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={3}>
                                  Investing Activities
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                                  Cash Inflows
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {reportData.investingActivities.inflows.toLocaleString()}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                                  Cash Outflows
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {reportData.investingActivities.outflows.toLocaleString()}
                                </td>
                              </tr>
                              <tr className="bg-blue-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={2}>
                                  Net Investing Cash Flow
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                  {reportData.netInvestingCashFlow.toLocaleString()}
                                </td>
                              </tr>
                              
                              <tr className="bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={3}>
                                  Financing Activities
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                                  Cash Inflows
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {reportData.financingActivities.inflows.toLocaleString()}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                                  Cash Outflows
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {reportData.financingActivities.outflows.toLocaleString()}
                                </td>
                              </tr>
                              <tr className="bg-blue-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={2}>
                                  Net Financing Cash Flow
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                  {reportData.netFinancingCashFlow.toLocaleString()}
                                </td>
                              </tr>
                              
                              <tr className="bg-green-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={2}>
                                  Net Cash Flow
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                  {reportData.netCashFlow.toLocaleString()}
                                </td>
                              </tr>
                              
                              <tr className="bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={3}>
                                  Ending Cash Balance
                                </td>
                              </tr>
                              <tr className="bg-blue-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={2}>
                                  Cash at End of Period
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                  {reportData.endingCashBalance.toLocaleString()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
export default Reports;
  