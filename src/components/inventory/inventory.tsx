import React, { useState } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useInventory } from '../../contexts/InventoryContext';

const Inventory: React.FC = () => {
    const { globalSearchQuery } = useSearch();
    const { inventory, setInventory } = useInventory();
    
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [customCategory, setCustomCategory] = useState('');
    
    // Use global search query if available, otherwise use local search
    const effectiveSearchQuery = globalSearchQuery || localSearchQuery;
    
    // Filter inventory based on search query and category filter
    const filteredInventory = inventory.filter(item => {
      // Search query filter
      const matchesSearch = effectiveSearchQuery === '' || 
        item.name.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
        item.price.toString().includes(effectiveSearchQuery) ||
        item.quantity.toString().includes(effectiveSearchQuery);
      
      // Category filter
      const matchesCategory = categoryFilter === 'All Categories' || item.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
    
    // Update local search when global search changes
    React.useEffect(() => {
      if (globalSearchQuery) {
        setLocalSearchQuery('');
      }
    }, [globalSearchQuery]);
  
    const handleEdit = (item: any) => {
      setCurrentItem({...item});
      setCustomCategory(item.category !== 'Electronics' && item.category !== 'Furniture' && item.category !== 'Stationery' ? item.category : '');
      setShowEditModal(true);
    };
  
    const handleDelete = (item: any) => {
      setCurrentItem(item);
      setShowDeleteModal(true);
    };
  
    const handleAdd = () => {
      setCurrentItem({
        id: inventory.length + 1,
        name: '',
        sku: `SKU00${inventory.length + 1}`,
        category: 'Electronics',
        quantity: 0,
        price: 0,
        reorderLevel: 20,
        incomingStock: 0,
        outgoingStock: 0,
        lastUpdated: new Date().toISOString()
      });
      setCustomCategory('');
      setShowAddModal(true);
    };
  
    const confirmDelete = () => {
      if (currentItem) {
        setInventory(inventory.filter(item => item.id !== currentItem.id));
        setShowDeleteModal(false);
      }
    };
  
    const handleSaveEdit = () => {
      if (currentItem) {
        // If "Other" is selected, use the custom category
        if (currentItem.category === 'Other' && customCategory.trim() !== '') {
          setInventory(inventory.map(item => 
            item.id === currentItem.id 
              ? {...currentItem, category: customCategory.trim()} 
              : item
          ));
        } else {
          setInventory(inventory.map(item => item.id === currentItem.id ? currentItem : item));
        }
        setShowEditModal(false);
      }
    };
  
    const handleSaveNew = () => {
      // If "Other" is selected, use the custom category
      if (currentItem.category === 'Other' && customCategory.trim() !== '') {
        setInventory([...inventory, {...currentItem, category: customCategory.trim()}]);
      } else {
        setInventory([...inventory, currentItem]);
      }
      setShowAddModal(false);
    };
  
    // Get unique categories for the filter dropdown
    const uniqueCategories = Array.from(new Set(inventory.map(item => item.category)));
  
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <button className="btn-primary" onClick={handleAdd}>Add Product</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="Top-cards">
            <h3 className="text-lg font-medium text-gray-700">Total Products</h3>
            <p className="text-3xl font-bold mt-2">{inventory.length}</p>
          </div>
          <div className="Top-cards">
            <h3 className="text-lg font-medium text-gray-700">Total Stock Value</h3>
            <p className="text-3xl font-bold mt-2">AED {inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()}</p>
          </div>
          <div className="Top-cards">
            <h3 className="text-lg font-medium text-gray-700">Low Stock Items</h3>
            <p className="text-3xl font-bold mt-2 text-yellow-600">
              {inventory.filter(item => item.quantity < (item.reorderLevel || 20)).length}
              </p>
          </div>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">Product List</h3>
            <div className="flex space-x-2">
              <select 
                className="input-field" 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Stationery</option>
                {uniqueCategories
                  .filter(cat => cat !== 'Electronics' && cat !== 'Furniture' && cat !== 'Stationery')
                  .map((category, index) => (
                    <option key={index}>{category}</option>
                  ))
                }
              </select>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ position: 'relative', zIndex: 1 }}
                />
              </div>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Price (AED)</th>
                  <th>Value (AED)</th>
                  <th>Stock Movement</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className={item.quantity < (item.reorderLevel || 20) ? 'bg-yellow-100 hover:bg-yellow-200 border-l-4 border-yellow-500' : 'hover:bg-gray-50'}>
                    <td>{item.name}</td>
                    <td>{item.sku}</td>
                    <td>{item.category}</td>
                    <td className={item.quantity < 20 ? 'text-yellow-600 font-bold' : ''}>{item.quantity}</td>
                    <td>{item.price.toLocaleString()}</td>
                    <td>{(item.quantity * item.price).toLocaleString()}</td>
                    <td>
                      <span className="text-green-600">+{item.incomingStock || 0}</span>
                      <span className="mx-1">/</span>
                      <span className="text-red-600">-{item.outgoingStock || 0}</span>
                      </td>
                      <td>{new Date(item.lastUpdated || Date.now()).toLocaleDateString()}</td>
  
                    <td>
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(item)}
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
  
        {/* Edit Product Modal */}
        {showEditModal && currentItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" style={{ zIndex: 9999 }}>
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-md relative"
              style={{
                maxHeight: '90vh',
                margin: '20px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Close button */}
              <button 
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 40px)' }}>
                <h2 className="text-xl font-bold mb-4 border-b pb-3">Edit Product</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={currentItem.name}
                      onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={currentItem.sku}
                      onChange={(e) => setCurrentItem({...currentItem, sku: e.target.value})}
                    />
                  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
    <input 
      type="number" 
      className="input-field" 
      value={currentItem.reorderLevel || 20}
      onChange={(e) => setCurrentItem({...currentItem, reorderLevel: Number(e.target.value)})}
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Incoming Stock</label>
    <input 
      type="number" 
      className="input-field" 
      value={currentItem.incomingStock || 0}
      onChange={(e) => setCurrentItem({...currentItem, incomingStock: Number(e.target.value)})}
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Outgoing Stock</label>
    <input 
      type="number" 
      className="input-field" 
      value={currentItem.outgoingStock || 0}
      onChange={(e) => setCurrentItem({...currentItem, outgoingStock: Number(e.target.value)})}
    />
  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      className="input-field"
                      value={currentItem.category === 'Electronics' || currentItem.category === 'Furniture' || currentItem.category === 'Stationery' ? currentItem.category : 'Other'}
                      onChange={(e) => setCurrentItem({...currentItem, category: e.target.value})}
                    >
                      <option>Electronics</option>
                      <option>Furniture</option>
                      <option>Stationery</option>
                      <option>Other</option>
                    </select>
                  </div>
                  {(currentItem.category === 'Other' || 
                    (currentItem.category !== 'Electronics' && 
                     currentItem.category !== 'Furniture' && 
                     currentItem.category !== 'Stationery')) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custom Category</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter custom category"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({...currentItem, quantity: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={currentItem.price}
                      onChange={(e) => setCurrentItem({...currentItem, price: Number(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handleSaveEdit}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" style={{ zIndex: 9999 }}>
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-md relative"
              style={{
                maxHeight: '90vh',
                margin: '20px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Close button */}
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 40px)' }}>
                <h2 className="text-xl font-bold mb-4 border-b pb-3">Add New Product</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={currentItem.name}
                      onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={currentItem.sku}
                      onChange={(e) => setCurrentItem({...currentItem, sku: e.target.value})}
                    />
                  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
    <input 
      type="number" 
      className="input-field" 
      value={currentItem.reorderLevel || 20}
      onChange={(e) => setCurrentItem({...currentItem, reorderLevel: Number(e.target.value)})}
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Incoming Stock</label>
    <input 
      type="number" 
      className="input-field" 
      value={currentItem.incomingStock || 0}
      onChange={(e) => setCurrentItem({...currentItem, incomingStock: Number(e.target.value)})}
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Outgoing Stock</label>
    <input 
      type="number" 
      className="input-field" 
      value={currentItem.outgoingStock || 0}
      onChange={(e) => setCurrentItem({...currentItem, outgoingStock: Number(e.target.value)})}
    />
  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      className="input-field"
                      value={currentItem.category}
                      onChange={(e) => setCurrentItem({...currentItem, category: e.target.value})}
                    >
                      <option>Electronics</option>
                      <option>Furniture</option>
                      <option>Stationery</option>
                      <option>Other</option>
                    </select>
                  </div>
                  {currentItem.category === 'Other' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custom Category</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter custom category"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({...currentItem, quantity: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={currentItem.price}
                      onChange={(e) => setCurrentItem({...currentItem, price: Number(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handleSaveNew}
                  >
                    Add Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {/* Delete Confirmation Modal */}
        {showDeleteModal && currentItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" style={{ zIndex: 9999 }}>
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-md relative"
              style={{
                maxHeight: '90vh',
                margin: '20px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Close button */}
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 40px)' }}>
                <h2 className="text-xl font-bold mb-4 border-b pb-3">Confirm Delete</h2>
                <p className="mb-6">Are you sure you want to delete <span className="font-medium">{currentItem.name}</span>? This action cannot be undone.</p>
                
                <div className="flex justify-end space-x-4">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
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

export default Inventory;