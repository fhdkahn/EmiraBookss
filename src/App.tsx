import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Import the Sidebar, layout and components
import Sidebar from './components/Sidebar/Sidebar';
import Layout from './components/layout/Layout';
import Dashboard from './components/Dashboard';
import { DashboardProvider } from './contexts/DashboardContext';
import { Invoices } from './components/invoices';
import { SearchContext, useSearch } from './contexts/SearchContext';
import { Accounting } from './components/accounting';
import { AccountingProvider } from './contexts/AccountingContext';
import { InvoicesProvider } from './contexts/InvoicesContext';
import { InventoryProvider } from './contexts/InventoryContext';
import Inventory from './components/inventory';
import { Reports } from './components/reports';
import { Settings } from './components/settings';
import { SettingsProvider } from './contexts/SettingsContext';

// Add TypeScript declarations for the external libraries
declare global {
  interface Window {
    jspdf: {
      jsPDF: any;
    };
    html2canvas: (element: HTMLElement) => Promise<HTMLCanvasElement>;
    html2pdf: (element: HTMLElement, options?: {
      margin?: number | number[];
      filename?: string;
      image?: { type: string; quality: number };
      html2canvas?: {
        scale?: number;
        useCORS?: boolean;
        letterRendering?: boolean;
        width?: number;
      };
      jsPDF?: {
        unit?: string;
        format?: string;
        orientation?: string;
        compress?: boolean;
      };
    }) => Promise<void>;
  }
}

// Create all contexts
const InventoryContext = createContext<{
  inventory: any[];
  setInventory: React.Dispatch<React.SetStateAction<any[]>>;
}>({
  inventory: [],
  setInventory: () => {},
});

// Define all hooks in one place
const useInventory = () => useContext(InventoryContext);

// Export hooks
export { useInventory };

const ArrowLeftOnRectangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const UserCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

// Main App Component
const App: React.FC = () => {
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  return (
    <SearchContext.Provider value={{ globalSearchQuery, setGlobalSearchQuery }}>
      <AccountingProvider>
        <InvoicesProvider>
          <InventoryProvider>
            <DashboardProvider>
              <SettingsProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<Layout><Dashboard /></Layout>} />
                    <Route path="/invoices" element={<Layout><Invoices /></Layout>} />
                    <Route path="/accounting" element={<Layout><Accounting /></Layout>} />
                    <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
                    <Route path="/reports" element={<Layout><Reports /></Layout>} />
                    <Route path="/settings" element={<Layout><Settings /></Layout>} />
                  </Routes>
                </Router>
              </SettingsProvider>
            </DashboardProvider>
          </InventoryProvider>
        </InvoicesProvider>
      </AccountingProvider>
    </SearchContext.Provider>
  );
};

export default App; 
