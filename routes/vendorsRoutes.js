const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const { Owner, Item, Vendor, Buyer, Buying, Selling, Address, Stock } = require('../models/models');

// Get all vendors with complete address details
router.get('/', async (req, res) => {
    try {
        const vendors = await Vendor.find({ owner_id: req.owner._id });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Show details of a particular vendor
router.get('/:id', async (req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor.find({ owner_id: req.owner._id, _id: vendorId });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(vendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a vendor
router.post('/', async (req, res) => {
    try {
        const owner_id = req.owner._id;
        const { name, email_id, phone_number, address } = req.body;
        // Create the vendor
        const newVendor = new Vendor({ owner_id, name, email_id, phone_number, address });
        const savedVendor = await newVendor.save();
        res.status(201).json(savedVendor);
    } catch (error) {
        // console.log(error.message);
        res.status(400).json({ message: error.message });
    }
});

// Delete a vendor
router.delete('/:id', async (req, res) => {
    try {
        const vendorId = req.params.id;
        const deletedVendor = await Vendor.findOneAndDelete({ owner_id: req.owner._id, _id: vendorId });
        if (!deletedVendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Edit a vendor
router.put('/:id', async (req, res) => {
    try {
        const vendorId = req.params.id;
        const { name, email_id, phone_number, address } = req.body;
        const updatedVendor = await Vendor.findOneAndUpdate({ owner_id: req.owner._id, _id: vendorId }, { name, email_id, phone_number, address }, { new: true });
        if (!updatedVendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(updatedVendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;