import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import MyProducts from "./pages/farmer/MyProducts";
import AddProductPage from "./pages/farmer/AddProductPage";
import MyProfile from "./pages/farmer/MyProfile.jsx";


import ConsumerHome from "./pages/consumer/ConsumerHome";
import ConsumerProducts from "./pages/consumer/ConsumerProducts";
import ConsumerCart from "./pages/consumer/ConsumerCart";
import ConsumerCheckout from "./pages/consumer/ConsumerCheckout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route
          path="/"
          element={<Navigate to="/farmer/dashboard" replace />}
        />

        
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;

