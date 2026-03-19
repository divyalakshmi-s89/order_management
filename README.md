Orderflow — Custom Dashboard Builder & Order Management

A full-stack web application for managing customer orders and building
customizable analytics dashboards with real-time data visualization.

 Live Demo

> Coming soon — deploying on Vercel + Render

Features

Authentication
- Secure admin login page
- Session stored in localStorage
- Protected routes — redirects to login if not authenticated
Order Management
- Create, edit, delete customer orders
- Right-click any row for quick actions (Edit / Delete)
- Instant edit — opens pre-filled form with zero delay
- Filter orders by Customer Name, Product, Status, Time Period
- Real-time summary: Total Orders, Total Revenue, Total Quantity
- Export filtered orders to CSV

 Dashboard Builder
- Drag and drop widgets onto a canvas
- Resize widgets from any corner
- 6 widget types: KPI Card, Bar Chart, Line Chart, Area Chart, Scatter Plot, Pie Chart
- Widget settings panel: Data Field, Aggregation, Group By, Chart Type, Color
- Aggregations: Sum, Average, Count
- Group By: Product, Customer, Status, Total
- Filter all widgets by Status, Time Period, Product
- Save dashboard layout to database
- Auto-refresh every 30 seconds
- Export dashboard summary to CSV

---
 Tech Stack

Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Router 6 | Page navigation |
| Recharts | Charts and graphs |
| React Grid Layout | Drag and drop grid |
| Axios | API calls |
| Papa Parse | CSV export |

 Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | REST API server |
| MongoDB | Database |
| Mongoose | Database modeling |

---

 Project Structure

```
orderflow/
├── client/                  # React frontend
│   ├── src/
│   │   ├── api/             # Axios API calls
│   │   ├── components/
│   │   │   ├── dashboard/   # Widget, Chart, Settings
│   │   │   ├── orders/      # Table, Form, Filters
│   │   │   └── ui/          # Modal, Toast, Confirm
│   │   ├── hooks/           # useAuth, useToast
│   │   ├── pages/           # Login, Dashboard, Builder, Orders
│   │   └── utils/           # Format, CSV helpers
│   └── package.json
│
└── server/                  # Express backend
    ├── models/              # MongoDB schemas
    ├── routes/              # API endpoints
    ├── seed.js              # Sample data
    └── index.js             # Server entry point
```

---

 Installation & Setup

 Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account

 1. Clone the repository
```bash
git clone https://github.com/divyalakshmi-s89/order_management.git
cd order_management
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/orderflow_db
NODE_ENV=development
```

Seed sample data (first time only):
```bash
node seed.js
```

Start the server:
```bash
npm run dev
```
Server runs on → http://localhost:5000
 3. Setup Frontend
```bash
cd ../client
npm install
npm start
```
App runs on → http://localhost:3000

---

 API Endpoints

 Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/orders | Get all orders |
| POST | /api/orders | Create new order |
| PUT | /api/orders/:id | Update order |
| DELETE | /api/orders/:id | Delete order |

 Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/dashboard/:userId | Load saved dashboard |
| POST | /api/dashboard/save | Save dashboard layout |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/analytics/data | Aggregated widget data |
| GET | /api/analytics/kpi | All KPI totals |
| GET | /api/analytics/products | Product list for filters |

---

 Database Schema

 Order
```js
{
  customerName: String,   // required
  product:      String,   // required
  amount:       Number,   // required, min: 0
  quantity:     Number,   // required, min: 1
  status:       String,   // pending | processing | shipped | delivered | cancelled
  createdAt:    Date,
  updatedAt:    Date
}
```
 Dashboard
```js
{
  userId:  String,
  widgets: [{
    id:     String,
    type:   String,   // kpi | bar | line | area | scatter | pie
    layout: { x, y, w, h, minW, minH },
    config: { title, field, aggregation, groupBy, chartType, color }
  }]
}
```

---

 Login Credentials

```
Email:    admin@orderflow.com
Password: admin123
```

---

