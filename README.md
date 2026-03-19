# Orderflow — React Dashboard Builder

## Quick Start

### 1. Start MongoDB
```bash
# macOS:  brew services start mongodb-community
# Ubuntu: sudo systemctl start mongod
```

### 2. Backend
```bash
cd server
npm install
node seed.js     # Seeds 20 sample orders
npm run dev      # http://localhost:5000
```

### 3. Frontend
```bash
cd client
npm install
npm start        # http://localhost:3000
```

## Login
- **Email:** admin@orderflow.com
- **Password:** admin123

## Features
- **Login page** — Admin only, with demo autofill button
- **Orders page** — Create, edit (instant from row data), delete with right-click context menu + visible buttons, CSV export, Product/Day/Status/Customer filters
- **Dashboard page** — Configure Dashboard button always visible, Status/Period/Product filters, auto-refresh 30s, CSV export
- **Builder page** — Click widget → appears on canvas instantly, drag to reposition, resize from corners, hover for ⚙ settings / 🗑 delete, settings panel with field/aggregation/groupBy/chartType options
- **Widget types** — KPI Card, Bar, Line, Area, Scatter, Pie
- **Aggregations** — Sum, Average, Count × Amount, Quantity × Product, Customer, Status, None

## API
```
GET/POST        /api/orders
PUT/DELETE      /api/orders/:id
GET             /api/dashboard/admin
POST            /api/dashboard/save
GET             /api/analytics/data?field=amount&type=sum&groupBy=product&status=&days=&product=
GET             /api/analytics/kpi
GET             /api/analytics/products
```
