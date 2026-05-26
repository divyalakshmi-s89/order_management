const router = require('express').Router();
const Order  = require('../models/Order');

function buildMatch(q) {
  const match = {};
  if (q.status && q.status !== '')  match.status  = q.status;
  if (q.product && q.product !== '') match.product = q.product;
  if (q.days && !isNaN(+q.days)) {
    const d = new Date();
    d.setDate(d.getDate() - +q.days);
    d.setHours(0,0,0,0);
    match.createdAt = { $gte: d };
  }
  return match;
}

// GET /api/analytics/data?field=amount&type=sum&groupBy=product&status=&days=&product=
router.get('/data', async (req, res) => {
  try {
    const { field='amount', type='sum', groupBy='product' } = req.query;
    const match = buildMatch(req.query);
    let pipeline = [{ $match: match }];

    if (groupBy === 'none') {
      if (type === 'count') {
        pipeline.push({ $count: 'v' });
        const r = await Order.aggregate(pipeline);
        return res.json({ success:true, data:[{ _id:'Total', value: r[0]?.v||0 }] });
      }
      const op = type==='sum' ? {$sum:`$${field}`} : {$avg:`$${field}`};
      pipeline.push({ $group:{ _id:null, value:op } });
      const r = await Order.aggregate(pipeline);
      return res.json({ success:true, data:[{ _id:'Total', value: Math.round((r[0]?.value||0)*100)/100 }] });
    }

    const op = type==='count' ? {$sum:1} : type==='sum' ? {$sum:`$${field}`} : {$avg:`$${field}`};
    pipeline.push({ $group:{ _id:`$${groupBy}`, value:op } }, { $sort:{ value:-1 } }, { $limit:20 });
    const result = await Order.aggregate(pipeline);
    res.json({ success:true, data: result.map(r=>({ _id:r._id||'Unknown', value:Math.round((r.value||0)*100)/100 })) });
  } catch(e){ res.status(500).json({ success:false, error:e.message }); }
});

// GET /api/analytics/kpi
router.get('/kpi', async (req, res) => {
  try {
    const match = buildMatch(req.query);
    const [total, rev, qty, avg] = await Promise.all([
      Order.countDocuments(match),
      Order.aggregate([{$match:match},{$group:{_id:null,v:{$sum:'$amount'}}}]),
      Order.aggregate([{$match:match},{$group:{_id:null,v:{$sum:'$quantity'}}}]),
      Order.aggregate([{$match:match},{$group:{_id:null,v:{$avg:'$amount'}}}]),
    ]);
    res.json({ success:true, data:{ totalOrders:total, totalRevenue:rev[0]?.v||0, totalQuantity:qty[0]?.v||0, avgOrderValue:Math.round((avg[0]?.v||0)*100)/100 } });
  } catch(e){ res.status(500).json({ success:false, error:e.message }); }
});

// GET /api/analytics/products
router.get('/products', async (req, res) => {
  try {
    const products = await Order.distinct('product');
    res.json({ success:true, data: products.sort() });
  } catch(e){ res.status(500).json({ success:false, error:e.message }); }
});

module.exports = router;
