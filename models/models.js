const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postal_code: { type: String }
});

const ownerSchema = new Schema({
    name: { type: String, required: true },
    email_id: { type: String, required: true },
    phone_number: { type: String, default: "0" },
    address: { type: addressSchema },
    password: { type: String, required: true }
})

const itemSchema = new Schema({
    owner_id: { type: Schema.Types.ObjectId, ref: 'Owner' },
    name: { type: String, required: true },
    selling_price_per_unit: { type: Number, default: 0 },
    vendors: [{ type: Schema.Types.ObjectId, ref: 'Vendor', default: [] }],
    stocks: [{ type: Schema.Types.ObjectId, ref: 'Stock', default: [] }] // Array of stock reference IDs
});

const vendorSchema = new Schema({
    owner_id: { type: Schema.Types.ObjectId, ref: 'Owner' },
    name: { type: String, required: true },
    email_id: { type: String, required: true },
    phone_number: { type: String, default: "0" },
    address: { type: addressSchema }
});

const buyerSchema = new Schema({
    owner_id: { type: Schema.Types.ObjectId, ref: 'Owner' },
    name: { type: String, required: true },
    email_id: String,
    phone_number: { type: String, default: "0" },
    address: { type: addressSchema }
});

const buyingSchema = new Schema({
    owner_id: { type: Schema.Types.ObjectId, ref: 'Owner' },
    vendor_id: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    item_id: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    units: { type: Number, default: 0 },
    buying_price: { type: Number, default: 0 },
    transaction_date: { type: Date, default: Date.now }
});

const sellingSchema = new Schema({
    owner_id: { type: Schema.Types.ObjectId, ref: 'Owner' },
    buyer_id: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true },
    item_id: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    units: { type: Number, default: 0 },
    selling_price: { type: Number, default: 0 },
    transaction_date: { type: Date, default: Date.now }
});

const stockSchema = new Schema({
    owner_id: { type: Schema.Types.ObjectId, ref: 'Owner' },
    rack_number: { type: Number, default: 0 },
    item_id: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    units: { type: Number, default: 0 }
});

// Define MongoDB models
const Owner = mongoose.model('Owner', ownerSchema);
const Item = mongoose.model('Item', itemSchema);
const Vendor = mongoose.model('Vendor', vendorSchema);
const Buyer = mongoose.model('Buyer', buyerSchema);
const Buying = mongoose.model('Buying', buyingSchema);
const Selling = mongoose.model('Selling', sellingSchema);
const Address = mongoose.model('Address', addressSchema);
const Stock = mongoose.model('Stock', stockSchema);

module.exports = {
    Owner,
    Item,
    Vendor,
    Buyer,
    Buying,
    Selling,
    Address,
    Stock
};