const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const { Owner, Item, Vendor, Buyer, Buying, Selling, Address, Stock } = require('../models/models');

// Daily Report with details of buyings and sellings
router.get('/date/:date?', async (req, res) => {
    try {
        let startDate, endDate;

        // Check if the date is provided in the request
        if (req.params.date) {
            // If date is provided, use the specified date
            startDate = moment(req.params.date, 'YYYY-MM-DD').startOf('day');
            endDate = moment(req.params.date, 'YYYY-MM-DD').endOf('day');
        } else {
            // If date is not provided, use the current date
            startDate = moment().startOf('day');
            endDate = moment().endOf('day');
        }

        // Query the database for buyings and sellings within the specified date range
        const buyings = await Buying.find({
            transaction_date: { $gte: startDate, $lte: endDate }
        });
        const sellings = await Selling.find({
            transaction_date: { $gte: startDate, $lte: endDate }
        });

        // Calculate total buying amount for the specified date range
        const totalBuyingAmount = buyings.reduce((total, buying) => total + buying.buying_price, 0);

        // Calculate total selling amount for the specified date range
        const totalSellingAmount = sellings.reduce((total, selling) => total + selling.selling_price, 0);

        // Calculate net profit/loss
        const netProfitLoss = totalSellingAmount - totalBuyingAmount;

        res.json({
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
            buyings,
            totalBuyingAmount,
            sellings,
            totalSellingAmount,
            netProfitLoss
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Monthly Report with day-wise details
router.get('/month/:year?/:month?', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const year = parseInt(req.params.year) || currentYear; // If year is not provided, use the current year
        const month = parseInt(req.params.month) || new Date().getMonth() + 1; // If month is not provided, use the current month

        const startDate = moment({ year, month: month - 1 }).startOf('month');
        const endDate = moment({ year, month: month - 1 }).endOf('month');

        const monthlyReport = [];

        let currentDatePointer = moment(startDate);
        while (currentDatePointer.isSameOrBefore(endDate)) {
            const buyings = await Buying.find({
                transaction_date: {
                    $gte: currentDatePointer.startOf('day').toDate(),
                    $lt: currentDatePointer.endOf('day').toDate()
                }
            });
            const sellings = await Selling.find({
                transaction_date: {
                    $gte: currentDatePointer.startOf('day').toDate(),
                    $lt: currentDatePointer.endOf('day').toDate()
                }
            });

            const totalBuyingAmount = buyings.reduce((total, buying) => total + buying.buying_price, 0);
            const totalSellingAmount = sellings.reduce((total, selling) => total + selling.selling_price, 0);
            const netProfitLoss = totalSellingAmount - totalBuyingAmount;

            monthlyReport.push({
                date: currentDatePointer.format('YYYY-MM-DD'),
                totalBuyingAmount,
                totalSellingAmount,
                netProfitLoss
            });

            currentDatePointer.add(1, 'day');
        }

        res.json(monthlyReport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/year/:year?', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const year = parseInt(req.params.year) || currentYear; // If year is not provided, use the current year

        const yearlyReport = [];

        for (let month = 0; month < 12; month++) {
            const startDate = moment({ year, month }).startOf('month');
            const endDate = moment({ year, month }).endOf('month');

            const buyings = await Buying.find({
                transaction_date: {
                    $gte: startDate.toDate(),
                    $lte: endDate.toDate()
                }
            });
            const sellings = await Selling.find({
                transaction_date: {
                    $gte: startDate.toDate(),
                    $lte: endDate.toDate()
                }
            });

            const totalBuyingAmount = buyings.reduce((total, buying) => total + buying.buying_price, 0);
            const totalSellingAmount = sellings.reduce((total, selling) => total + selling.selling_price, 0);
            const netProfitLoss = totalSellingAmount - totalBuyingAmount;

            yearlyReport.push({
                month: startDate.format('MMMM'),
                totalBuyingAmount,
                totalSellingAmount,
                netProfitLoss
            });
        }

        res.json(yearlyReport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;