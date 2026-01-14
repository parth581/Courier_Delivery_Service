# Quick Setup Guide

## Step 1: Environment Setup

1. Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hyperlogical_delivery
   PORT=3000
   NODE_ENV=development
   ```

2. If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hyperlogical_delivery
   ```

## Step 2: Start MongoDB

### Local MongoDB:
- Make sure MongoDB is installed and running
- Default connection: `mongodb://localhost:27017`

### MongoDB Atlas:
- Create a free cluster at https://www.mongodb.com/cloud/atlas
- Get your connection string and update `.env`

## Step 3: Seed Initial Data (Optional)

Create some test couriers:
```bash
npm run seed
```

This will create 5 couriers at different locations.

## Step 4: Start the Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## Step 5: Test the API

### Create a Courier:
```bash
curl -X POST http://localhost:3000/api/couriers \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Courier", "location": {"x": 0, "y": 0}}'
```

### Create an Order:
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLocation": {"x": 2, "y": 2},
    "dropLocation": {"x": 10, "y": 10},
    "deliveryType": "NORMAL"
  }'
```

### Simulate Courier Movement:
```bash
curl -X POST http://localhost:3000/api/simulate/move \
  -H "Content-Type: application/json" \
  -d '{"courierId": "YOUR_COURIER_ID"}'
```

## Verification Checklist

✅ MongoDB connection successful  
✅ Server starts without errors  
✅ Can create couriers  
✅ Can create orders  
✅ Orders auto-assign couriers  
✅ Can simulate courier movement  
✅ Order states progress correctly  

## Troubleshooting

**MongoDB Connection Error:**
- Check if MongoDB is running: `mongosh` or check MongoDB service
- Verify connection string in `.env`

**Port Already in Use:**
- Change PORT in `.env` or kill the process using port 3000

**Module Errors:**
- Run `npm install` again
- Check Node.js version (v14+ required)
