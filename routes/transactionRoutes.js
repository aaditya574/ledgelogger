const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const { Owner, Item, Vendor, Buyer, Buying, Selling, Address, Stock } = require('../models/models');

// Buy items from a vendor
router.post('/buy', async (req, res) => {
    try {
        const owner_id = req.owner._id;
        const { vendor_id, item_id, units, buying_price, rack_number } = req.body;

        // Convert units and buying_price to numbers
        const parsedUnits = parseInt(units);
        const parsedBuyingPrice = parseFloat(buying_price);

        // Check if the vendor exists
        const vendor = await Vendor.findOne({ owner_id, _id: vendor_id });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Check if the item exists and is owned by the current owner
        const item = await Item.findOne({ owner_id, _id: item_id });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if the vendor is associated with the item, if not, add the vendor to the item's vendors list
        if (!item.vendors.includes(vendor_id)) {
            item.vendors.push(vendor_id);
            await item.save();
        }

        // Check if the item is already present in the stock of the owner
        let stock = await Stock.findOne({ owner_id, rack_number, item_id });

        if (!stock) {
            // If stock doesn't exist, create a new one
            stock = new Stock({ owner_id, rack_number, item_id, units: parsedUnits });
        } else {
            // If stock exists, update the units
            stock.units += parsedUnits;
        }

        // Save the updated stock
        await stock.save();

        // Add the updated stock to the corresponding item, if not already present
        if (!item.stocks.includes(stock._id)) {
            item.stocks.push(stock._id);
            await item.save();
        }

        // Create a new buying entry
        const transaction_date = new Date();
        const newBuying = new Buying({ owner_id, vendor_id, item_id, units: parsedUnits, buying_price: parsedBuyingPrice, transaction_date });
        const savedBuying = await newBuying.save();

        res.status(201).json(stock);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Sell items to a buyer
router.post('/sell', async (req, res) => {
    try {
        const owner_id = req.owner._id;
        const { buyer_id, item_id, units, selling_price, stock_id } = req.body;

        // Convert units and selling_price to numbers
        const parsedUnits = parseInt(units);
        const parsedSellingPrice = parseFloat(selling_price);

        // console.log({ owner_id, _id: item_id, buyer_id });

        // Check if the item exists and is owned by the current owner
        const item = await Item.findOne({ owner_id, _id: item_id });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if the buyer exists and is associated with the owner
        const buyer = await Buyer.findOne({ owner_id, _id: buyer_id });
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }

        // Check if the stock contains enough units in the given rack number
        const stock = await Stock.findOne({ owner_id, item_id, _id: stock_id });
        if (!stock || stock.units < parsedUnits) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        const transaction_date = new Date();

        // Create and save the new selling
        const newSelling = new Selling({ owner_id, buyer_id, item_id, units: parsedUnits, selling_price: parsedSellingPrice, transaction_date });
        await newSelling.save();

        // Update stock units
        stock.units -= parsedUnits;

        // If stock units are zero, remove it from Stock and corresponding item's stocks field
        if (stock.units === 0) {
            item.stocks.pull(stock._id);
            await Stock.findByIdAndDelete(stock._id);
        }

        // Save the updated stock and item
        if (stock && stock.units)
            await stock.save();
        await item.save();

        res.status(201).json({ message: 'Item sold successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;