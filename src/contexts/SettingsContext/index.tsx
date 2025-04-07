import React, { createContext, useContext, useState } from 'react';

export interface CompanyInfo {
  name: string;
  TRNNumber: string;
  address: string;
  logo: string;
}

interface SettingsContextType {
  companyInfo: CompanyInfo;
  setCompanyInfo: React.Dispatch<React.SetStateAction<CompanyInfo>>;
}

const defaultCompanyInfo: CompanyInfo = {
  name: 'TallyWeb',
  TRNNumber: '100123456700003',
  address: '123 Business Park, Main Street\nDubai, United Arab Emirates',
  logo: localStorage.getItem('companyLogo') || ''
};

export const SettingsContext = createContext<SettingsContextType>({
  companyInfo: defaultCompanyInfo,
  setCompanyInfo: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => {
    try {
      const savedInfo = localStorage.getItem('companyInfo');
      if (savedInfo) {
        return JSON.parse(savedInfo);
      }
    } catch (e) {
      console.error("Error loading company info from localStorage", e);
    }
    return defaultCompanyInfo;
  });

  React.useEffect(() => {
    localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
    if (companyInfo.logo) {
      localStorage.setItem('companyLogo', companyInfo.logo);
    }
  }, [companyInfo]);

  return (
    <SettingsContext.Provider value={{ companyInfo, setCompanyInfo }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Export both as named and default export
export { SettingsProvider as default }; 