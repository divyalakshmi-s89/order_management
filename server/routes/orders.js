const router = require('express').Router();
const Order  = require('../models/Order');

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { customerName, product, amount, quantity, status } = req.body;
    if (!customerName || !product || amount == null || quantity == null)
      return res.status(400).json({ success: false, error: 'All fields required' });
    const order = await Order.create({ customerName, product, amount: +amount, quantity: +quantity, status });
    res.status(201).json({ success: true, data: order });
  } catch (e) {
    if (e.name === 'ValidationError')
      return res.status(400).json({ success: false, error: Object.values(e.errors).map(x=>x.message).join(', ') });
    res.status(500).json({ success: false, error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: order });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;
