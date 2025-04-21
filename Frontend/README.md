# Stubble Management System - Frontend

This is the frontend application for the Stubble Management System, built with React.js and Bootstrap.

## Features

- User authentication (Farmers, Companies, Admin)
- Service request creation and management
- Real-time auction system for stubble management
- Dashboard for different user types
- Responsive design

## Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd StubbleManagement/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_AUCTION_SERVER=http://localhost:5001
   ```

## Development

To start the development server:

```
npm start
```

This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Building for Production

To build the app for production:

```
npm run build
```

This will create an optimized build in the `build` folder.

## Project Structure

- `/src` - Source code
  - `/components` - React components
    - `/admin` - Admin-specific components
    - `/auction` - Auction-related components
    - `/auth` - Authentication components
    - `/company` - Company-specific components
    - `/dashboard` - Dashboard components
    - `/layout` - Layout components
    - `/services` - Service-related components
  - `/App.js` - Main application component
  - `/App.css` - Global styles

## Backend Connection

This frontend application connects to two backend servers:
- Main API server (default port: 5000)
- Auction WebSocket server (default port: 5001)

Make sure both servers are running before starting the frontend.

## Technologies Used

- React.js
- React Router
- Bootstrap
- Axios
- Socket.io (client)
- JWT Authentication
