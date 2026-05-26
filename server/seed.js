require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const URI = process.env.MONGO_URI || 'mongodb://localhost:27017/orderflow_db';

const customers = ['Alice Johnson','Bob Martinez','Carol White','David Chen','Emma Wilson','Frank Brown','Grace Lee','Henry Davis'];
const products  = ['Laptop Pro 15','Wireless Headphones','Mechanical Keyboard','4K Monitor','USB-C Hub','Webcam HD','Standing Desk','Ergonomic Chair','SSD 1TB','Gaming Mouse'];
const statuses  = ['pending','processing','shipped','delivered','cancelled'];
const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pick = a  => a[rand(0,a.length-1)];

const orders = Array.from({length:20},()=>({
  customerName: pick(customers),
  product:      pick(products),
  amount:       rand(50,5000),
  quantity:     rand(1,20),
  status:       pick(statuses),
  createdAt:    new Date(Date.now()-rand(0,30)*86400000)
}));

(async()=>{
  await mongoose.connect(URI);
  await Order.deleteMany({});
  await Order.insertMany(orders);
  console.log(`✅ Seeded ${orders.length} orders`);
  orders.slice(0,5).forEach((o,i)=>console.log(`  ${i+1}. ${o.customerName} | ${o.product} | $${o.amount} | ${o.status}`));
  await mongoose.disconnect();
})();
