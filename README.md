# Hyperlogical Delivery System - Backend API

A backend-only hyperlocal delivery system built with Node.js, Express.js, and MongoDB. This system manages the complete lifecycle of delivery orders with automatic courier assignment, state management, and movement simulation.

## 🚀 Features

- **Order Management**: Create, track, and cancel delivery orders
- **Auto-Assignment**: Automatically assigns nearest eligible courier to orders
- **State Management**: Strict order lifecycle with validated state transitions
- **Express Orders**: Distance-constrained delivery for express orders (≤10 units)
- **Concurrency Safety**: Atomic operations prevent race conditions
- **Courier Simulation**: Simulate courier movement and automatic state progression

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## 🛠️ Installation

1. **Clone or navigate to the project directory**

2. **Install dependencies** (already done):
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   ```bash
   cp .env.example .env
   ```

4. **Start MongoDB** (if using local MongoDB):
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/hyperlogical_delivery`

## 🏃 Running the Application

### Development Mode (with nodemon):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`)

## 📡 API Endpoints

### Orders

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "pickupLocation": { "x": 0, "y": 0 },
  "dropLocation": { "x": 10, "y": 10 },
  "deliveryType": "EXPRESS" | "NORMAL"
}
```

#### Get All Orders
```http
GET /api/orders
GET /api/orders?status=ASSIGNED
GET /api/orders?deliveryType=EXPRESS
```

#### Get Order by ID
```http
GET /api/orders/:id
```

#### Cancel Order
```http
POST /api/orders/:id/cancel
```

### Couriers

#### Create Courier
```http
POST /api/couriers
Content-Type: application/json

{
  "name": "Courier Name",
  "location": { "x": 5, "y": 5 }
}
```

#### Get All Couriers
```http
GET /api/couriers
GET /api/couriers?available=true
```

#### Get Courier by ID
```http
GET /api/couriers/:id
```

#### Update Courier Location
```http
PATCH /api/couriers/:id/location
Content-Type: application/json

{
  "location": { "x": 7, "y": 7 }
}
```

### Simulation

#### Simulate Courier Movement
```http
POST /api/simulate/move
Content-Type: application/json

{
  "courierId": "courier_id_here"
}
```

## 📊 Order State Lifecycle

Orders follow a strict state machine:

```
CREATED → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED
   ↓         ↓           ↓
CANCELLED  CANCELLED  CANCELLED
```

- **CREATED**: Order created, awaiting courier assignment
- **ASSIGNED**: Courier assigned, moving to pickup location
- **PICKED_UP**: Courier reached pickup location
- **IN_TRANSIT**: Courier moving to drop location
- **DELIVERED**: Order completed (terminal state)
- **CANCELLED**: Order cancelled (terminal state)

## 🔒 Concurrency & Safety

- **Atomic Assignment**: Uses MongoDB `findOneAndUpdate` with conditions to prevent race conditions
- **One Courier = One Order**: Enforced at database level
- **State Validation**: All state transitions are validated before execution

## 📏 Distance Calculation

- Uses **Manhattan Distance**: `|x1 - x2| + |y1 - y2|`
- **EXPRESS orders**: Only assigned if courier is within 10 units of pickup
- **NORMAL orders**: No distance limit

## 🧪 Testing the System

### 1. Create Couriers
```bash
curl -X POST http://localhost:3000/api/couriers \
  -H "Content-Type: application/json" \
  -d '{"name": "Courier 1", "location": {"x": 0, "y": 0}}'

curl -X POST http://localhost:3000/api/couriers \
  -H "Content-Type: application/json" \
  -d '{"name": "Courier 2", "location": {"x": 5, "y": 5}}'
```

### 2. Create an Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLocation": {"x": 2, "y": 2},
    "dropLocation": {"x": 10, "y": 10},
    "deliveryType": "NORMAL"
  }'
```

### 3. Simulate Courier Movement
```bash
curl -X POST http://localhost:3000/api/simulate/move \
  -H "Content-Type: application/json" \
  -d '{"courierId": "courier_id_from_step_1"}'
```

### 4. Check Order Status
```bash
curl http://localhost:3000/api/orders/order_id_from_step_2
```

## 📁 Project Structure

```
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── orderController.js   # Order business logic
│   ├── courierController.js # Courier management
│   └── simulationController.js # Movement simulation
├── models/
│   ├── Order.js            # Order schema
│   └── Courier.js          # Courier schema
├── routes/
│   ├── orderRoutes.js      # Order endpoints
│   ├── courierRoutes.js    # Courier endpoints
│   └── simulationRoutes.js # Simulation endpoints
├── services/
│   ├── assignmentService.js # Auto-assignment logic
│   └── stateService.js     # State management
├── middlewares/
│   └── errorHandler.js     # Error handling
├── utils/
│   └── distance.js         # Distance calculations
├── server.js               # Application entry point
├── .env.example            # Environment variables template
└── package.json            # Dependencies
```

## ⚠️ Important Notes

- No authentication is implemented (as per requirements)
- No frontend is included (backend-only)
- All state transitions are validated
- Express orders require courier within 10 units
- Concurrent requests are handled safely with atomic operations

## 🐛 Troubleshooting

1. **MongoDB Connection Error**: 
   - Ensure MongoDB is running
   - Check `MONGODB_URI` in `.env` file

2. **Port Already in Use**:
   - Change `PORT` in `.env` file
   - Or kill the process using the port

3. **Module Not Found**:
   - Run `npm install` again
   - Check `node_modules` exists

## 📝 License

ISC
