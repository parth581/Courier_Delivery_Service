require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

// Import routes
const orderRoutes = require('./routes/orderRoutes');
const courierRoutes = require('./routes/courierRoutes');
const simulationRoutes = require('./routes/simulationRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Hyperlogical Delivery System API',
    version: '1.0.0',
    endpoints: {
      orders: '/api/orders',
      couriers: '/api/couriers',
      simulation: '/api/simulate'
    }
  });
});

app.use('/api/orders', orderRoutes);
app.use('/api/couriers', courierRoutes);
app.use('/api/simulate', simulationRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
