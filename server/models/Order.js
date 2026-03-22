const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  material: { type: String },
  color: { type: String },
});

const OrderSchema = new mongoose.Schema({
  items: { type: [OrderItemSchema], required: true },
  total: { type: Number, required: true },
  customer: {
    name: String,
    email: String,
    address: String,
    phone: String,
  },
  status: { type: String, default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
