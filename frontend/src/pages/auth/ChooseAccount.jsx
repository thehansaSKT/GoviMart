import { Link } from "react-router-dom";
import "./Auth.css";

export default function ChooseAccount() {
  return (
    <div className="auth-page">
      <div className="choose-account-container">

        
        <header className="welcome-header">
          <Link to="/" className="govimart-brand">
            <img
              src="/govimart-logo.png"
              alt="GoviMart Logo"
              className="govimart-logo"
            />
            <span className="brand-name">GoviMart</span>
          </Link>

        </header>

        <section className="welcome-content">
  
          <h1>
            Welcome to <span>GoviMart</span>
          </h1>

        </section>

        <div className="account-options">

      
          <Link
            to="/login/farmer"
            className="account-option farmer-option"
          >
            <div className="account-image-wrapper">
              <img
                src="/farmer.png"
                alt="Farmer working in a green field"
                className="account-image"
              />

              <span className="account-badge">
                🌱 For Farmers
              </span>
            </div>

            <div className="account-info">
              <h2>I'm a Farmer</h2>

              <p>
                Bring your fresh farm products to more customers.
                Manage your products, sales, and orders in one place.
              </p>

              <span className="account-link">
                Continue as Farmer
                <span className="arrow">→</span>
              </span>
            </div>
          </Link>

          <Link
            to="/login/consumer"
            className="account-option consumer-option"
          >
            <div className="account-image-wrapper">
              <img
                src="/consumer.png"
                alt="Consumer shopping for fresh produce"
                className="account-image"
              />

              <span className="account-badge">
                🛒 For Consumers
              </span>
            </div>

            <div className="account-info">
              <h2>I'm a Consumer</h2>

              <p>
                Discover fresh, quality farm products.
                Shop conveniently and get closer to the source
                of your food.
              </p>

              <span className="account-link">
                Continue as Consumer
                <span className="arrow">→</span>
              </span>
            </div>
          </Link>

        </div>

     
        <div className="welcome-footer">
          <p>
            New to GoviMart?
            {" "}
            <Link to="/register">Create an account</Link>
          </p>

          <Link to="/consumer" className="visitor-link">
            Browse products as a visitor →
          </Link>
        </div>

        

      </div>
    </div>
  );
}
