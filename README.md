# Stubble Management System

A comprehensive platform for eco-friendly agricultural waste management, connecting farmers with companies to efficiently manage stubble.

## Overview

The Stubble Management System is designed to solve the problem of agricultural waste management, particularly stubble burning which causes environmental pollution. The platform creates a marketplace where:

- **Farmers** can request services for stubble collection and processing
- **Companies** can bid for stubble through an auction system and offer services
- **Admins** can monitor and regulate all activities on the platform

## Features

- User authentication and role-based access control
- Service request creation and management for farmers
- Real-time auction system with websocket communication
- Dashboard for each user type with relevant information
- Admin oversight of all platform activities

## Technology Stack

### Backend
- Node.js and Express
- MongoDB with Mongoose
- JWT Authentication
- Socket.io for real-time communication
- RESTful API architecture

### Frontend
- React.js
- React Router for navigation
- Bootstrap for responsive UI
- Axios for API requests
- Socket.io client for real-time updates

## Project Structure

- `/Backend` - Node.js server and API
- `/frontend` - React.js client application

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd StubbleManagement
   ```

2. Install all dependencies:
   ```
   npm run install-all
   ```

3. Create backend configuration:
   - Create a `/Backend/config/default.json` file with the following content:
   ```json
   {
     "mongoURI": "your-mongodb-connection-string",
     "jwtToken": "your-jwt-secret-key"
   }
   ```

4. Create frontend environment variables:
   - Create a `/frontend/.env` file with the following content:
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_AUCTION_SERVER=http://localhost:5001
   ```

## Running the Application

To run both frontend and backend together:

```
npm run dev
```

This will start:
- The main backend server on port 5000
- The auction WebSocket server on port 5001
- The React frontend on port 3000

You can also run each component separately:

```
# Start only the main backend server
npm run server

# Start only the auction server
npm run auction

# Start only the frontend
npm run client
```

## User Types

1. **Farmers**
   - Can register and log in
   - Can create service requests for stubble management
   - Can participate in auctions

2. **Companies**
   - Can register and log in
   - Can view available service requests
   - Can create and manage auctions

3. **Admins**
   - Can monitor all service requests and auctions
   - Can approve/reject service requests
   - Can manage the clearance process

## License

This project is licensed under the MIT License - see the LICENSE file for details. 