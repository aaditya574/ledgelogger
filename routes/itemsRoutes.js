const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const { Owner, Item, Vendor, Buyer, Buying, Selling, Address, Stock } = require('../models/models');

// Example route to get all items
router.get('/', async (req, res) => {
    try {
        const items = await Item.find({ owner_id: req.owner._id }).populate({ path: 'vendors' }).populate('stocks');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Show details of a particular item
router.get('/:id', async (req, res) => {
    try {
        const itemId = req.params.id;

        // Find the item by owner_id and _id
        const item = await Item.findOne({ owner_id: req.owner._id, _id: itemId }).populate({ path: 'vendors' }).populate('stocks');

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add an item
router.post('/', async (req, res) => {
    try {
        const owner_id = req.owner._id;
        const { name, selling_price_per_unit, vendors, stocks } = req.body;

        // Create a new item
        const newItem = new Item({ owner_id, name, selling_price_per_unit, vendors, stocks });

        // Save the item
        const savedItem = await newItem.save();

        // Populate vendors and stocks
        await Item.populate(savedItem, { path: 'vendors stocks' });

        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an item
router.delete('/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        const deletedItem = await Item.findOneAndDelete({ owner_id: req.owner._id, _id: itemId });
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Edit an item
router.put('/:id', async (req, res) => {
    try {
        const owner_id = req.owner._id;
        const itemId = req.params.id;
        const { name, selling_price_per_unit, vendors, stocks } = req.body;

        // Find and update the item
        let updatedItem = await Item.findOneAndUpdate(
            { owner_id, _id: itemId },
            { name, selling_price_per_unit, vendors },
            { new: true }
        ).populate({ path: 'vendors' });

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Delete stocks not present in the request body
        const stocksToDelete = updatedItem.stocks.filter((stock) => {
            return !stocks.some((reqStock) => reqStock._id && reqStock._id.toString() === stock._id.toString());
        });

        await Stock.deleteMany({ _id: { $in: stocksToDelete.map((stock) => stock._id) } });
        // Remove the deleted stocks from the item's stocks array
        updatedItem.stocks = updatedItem.stocks.filter((stock) => !stocksToDelete.includes(stock));

        // Update or create stocks
        // Update or create stocks
        if (stocks && Array.isArray(stocks)) {
            for (const stock of stocks) {
                if (stock._id && stock.owner_id) {
                    // Update existing stock
                    const updatedStock = await Stock.findOneAndUpdate(
                        { owner_id, _id: stock._id },
                        { rack_number: stock.rack_number, units: stock.units },
                        { new: true }
                    );
                    // console.log('Updated stock:', updatedStock);
                } else {
                    // Create new stock
                    const newStock = new Stock({
                        owner_id,
                        rack_number: stock.rack_number,
                        item_id: itemId,
                        units: stock.units
                    });
                    await newStock.save();
                    // console.log('New stock:', newStock);
                    updatedItem.stocks.push(newStock);
                }
            }

            // console.log('Updated item with stocks before saving:', await updatedItem.populate({ path: 'stocks' }));

            // Save the updated item
            updatedItem = await updatedItem.save();

            // console.log('Updated item with stocks after saving:', await updatedItem.populate({ path: 'stocks' }));
        }

        populatedItem = await updatedItem.populate({ path: 'stocks' });

        res.json(populatedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add vendors to an item by its ID
router.post('/:id/addVendors', async (req, res) => {
    try {
        const itemId = req.params.id;
        const { vendors } = req.body;
        // Find the item by ID and populate the vendors field
        const item = await Item.findOne({ owner_id: req.owner._id, _id: itemId }).populate({ path: 'vendors' }).populate('stocks');
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        // Add new vendors to the item
        item.vendors.push(...vendors);
        // Save the updated item
        const updatedItem = await item.save();
        // Populate the vendors field in the updated item before sending the response
        const populatedItem = await updatedItem.populate({ path: 'vendors' }).populate('stocks');
        res.json(populatedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
