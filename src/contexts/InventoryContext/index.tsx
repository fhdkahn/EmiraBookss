import React, { createContext, useContext, useState } from 'react';

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  reorderLevel: number;
  incomingStock?: number;
  outgoingStock?: number;
  lastUpdated?: string;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

const InventoryContext = createContext<InventoryContextType>({
  inventory: [],
  setInventory: () => {},
});

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 1, name: 'Product A', sku: 'SKU001', category: 'Electronics', quantity: 50, price: 5000, reorderLevel: 10 },
    { id: 2, name: 'Product B', sku: 'SKU002', category: 'Furniture', quantity: 30, price: 8500, reorderLevel: 5 },
    { id: 3, name: 'Product C', sku: 'SKU003', category: 'Electronics', quantity: 15, price: 6000, reorderLevel: 5 },
    { id: 4, name: 'Product D', sku: 'SKU004', category: 'Office Supplies', quantity: 100, price: 500, reorderLevel: 20 },
    { id: 5, name: 'Product E', sku: 'SKU005', category: 'Furniture', quantity: 10, price: 12000, reorderLevel: 2 },
  ]);

  return (
    <InventoryContext.Provider value={{ inventory, setInventory }}>
      {children}
    </InventoryContext.Provider>
  );
};

export default InventoryContext;
