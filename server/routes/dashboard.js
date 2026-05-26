const router    = require('express').Router();
const Dashboard = require('../models/Dashboard');

router.get('/:userId', async (req, res) => {
  try {
    const d = await Dashboard.findOne({ userId: req.params.userId });
    res.json({ success: true, data: d || null });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/save', async (req, res) => {
  try {
    const { userId = 'admin', widgets } = req.body;
    const d = await Dashboard.findOneAndUpdate(
      { userId }, { userId, widgets: widgets || [] },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: d });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;
