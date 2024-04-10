const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const { Owner, Item, Vendor, Buyer, Buying, Selling, Address, Stock } = require('../models/models');

// Get all buyers with complete address details
router.get('/', async (req, res) => {
    try {
        const buyers = await Buyer.find({ owner_id: req.owner._id });
        res.json(buyers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Show details of a particular buyer
router.get('/:id', async (req, res) => {
    try {
        const buyerId = req.params.id;
        // console.log(buyerId);
        const buyer = await Buyer.find({ _id: buyerId });
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }
        res.json(buyer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a buyer
router.post('/', async (req, res) => {
    try {
        const owner_id = req.owner._id;
        const { name, email_id, phone_number, address } = req.body;
        // Create the buyer
        const newBuyer = new Buyer({ owner_id, name, email_id, phone_number, address });
        const savedBuyer = await newBuyer.save();
        res.status(201).json(savedBuyer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a buyer
router.delete('/:id', async (req, res) => {
    try {
        const buyerId = req.params.id;
        const deletedBuyer = await Buyer.findOneAndDelete({ owner_id: req.owner._id, _id: buyerId });
        if (!deletedBuyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }
        res.json({ message: 'Buyer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Edit a buyer
router.put('/:id', async (req, res) => {
    try {
        const buyerId = req.params.id;
        const { name, email_id, phone_number, address } = req.body;

        const updatedBuyer = await Buyer.findOneAndUpdate({ owner_id: req.owner._id, _id: buyerId }, { name, email_id, phone_number, address }, { new: true });

        if (!updatedBuyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }
        const populatedBuyer = await updatedBuyer;
        res.json(populatedBuyer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;