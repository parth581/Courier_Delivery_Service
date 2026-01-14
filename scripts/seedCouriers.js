/**
 * Seed script to create initial couriers for testing
 * Run with: node scripts/seedCouriers.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Courier = require('../models/Courier');

const couriers = [
  { name: 'Courier Alpha', location: { x: 0, y: 0 } },
  { name: 'Courier Beta', location: { x: 5, y: 5 } },
  { name: 'Courier Gamma', location: { x: 10, y: 10 } },
  { name: 'Courier Delta', location: { x: 15, y: 15 } },
  { name: 'Courier Echo', location: { x: 20, y: 20 } }
];

async function seedCouriers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hyperlogical_delivery');
    console.log('Connected to MongoDB');

    // Clear existing couriers (optional - comment out if you want to keep existing)
    // await Courier.deleteMany({});
    // console.log('Cleared existing couriers');

    // Create couriers
    const createdCouriers = await Courier.insertMany(couriers);
    console.log(`✅ Created ${createdCouriers.length} couriers:`);
    createdCouriers.forEach(courier => {
      console.log(`   - ${courier.name} at (${courier.location.x}, ${courier.location.y})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding couriers:', error);
    process.exit(1);
  }
}

seedCouriers();
