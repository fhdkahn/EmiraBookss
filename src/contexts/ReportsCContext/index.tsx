import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ReportContextType {
  reports: any[]; // Replace with proper type
  addReport: (report: any) => void;
  removeReport: (id: string) => void;
  updateReport: (id: string, data: any) => void;
}

const ReportsContext = createContext<ReportContextType | undefined>(undefined);

interface ReportsProviderProps {
  children: ReactNode;
}

export const ReportsProvider: React.FC<ReportsProviderProps> = ({ children }) => {
  const [reports, setReports] = useState<any[]>([]);

  const addReport = (report: any) => {
    setReports(prev => [...prev, report]);
  };

  const removeReport = (id: string) => {
    setReports(prev => prev.filter(report => report.id !== id));
  };

  const updateReport = (id: string, data: any) => {
    setReports(prev => prev.map(report => 
      report.id === id ? { ...report, ...data } : report
    ));
  };

  return (
    <ReportsContext.Provider value={{ reports, addReport, removeReport, updateReport }}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};

export default ReportsProvider;
