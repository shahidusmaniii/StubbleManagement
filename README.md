# Stubble Management System

A comprehensive platform for managing agricultural stubble, connecting farmers with companies for stubble processing, collection, and auction services.

## Features

- **Multi-User System**: Separate interfaces for Farmers, Companies, and Admins
- **Service Requests**: Farmers can request stubble collection and processing services
- **Auction System**: Companies can bid on stubble through auction rooms
- **Admin Dashboard**: Comprehensive management of users, service requests, and auctions

## Tech Stack

- **Frontend**: React.js, Bootstrap
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Updates**: Socket.IO for auction bidding

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd StubbleManagement
   ```

2. Install dependencies for backend
   ```
   cd Backend
   npm install
   ```

3. Install dependencies for frontend
   ```
   cd ../Frontend
   npm install
   ```

4. Create a default.json file in Backend/config with the following contents:
   ```json
   {
     "mongoURI": "your-mongodb-connection-string",
     "jwtToken": "your-secret-token",
     "serverPort": 8000
   }
   ```

5. Run the application
   ```
   # Start backend server
   cd Backend
   npm run start
   
   # In a separate terminal, start the auction server
   cd Backend
   npm run start:auction
   
   # In a separate terminal, start the frontend
   cd Frontend
   npm start
   ```

## Admin Setup

The system seeds a default admin user on first startup:
- Email: admin@example.com
- Password: admin123

## Project Structure

- `/Backend`: Node.js Express server
  - `/api`: API routes
  - `/config`: Configuration files
  - `/middleware`: Authentication and other middleware
  - `/models`: Mongoose data models
  - `/servers`: Main and auction server configurations

- `/Frontend`: React application
  - `/src/components`: React components
    - `/admin`: Admin dashboard components
    - `/company`: Company dashboard components
    - `/dashboard`: Farmer dashboard components
    - `/services`: Service request components
    - `/auction`: Auction system components

## License

This project is licensed under the MIT License. 