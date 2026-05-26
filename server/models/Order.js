const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: [true,'Customer name required'], trim: true },
  product:      { type: String, required: [true,'Product required'], trim: true },
  amount:       { type: Number, required: [true,'Amount required'], min: 0 },
  quantity:     { type: Number, required: [true,'Quantity required'], min: 1 },
  status: {
    type: String,
    enum: ['pending','processing','shipped','delivered','cancelled'],
    default: 'pending'
  }
}, { timestamps: true });
module.exports = mongoose.model('Order', orderSchema);
