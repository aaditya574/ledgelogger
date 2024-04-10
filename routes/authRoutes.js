const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const { Owner } = require('../models/models');
const { jwtSecret } = require('../environment/environmentVariables');

// Signup endpoint
router.post('/signup', async (req, res) => {
    try {
        const { name, email_id, phone_number, address, password } = req.body;

        // Check if the email is already registered
        const existingOwner = await Owner.findOne({ email_id });
        if (existingOwner) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the owner
        const newOwner = new Owner({ name, email_id, phone_number, address, password: hashedPassword });
        const savedOwner = await newOwner.save();

        res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Authentication endpoint (login)
router.post('/login', async (req, res) => {

    // console.log('reaching');

    const { email_id, password } = req.body;

    // Find the owner by email in the database
    const owner = await Owner.findOne({ email_id });
    if (!owner) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if the password is correct
    if (!await bcrypt.compare(password, owner.password)) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ owner: owner }, jwtSecret, { expiresIn: '24h' });
    res.json({ token });
});

module.exports = router;