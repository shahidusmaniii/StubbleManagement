import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1 className="display-4">Stubble Management System</h1>
          <p className="lead">
            An eco-friendly approach to manage agricultural waste
          </p>
          <Link to="/register" className="btn btn-primary btn-lg mt-3">
            Get Started
          </Link>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-4">Our Services</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card card-stubble h-100">
                <div className="card-body">
                  <h3 className="card-title text-primary">
                    <i className="fas fa-tractor mr-2"></i> Stubble Collection
                  </h3>
                  <p className="card-text">
                    We collect agricultural stubble directly from farms using modern machinery,
                    ensuring complete removal without harming the soil.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card card-stubble h-100">
                <div className="card-body">
                  <h3 className="card-title text-primary">
                    <i className="fas fa-recycle mr-2"></i> Stubble Recycling
                  </h3>
                  <p className="card-text">
                    The collected stubble is processed and recycled into useful products like
                    biofuels, paper, and packaging materials.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card card-stubble h-100">
                <div className="card-body">
                  <h3 className="card-title text-primary">
                    <i className="fas fa-gavel mr-2"></i> Auction System
                  </h3>
                  <p className="card-text">
                    Our innovative auction system connects farmers with companies, ensuring
                    fair prices for agricultural waste.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-light py-5">
        <div className="container">
          <h2 className="text-center mb-4">How It Works</h2>
          <div className="row">
            <div className="col-md-3 mb-4">
              <div className="dashboard-stat bg-white">
                <div className="h1 mb-3">
                  <i className="fas fa-user-plus text-primary"></i>
                </div>
                <h4>1. Register</h4>
                <p>Sign up as a farmer or company</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="dashboard-stat bg-white">
                <div className="h1 mb-3">
                  <i className="fas fa-tasks text-primary"></i>
                </div>
                <h4>2. Create Request</h4>
                <p>Submit details about your stubble</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="dashboard-stat bg-white">
                <div className="h1 mb-3">
                  <i className="fas fa-gavel text-primary"></i>
                </div>
                <h4>3. Auction</h4>
                <p>Join auctions or place bids</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="dashboard-stat bg-white">
                <div className="h1 mb-3">
                  <i className="fas fa-check-circle text-primary"></i>
                </div>
                <h4>4. Complete</h4>
                <p>Finalize the transaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 