export interface Assets {
  cash: number;
  accountsReceivable: number;
  inventory: number;
}

export interface Liabilities {
  accountsPayable: number;
}

export interface BalanceSheetData {
  assets: Assets;
  liabilities: Liabilities;
  equity: number;
  totalAssets: number;
  totalLiabilities: number;
  date: string;
}

export interface CashFlowActivities {
  inflows: number;
  outflows: number;
}

export interface CashFlowData {
  operatingActivities: CashFlowActivities;
  investingActivities: CashFlowActivities;
  financingActivities: CashFlowActivities;
  netOperatingCashFlow: number;
  netInvestingCashFlow: number;
  netFinancingCashFlow: number;
  netCashFlow: number;
  beginningCashBalance: number;
  endingCashBalance: number;
  date: string;
}

export interface VATSummaryData {
  salesVAT: number;
  purchaseVAT: number;
  netVATPayable: number;
  totalSales: number;
  totalPurchases: number;
  salesInvoices: any[];
  purchaseInvoices: any[];
}

export interface CorporateTaxData {
  totalRevenue: number;
  isEligible: boolean;
  taxAmount: number;
  revenueByCustomer: Record<string, number>;
  monthlyRevenue: Record<string, number>;
  projectedRevenue: number;
}

export interface InvoiceReportData {
  invoices: any[];
  totalAmount: number;
  totalVAT: number;
  groupedInvoices: Record<string, {
    invoices: any[];
    totalAmount: number;
    totalVAT: number;
  }>;
}

export interface StockSummaryData {
  inventory: any[];
  totalValue: number;
  lowStockItems: any[];
  byCategory: Record<string, {
    items: any[];
    totalValue: number;
    totalQuantity: number;
  }>;
}

export interface StockMovementData {
  movements: any[];
  totalProducts: number;
  lowStockAlert: number;
  byCategory: Record<string, {
    items: any[];
    totalMovement: number;
  }>;
}

export interface AccountingReportData {
  income: number;
  expenses: number;
  netProfit: number;
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
  transactions: any[];
}

export type ReportData = 
  | { type: 'balanceSheet'; data: BalanceSheetData }
  | { type: 'cashFlow'; data: CashFlowData }
  | { type: 'vatSummary'; data: VATSummaryData }
  | { type: 'corporateTax'; data: CorporateTaxData }
  | { type: 'salesInvoice' | 'purchaseInvoice'; data: InvoiceReportData }
  | { type: 'stockSummary'; data: StockSummaryData }
  | { type: 'stockMovement'; data: StockMovementData }
  | { type: 'profitLoss'; data: AccountingReportData }; 