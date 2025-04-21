import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const countersRef = useRef(null);

  useEffect(() => {
    // Simple counter animation
    const animateCounters = () => {
      const counters = document.querySelectorAll('.counter');
      counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const increment = target / 100;
        const updateCount = () => {
          if (count < target) {
            count += increment;
            counter.innerText = Math.ceil(count);
            setTimeout(updateCount, 10);
          } else {
            counter.innerText = target;
          }
        };
        updateCount();
      });
    };

    // Intersection Observer for counter animation
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (countersRef.current) {
      observer.observe(countersRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div className="home-page">
      {/* Hero Carousel */}
      <div id="hero" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#hero" data-bs-slide-to="0" className="active"></button>
          <button type="button" data-bs-target="#hero" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#hero" data-bs-slide-to="2"></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="/img/agri3.jpg" className="d-block w-100" alt="Sustainable Farming" />
            <div className="carousel-caption">
              <h1>Transform Agricultural Waste</h1>
              <p>Join us in creating a sustainable future for farming</p>
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started
              </Link>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/img/agri4.jpg" className="d-block w-100" alt="Eco-Friendly Solutions" />
            <div className="carousel-caption">
              <h1>Eco-Friendly Solutions</h1>
              <p>Turn stubble into valuable resources</p>
              <Link to="/services" className="btn btn-primary btn-lg">
                Our Services
              </Link>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/img/agri5.jpg" className="d-block w-100" alt="Community" />
            <div className="carousel-caption">
              <h1>Join Our Community</h1>
              <p>Connect with farmers and companies nationwide</p>
              <Link to="/contact" className="btn btn-primary btn-lg">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#hero" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#hero" data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      {/* Problem Statement Section */}
      <section id="problem" className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <img src="/img/burning3.jpg" alt="Stubble Burning Problem" className="img-fluid rounded shadow" />
            </div>
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold mb-4">The Problem We Solve</h2>
              <p className="lead mb-4">
                Stubble burning is a major environmental concern, causing severe air pollution and health issues.
                Our platform provides a sustainable solution to this problem by connecting farmers with companies
                that can utilize agricultural waste productively.
              </p>
              <div className="d-flex gap-3">
                <Link to="/about" className="btn btn-primary btn-lg">
                  Learn More
                </Link>
                <Link to="/register" className="btn btn-outline-primary btn-lg">
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-5" ref={countersRef}>
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 col-6 mb-4 mb-md-0">
              <div className="counter-container">
                <div className="counter h1 text-primary" data-target="5000">0</div>
                <h5>Farmers Registered</h5>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-4 mb-md-0">
              <div className="counter-container">
                <div className="counter h1 text-primary" data-target="120">0</div>
                <h5>Partner Companies</h5>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="counter-container">
                <div className="counter h1 text-primary" data-target="25000">0</div>
                <h5>Tons Collected</h5>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="counter-container">
                <div className="counter h1 text-primary" data-target="95">0</div>
                <h5>Satisfaction Rate</h5>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold">Our Process</h2>
            <p className="lead text-muted">Simple steps to transform agricultural waste</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <img src="/img/raw.png" className="card-img-top" alt="Raw Material" />
                <div className="card-body text-center">
                  <h3 className="card-title h4">Collection</h3>
                  <p className="card-text">Efficient collection of agricultural waste from farms</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <img src="/img/processed.png" className="card-img-top" alt="Processed Material" />
                <div className="card-body text-center">
                  <h3 className="card-title h4">Processing</h3>
                  <p className="card-text">Transforming waste into valuable resources</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <img src="/img/sugar.jpg" className="card-img-top" alt="Final Product" />
                <div className="card-body text-center">
                  <h3 className="card-title h4">Distribution</h3>
                  <p className="card-text">Delivering processed materials to industries</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 order-lg-2">
              <img src="/img/side-effects.jpg" alt="Environmental Impact" className="img-fluid rounded shadow" />
            </div>
            <div className="col-lg-6 order-lg-1">
              <h2 className="display-5 fw-bold mb-4">Environmental Impact</h2>
              <p className="lead mb-4">
                By preventing stubble burning, we're making a significant impact on:
              </p>
              <ul className="list-unstyled">
                <li className="mb-3">
                  <i className="fas fa-check-circle text-primary me-2"></i>
                  Reducing air pollution and improving air quality
                </li>
                <li className="mb-3">
                  <i className="fas fa-check-circle text-primary me-2"></i>
                  Protecting soil health and biodiversity
                </li>
                <li className="mb-3">
                  <i className="fas fa-check-circle text-primary me-2"></i>
                  Creating sustainable agricultural practices
                </li>
                <li className="mb-3">
                  <i className="fas fa-check-circle text-primary me-2"></i>
                  Supporting local communities and farmers
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5" style={{ backgroundColor: '#036A48' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8 text-center text-lg-start">
              <h2 className="display-4 fw-bold mb-3 text-white">Ready to Make a Difference?</h2>
              <p className="lead mb-4 text-white">Join our community of farmers and companies working together for a sustainable future.</p>
            </div>
            <div className="col-lg-4 text-center text-lg-end">
              <Link to="/register" className="btn btn-light btn-lg">
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .home-page {
          margin-top: 76px;
          padding: 0 1rem;
          font-family: 'Poppins', sans-serif;
        }
        .carousel {
          width: 100%;
          margin: 0;
          padding: 0;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .carousel-inner {
          width: 100%;
          margin: 0;
          padding: 0;
        }
        .carousel-item {
          height: 60vh;
          min-height: 400px;
          max-height: 600px;
          position: relative;
        }
        .carousel-item img {
          object-fit: cover;
          height: 100%;
          width: 100%;
          filter: brightness(0.7);
        }
        .carousel-caption {
          background: rgba(26, 95, 26, 0.8);
          padding: 1.5rem;
          border-radius: 0.5rem;
          bottom: 15%;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          max-width: 800px;
          margin: 0 auto;
        }
        .carousel-caption h1 {
          font-family: 'Poppins', sans-serif;
          font-size: 2.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        .carousel-caption p {
          font-family: 'Poppins', sans-serif;
          font-size: 1.25rem;
          font-weight: 400;
          margin-bottom: 1.5rem;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }
        .btn-primary {
          background: linear-gradient(135deg, #1a5f1a 0%, #2ecc71 100%);
          border: none;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          background: linear-gradient(135deg, #2ecc71 0%, #1a5f1a 100%);
        }
        .counter-container {
          padding: 2rem;
          border-radius: 0.5rem;
          background: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        .counter-container:hover {
          transform: translateY(-5px);
        }
        .card {
          transition: transform 0.3s ease;
          border: none;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .card:hover {
          transform: translateY(-10px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }
        .card-img-top {
          height: 200px;
          object-fit: cover;
        }
        .card-title {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          color: #1a5f1a;
        }
        .card-text {
          font-family: 'Poppins', sans-serif;
          color: #666;
        }
        section {
          padding: 4rem 0;
        }
        section h2 {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          color: #1a5f1a;
        }
        section p {
          font-family: 'Poppins', sans-serif;
          color: #666;
        }
        @media (max-width: 768px) {
          .carousel-item {
            height: 50vh;
            min-height: 300px;
            max-height: 400px;
          }
          .carousel-caption {
            width: 90%;
            bottom: 10%;
            padding: 1rem;
          }
          .carousel-caption h1 {
            font-size: 2rem;
          }
          .carousel-caption p {
            font-size: 1rem;
          }
        }
        .btn-light {
          background-color: #ffffff;
          color: #036A48;
          border: none;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
        }
        .btn-light:hover {
          background-color: #f8f9fa;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Home;

