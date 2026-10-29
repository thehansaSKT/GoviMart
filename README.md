# GoviMart

**GoviMart** is a full-stack farm-to-home marketplace that connects farmers with consumers. Farmers can manage their products and orders, while consumers can browse products, maintain a cart, place orders, and view their order history. An administrator area is also included.

## Features

### Authentication and accounts
- Separate login flows for farmers and consumers
- Consumer and farmer registration
- Role-aware navigation
- Profile viewing and account logout
- Admin login and a protected admin dashboard

### Farmer
- Farmer dashboard
- Add, view, edit, and delete products
- View and manage customer orders
- View and edit farmer profile information

### Consumer
- Browse products
- Search and filter products
- Add products to the cart
- Checkout and place orders
- View order history and order status
- View consumer profile information

### Administration
- Admin login
- Protected admin dashboard

> Available actions depend on the user's role and the backend authorization rules.

## Technology stack

**Frontend**
- React
- Vite
- React Router
- Axios
- CSS

**Backend**
- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- dotenv
- CORS

## Project structure

```text
GoviMart/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env                
│   ├── .gitignore
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   │   ├── admin/
    │   │   ├── auth/
    │   │   ├── consumer/
    │   │   └── farmer/
    │   ├── services/
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

Some files may be added as the project evolves.

## Prerequisites

Install the following before running the project:

- Node.js and npm
- A MongoDB database (MongoDB Atlas or a local MongoDB instance)
- Git, if cloning the repository

## Installation and setup

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd GoviMart
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the URL of your GitHub repository.

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a file named `.env` inside the `backend` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
```

- Set `MONGODB_URI` to your MongoDB connection string.
- Set `JWT_SECRET` to a long, private random value.
- If your backend code uses any additional environment variables, add them to this file as required.
- Never commit `.env` or publish database credentials or secrets.

Start the backend development server:

```bash
npm run dev
```

The backend uses port `5000` by default. When the server starts successfully, its root endpoint returns a message indicating that GoviMart's backend is running.

If `npm run dev` is unavailable, check that the backend dependencies are installed and that the `dev` script exists in `backend/package.json`. The configured start command is:

```bash
npm start
```

### 3. Configure the frontend

Open a **second terminal** from the project root:

```bash
cd frontend
npm install
npm run dev
```

Vite prints a local development URL in the terminal, usually `http://localhost:5173`. Open the URL shown in your terminal.

The current frontend service files use `http://localhost:5000` for the backend API. If you change the backend host or port, update the API URLs in the frontend service files as well.

## Main application routes

| Route | Purpose |
|---|---|
| `/` | Welcome page and account selection |
| `/login/farmer` | Farmer login |
| `/login/consumer` | Consumer login |
| `/register` | Register a farmer or consumer |
| `/profile` | Account profile |
| `/farmer/dashboard` | Farmer dashboard |
| `/farmer/products` | Farmer product management |
| `/farmer/add-product` | Add a product |
| `/farmer/profile` | Farmer profile management |
| `/farmer/orders` | Farmer orders |
| `/consumer` | Consumer home |
| `/consumer/products` | Browse products |
| `/consumer/cart` | Shopping cart |
| `/consumer/checkout` | Checkout |
| `/consumer/orders` | Consumer order history |
| `/consumer/order-success` | Order success page |
| `/consumer/profile` | Consumer profile |
| `/admin/login` | Admin login |
| `/admin/dashboard` | Protected admin dashboard |

## Backend API overview

The backend mounts these API route groups:

| Base path | Purpose |
|---|---|
| `/api/users` | Registration, login, and user-related operations |
| `/api/products` | Product operations |
| `/api/orders` | Order operations |

The exact HTTP methods and authorization requirements are defined in the route and controller files under `backend/`.

## Database

GoviMart uses MongoDB through Mongoose. The backend connects using the `MONGODB_URI` environment variable. Start the database or ensure your MongoDB Atlas cluster is reachable before starting the application.

## Security notes

- Keep `.env` out of version control.
- Use a strong, unique `JWT_SECRET`.
- Do not put administrator passwords or database credentials in this README.
- Create or configure an administrator account using the project's approved backend setup process.
- Use backend authorization checks for protected operations; frontend route checks alone are not sufficient security.

## Troubleshooting

### Frontend cannot reach the backend
- Confirm the backend is running on port `5000`.
- Check the API URLs in `frontend/src/services/`.
- Check the browser console and backend terminal for errors.

### MongoDB connection fails
- Check `MONGODB_URI`.
- For MongoDB Atlas, verify the database user, network access/IP allowlist, and connection string.
- Ensure the database service is available.

### Vite reports a missing import or CSS file
- Confirm the referenced file exists.
- Check the import path relative to the file that imports it.
- Match filename capitalization and spelling.
- Restart the Vite development server after correcting the import.

### Port is already in use
- Stop the other process using the port, or configure a different port and update related frontend API URLs.

## Development scripts

**Backend** (`backend/`):

```bash
npm run dev
npm start
```

**Frontend** (`frontend/`):

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Future improvements

- Implement a delivery management system to connect farmers, consumers, and delivery personnel.
- Add real-time delivery tracking and order status updates.
- Integrate online payment methods.
- Add customer reviews and ratings for farmers and products.
- Improve product recommendations based on consumer preferences.
- Develop a mobile application for easier access.
- Add notifications for order confirmations, dispatches, and deliveries.
