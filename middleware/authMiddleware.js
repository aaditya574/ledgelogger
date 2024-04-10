const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../environment/environmentVariables');

// Middleware for authentication
const auth = (req, res, next) => {
    try {
        // Check if Authorization header exists
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            throw new Error('Authorization header is missing');
        }

        // Extract token from Authorization header
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new Error('Token is missing from Authorization header');
        }

        // Verify the token
        const decoded = jwt.verify(token, jwtSecret);
        req.owner = decoded.owner; // Attach decoded owner object to request
        next(); // Proceed to next middleware
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
};

module.exports = auth;