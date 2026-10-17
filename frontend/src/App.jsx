import "./App.css";

function App() {
  return (
    <div className="farmer-dashboard">
      {}
      <aside className="sidebar">
        <div className="brand">
          <img
            src="/govimart-logo.png"
            alt="GoviMart logo"
            className="brand-logo"
          />
          <h2>GoviMart</h2>
        </div>

        <p className="menu-heading">FARMER MENU</p>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="nav-link active">
            <span>▦</span> Dashboard
          </a>
          <a href="#products" className="nav-link">
            <span>▣</span> My Products
          </a>
          <a href="#add-product" className="nav-link">
            <span>＋</span> Add Product
          </a>
          <a href="#orders" className="nav-link">
            <span>▤</span> Orders
          </a>
          <a href="#profile" className="nav-link">
            <span>◉</span> My Profile
          </a>
        </nav>

        <div className="sidebar-footer">
          <span>🌱</span>
          <p>Growing together, from farm to home.</p>
        </div>
      </aside>

      {}
      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="topbar-label">FARMER PORTAL</p>
            <h2>Dashboard</h2>
          </div>

          <div className="farmer-profile">
            <div className="profile-avatar">F</div>
            <div>
              <strong>Farmer</strong>
              <p>GoviMart Member</p>
            </div>
          </div>
        </header>

        <section className="welcome-section" id="dashboard">
          <div>
            <p className="eyebrow">WELCOME TO GOVIMART</p>
            <h1>Your farm, your marketplace.</h1>
            <p>
              Manage your products, track your stock, and connect
              with customers directly.
            </p>

            <a href="#add-product" className="primary-button">
              + Add New Product
            </a>
          </div>

         <div className="welcome-icon">
             <img
          src="/govimart-welcome.png"
         alt="Farmer holding a crate of fresh produce"
  />
</div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon green-icon">▣</div>
            <p>Total Products</p>
            <h2>0</h2>
            <span>Products listed</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon orange-icon">▤</div>
            <p>Available Stock</p>
            <h2>0</h2>
            <span>Items in stock</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon blue-icon">🛒</div>
            <p>Total Orders</p>
            <h2>0</h2>
            <span>Orders received</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon purple-icon">Rs.</div>
            <p>Sales Revenue</p>
            <h2>Rs. 0.00</h2>
            <span>Total sales</span>
          </article>
        </section>

        <section className="content-panel" id="products">
          <div className="panel-heading">
            <div>
              <h2>My Products</h2>
              <p>Your recently listed farm products</p>
            </div>

            <a href="#add-product" className="secondary-button">
              View All
            </a>
          </div>

          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h3>No products yet</h3>
            <p>
              Start selling your fresh farm products on GoviMart.
            </p>
            <a href="#add-product" className="primary-button">
              Add Your First Product
            </a>
          </div>
        </section>

        <footer className="dashboard-footer">
          © 2026 GoviMart. Connecting farmers and consumers.
        </footer>
      </main>
    </div>
  );
}

export default App;
