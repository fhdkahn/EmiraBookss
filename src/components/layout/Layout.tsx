import React from 'react';
import Sidebar from '../Sidebar';

const Header = () => {
  return (
    <header className="bg-blue-100 border-b border-gray-200 h-16 fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-6">
      <div className="flex items-center">
      </div>
    </header>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-4 mt-10">{children}</main>
      </div>
    </div>
  );
};

export default Layout;