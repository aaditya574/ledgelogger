const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Import environment variables
const { port, dbUrl } = require('./environment/environmentVariables');

// Import authentication middleware
const auth = require('./middleware/authMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const buyersRoutes = require('./routes/buyersRoutes');
const itemsRoutes = require('./routes/itemsRoutes');
const reportRoutes = require('./routes/reportRoutes'); // Import reportRoutes
const stocksRoutes = require('./routes/stocksRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const vendorsRoutes = require('./routes/vendorsRoutes');

// Database connection
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB.'));

// Middleware
app.use(express.json());
app.use(cors());


/* testing

// Middleware function to introduce delay
async function delay(req, res, next) {
    // Introduce a delay of 1000 milliseconds (1 second)
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Proceed to the next middleware or route handler
    next();
}

// Routes
app.use('/auth', delay, authRoutes);
app.use('/buyers', delay, auth, buyersRoutes);
app.use('/items', delay, auth, itemsRoutes);
app.use('/report', delay, auth, reportRoutes);
app.use('/stocks', delay, auth, stocksRoutes);
app.use('/transactions', delay, auth, transactionRoutes);
app.use('/vendors', delay, auth, vendorsRoutes);

*/

// Routes
app.get('/', (req, res) => {
    res.send('Hello!');
})
app.use('/auth', authRoutes);
app.use('/buyers', auth, buyersRoutes);
app.use('/items', auth, itemsRoutes);
app.use('/report', auth, reportRoutes);
app.use('/stocks', auth, stocksRoutes);
app.use('/transactions', auth, transactionRoutes);
app.use('/vendors', auth, vendorsRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
