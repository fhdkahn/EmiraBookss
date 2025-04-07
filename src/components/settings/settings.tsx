import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const Settings: React.FC = () => {
  const { companyInfo, setCompanyInfo } = useSettings();
  const [editMode, setEditMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditMode(false);
  };

  return (
    <div className="card2">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Company Profile
          </h3>
          
          {editMode ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">TRN Number</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={companyInfo.TRNNumber}
                  onChange={(e) => setCompanyInfo({...companyInfo, TRNNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  rows={3} 
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                <div className="flex items-center space-x-4">
                  {companyInfo.logo && (
                    <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                      <img 
                        src={companyInfo.logo} 
                        alt="Company logo" 
                        className="object-contain w-full h-full"
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md"
                        onClick={() => setCompanyInfo({...companyInfo, logo: ''})}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <label className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Upload Logo
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setCompanyInfo({...companyInfo, logo: reader.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="flex space-x-4">
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Company Name</p>
                <p className="text-gray-800">{companyInfo.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">TRN Number</p>
                <p className="text-gray-800">{companyInfo.TRNNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Address</p>
                <p className="text-gray-800 whitespace-pre-line">{companyInfo.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Company Logo</p>
                {companyInfo.logo ? (
                  <div className="w-24 h-24 border rounded-md overflow-hidden">
                    <img 
                      src={companyInfo.logo} 
                      alt="Company logo" 
                      className="object-contain w-full h-full"
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No logo uploaded</p>
                )}
              </div>
              <div>
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-700 mb-4">User Management</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium">Jane Smith</p>
                <p className="text-sm text-gray-500">Accountant</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Add User
            </button>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>April - March</option>
                <option>January - December</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency Format</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>₹ 1,234.56</option>
                <option>1,234.56 ₹</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <button 
              type="button" 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;