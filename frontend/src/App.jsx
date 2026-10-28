import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ChooseAccount from "./pages/auth/ChooseAccount.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Profile from "./pages/auth/Profile.jsx";


import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import MyProducts from "./pages/farmer/MyProducts";
import AddProductPage from "./pages/farmer/AddProductPage";
import MyProfile from "./pages/farmer/MyProfile";


import ConsumerHome from "./pages/consumer/ConsumerHome";
import ConsumerProducts from "./pages/consumer/ConsumerProducts";
import ConsumerCart from "./pages/consumer/ConsumerCart";
import ConsumerCheckout from "./pages/consumer/ConsumerCheckout";
import ConsumerOrders from "./pages/consumer/ConsumerOrders";
import ConsumerOrderSuccess from "./pages/consumer/ConsumerOrderSuccess";
import ConsumerProfile from "./pages/consumer/ConsumerProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<ChooseAccount />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />


        <Route
  path="/farmer/dashboard"
  element={<FarmerDashboard />}
/>
        <Route
          path="/farmer/products"
          element={<MyProducts />}
        />
        <Route
          path="/farmer/add-product"
          element={<AddProductPage />}
        />
        <Route
          path="/farmer/profile"
          element={<MyProfile />}
        />

        <Route
          path="/consumer"
          element={<ConsumerHome />}
        />
        <Route
          path="/consumer/products"
          element={<ConsumerProducts />}
        />
        <Route
          path="/consumer/cart"
          element={<ConsumerCart />}
        />
        <Route
          path="/consumer/checkout"
          element={<ConsumerCheckout />}
        />
        <Route
          path="/consumer/orders"
          element={<ConsumerOrders />}
        />
        <Route
          path="/consumer/order-success"
          element={<ConsumerOrderSuccess />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
        <Route 
        path="/consumer/profile" 
        element={<ConsumerProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
