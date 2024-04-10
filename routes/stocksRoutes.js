const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const { Owner, Item, Vendor, Buyer, Buying, Selling, Address, Stock } = require('../models/models');

// Get list of stocks sorted by rack_number or item_id (default: rack_number)
router.get('/:sortBy?', async (req, res) => {
    try {
        let { sortBy } = req.params;
        if (!sortBy) {
            sortBy = 'rack_number'; // Set default sorting parameter to rack_number
        }
        let sortQuery = {};
        if (sortBy === 'rack_number') {
            sortQuery = { rack_number: 1 }; // Sort by rack_number in ascending order
        } else if (sortBy === 'item_id') {
            sortQuery = { item_id: 1 }; // Sort by item_id in ascending order
        } else {
            return res.status(400).json({ message: 'Invalid sorting parameter' });
        }
        const stocks = await Stock.find({ owner_id: req.owner._id }).sort(sortQuery).populate('item_id');
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;