# Stubble Management System

An end-to-end platform for managing agricultural stubble (crop residue) through auctions, services, and management solutions.

## Project Overview

The Stubble Management System addresses the problem of agricultural stubble burning by providing a marketplace where farmers can sell their crop residue and companies can purchase it for various industrial uses. The platform includes:

- User registration and authentication for farmers and companies
- Service requests for stubble collection
- Live auction system for stubble trading
- Admin dashboard for oversight and management
- Record-keeping of cleared stubble and transactions

## Technology Stack

### Frontend
- React 18
- React Router for navigation
- Axios for API requests
- Bootstrap for UI components
- Socket.IO for real-time auction functionality
- JWT authentication

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- Socket.IO for real-time bidding
- JWT for authentication and authorization
- bcrypt for password hashing

## Project Structure

The project is divided into two main directories:

### Frontend
```
/Frontend
├── node_modules/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   ├── auction/
│   │   ├── auth/
│   │   ├── company/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   ├── services/
│   │   └── Home.js
│   ├── img/
│   ├── App.js
│   ├── index.js
│   └── ...
├── package.json
└── ...
```

### Backend
```
/Backend
├── api/
├── config/
├── middleware/
├── models/
│   ├── Admin.js
│   ├── Auction.js
│   ├── AuctionRoom.js
│   ├── ClearedList.js
│   ├── Company.js
│   ├── Service.js
│   └── User.js
├── servers/
│   ├── server.js
│   └── AuctionServer.js
├── package.json
└── ...
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/StubbleManagement.git
cd StubbleManagement
```

2. Install Backend dependencies
```
cd Backend
npm install
```

3. Install Frontend dependencies
```
cd ../Frontend
npm install
```

4. Set up environment variables
Create a `.env` file in the Backend directory with the following:
```
PORT=5000
AUCTION_PORT=5001
MONGO_URI=mongodb://localhost:27017/stubble_management
JWT_SECRET=your_jwt_secret
```

5. Seed admin user (optional)
```
cd Backend
npm run seed:admin
```

### Running the Application

1. Start the Backend server and auction server
```
cd Backend
npm run dev:server
npm run dev:auction
```

2. Start the Frontend development server
```
cd Frontend
npm start
```

The application should now be running at `http://localhost:3000`

## Features

- **User Authentication**: Register and login for farmers, companies, and admins
- **Service Management**: Request stubble collection services with details
- **Live Auctions**: Real-time bidding on available stubble lots
- **Dashboard**: Track services, auctions, and transactions
- **Admin Controls**: Monitor platform activity, manage users and auctions

## Database Relation Model

### Entity Relationship Diagram

```
                      +----------------+
                      |     Admin      |
                      |                |
                      +----------------+
                        /           \
              manages  /             \ creates
                      /               \
                     v                 v
+-------------+    +-------------+    +----------------+
|             |--->|   Service   |--->|   AuctionRoom  |
|  Farmers    |    | (Requests)  |    |    (Sales)     |
+-------------+    +-------------+    +----------------+
  requests           leads to           ^        |
                                       /         |
                              participates      contains
                                     /           |
                                    /            v
                     +-------------+      +----------------+
                     |   Company   |----->|    Auction     |
                     |             |      |     (Bids)     |
                     +-------------+      +----------------+
                           places bids             |
                                                   v
                                          +----------------+
                                          |  ClearedList   |
                                          |   (Records)    |
                                          +----------------+
```

### Models Description

1. **User (Farmers)**
   - Basic authentication fields (name, email, mobile, password)
   - Can request services for stubble management
   - Can participate in auctions

2. **Company**
   - Basic authentication fields (name, email, mobile, password)
   - Can bid in auctions for stubble
   - Can offer stubble processing services

3. **Admin**
   - Platform administrators
   - Basic authentication fields (name, email, mobile, password)
   - Has oversight over all activities

4. **Service**
   - Created by Users (farmers)
   - Contains field details (acre, plant type)
   - Includes service dates and durations
   - Management type specifications
   - Linked to User by email

5. **AuctionRoom**
   - Name and description of auction
   - Unique code for access control
   - Start bid amount
   - Start and end dates
   - Created by Admins

6. **Auction**
   - Contains individual bids
   - Links to specific auction room
   - Identifies bidding user
   - Stores bid amount
   - Timestamps for tracking

7. **ClearedList**
   - Records of completed stubble clearing
   - Links to User by email
   - Tracks total residue and grain
   - Includes service completion date

### Key Relationships

- **User → Service**: Farmers request services for their stubble
- **Admin → Service**: Admins manage service requests
- **Admin → AuctionRoom**: Admins create auction rooms for stubble sales
- **Company → AuctionRoom**: Companies participate in auction rooms
- **Company → Auction**: Companies place bids in auctions
- **Service → ClearedList**: Completed services are recorded in the cleared list
- **AuctionRoom → Auction**: Auction rooms contain auction records with bids

This database design enables the complete lifecycle management of agricultural stubble from service requests to auction sales and final clearing records.

## License

This project is licensed under the ISC License