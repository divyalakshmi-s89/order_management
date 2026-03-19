const mongoose = require('mongoose');
const widgetSchema = new mongoose.Schema({
  id:   { type: String, required: true },
  type: { type: String, enum: ['kpi','bar','line','area','scatter','pie'], required: true },
  layout: { x:{type:Number,default:0}, y:{type:Number,default:0}, w:{type:Number,default:4}, h:{type:Number,default:4}, minW:{type:Number,default:2}, minH:{type:Number,default:2} },
  config: {
    title:       { type: String, default: '' },
    field:       { type: String, default: 'amount' },
    aggregation: { type: String, default: 'sum' },
    groupBy:     { type: String, default: 'product' },
    chartType:   { type: String, default: 'bar' }
  }
}, { _id: false });
const dashboardSchema = new mongoose.Schema({
  userId:  { type: String, required: true },
  widgets: [widgetSchema]
}, { timestamps: true });
dashboardSchema.index({ userId: 1 }, { unique: true });
module.exports = mongoose.model('Dashboard', dashboardSchema);
