# EmiraBooks - Comprehensive Accounting & Business Management Suite

EmiraBooks is a powerful and user-friendly accounting and business management application built with modern web technologies. Designed for small to medium-sized businesses, it provides all the essential tools needed to manage your financial operations efficiently.

## Overview

EmiraBooks is inspired by professional accounting software like TallyPrime, offering a comprehensive suite of financial management tools in a modern web interface. It allows businesses to track sales, purchases, inventory, and financial performance through an intuitive dashboard and detailed reports.

## Key Components

### Dashboard

The Dashboard provides a real-time overview of your business's financial health:

- **Financial Summary**: View key metrics including total revenue (AED 135,000), outstanding invoices (AED 32,000), and inventory value (AED 765,000)
- **Welcome Section**: Personalized greeting and business overview for the day
- **Inventory Analysis**: Interactive charts showing inventory value and quantity comparison by product category
- **Performance Metrics**: Visual representation of key business metrics with color-coded indicators
- **Recent Transactions**: Quick access to the latest financial activities
- **Cash Flow Widget**: Monitor cash inflows and outflows at a glance

### Invoicing

Comprehensive invoice management to handle all your sales documentation:

- **Invoice Dashboard**: Overview of total sales (AED 56,000), pending amounts (AED 20,000), and overdue amounts (AED 12,000)
- **Invoice Types**: Toggle between sales invoices and purchase invoices
- **Invoice List**: Detailed list of invoices with ID, customer, date, amount, and status
- **Status Tracking**: Color-coded status indicators (Pending, Paid, Overdue) for easy identification
- **Action Controls**: View, edit, and delete options for each invoice
- **Filtering Options**: Filter by status and time period (e.g., Last 30 days)
- **Search Functionality**: Search box to quickly find specific invoices
- **Create New Invoice**: Dedicated button to create new sales invoices

### Accounting

Full-featured double-entry accounting system to manage all financial transactions:

- **Financial Overview**: Current balance (AED 120,000), total income (AED 135,000), and total expenses (AED 15,000)
- **General Ledger**: Chronological record of all financial transactions with date, description, debit, credit, and running balance
- **Transaction Details**: View complete transaction information including initial investment, expenses, and revenue
- **Transaction Management**: Add, edit, and delete capabilities for each transaction
- **Balance Calculation**: Automatic calculation of running balance after each transaction
- **Transaction Categories**: Categorized entries for better financial organization
- **Export Functionality**: Export financial data for reporting and analysis

### Inventory

Comprehensive inventory management to track stock and product performance:

- **Inventory Dashboard**: Overview of total products (5), total stock value (AED 765,000), and low stock items (0)
- **Product List**: Detailed table with product name, SKU, category, quantity, price, value, and reorder point
- **Product Categories**: Categorization by type (Electronics, Furniture, Office Supplies)
- **Value Calculation**: Automatic calculation of total value based on quantity and unit price
- **Stock Management**: Clear display of current quantities and reorder points
- **Search and Filter**: Search products and filter by category
- **Product Management**: Add, edit, and delete product capabilities
- **Low Stock Monitoring**: Visual indicators for items approaching reorder points

### Reports

Extensive reporting capabilities to gain insights into your business performance:

- **Report Categories**: Organized into Financial Reports, Tax Reports, and Inventory Reports
- **Financial Reports**:
  - Profit & Loss Statement: View income, expenses, and net profit
  - Balance Sheet: Overview of assets, liabilities, and equity
  - Cash Flow Statement: Track money coming in and going out of your business
- **Tax Reports**:
  - VAT Summary Report: Shows total VAT collected on sales and paid on purchases
  - VAT Return Report: Prepares data for quarterly VAT return filing
  - Corporate Tax Eligibility Report: Tracks taxable income and eligibility for corporate tax (9% for businesses exceeding AED 375,000)
- **Inventory Reports**:
  - Stock Summary: Overview of current inventory levels and values
  - Additional inventory analysis and reporting capabilities

### Settings

Customize EmiraBooks to meet your specific business requirements:

- **Company Profile**: Manage your business information and branding
- **User Management**: Control access with role-based permissions
- **Tax Settings**: Configure tax rates and rules
- **Currency Settings**: Set up multiple currencies and exchange rates (with AED as the default currency)
- **Invoice Templates**: Customize invoice appearance and required fields
- **Email Templates**: Configure automatic email notifications
- **Data Backup**: Schedule and manage regular data backups
- **Import/Export Tools**: Move data in and out of the system easily
- **API Integration**: Connect with other business tools and services

## Technologies Used

- React
- TypeScript
- React Router
- Tailwind CSS
- Chart.js
- Heroicons

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/emirabooks.git
cd emirabooks
```

2. Install dependencies
```
npm install
```

3. Set up environment variables
```
cp .env.example .env
```
Edit the `.env` file and add any required environment variables.

4. Start the development server
```
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

### Building for Production

To create a production build:

```
npm run build
```

The build artifacts will be stored in the `build/` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Icons provided by Heroicons
- UI components styled with Tailwind CSS 