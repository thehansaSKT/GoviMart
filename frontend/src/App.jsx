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


import FarmerDashboard from "./pages/farmer/FarmerDashboard.jsx";
import MyProducts from "./pages/farmer/MyProducts.jsx";
import AddProductPage from "./pages/farmer/AddProductPage.jsx";
import MyProfile from "./pages/farmer/MyProfile.jsx";
import FarmerOrders from "./pages/farmer/FarmerOrders.jsx";


import ConsumerHome from "./pages/consumer/ConsumerHome.jsx";
import ConsumerProducts from "./pages/consumer/ConsumerProducts.jsx";
import ConsumerCart from "./pages/consumer/ConsumerCart.jsx";
import ConsumerCheckout from "./pages/consumer/ConsumerCheckout.jsx";
import ConsumerOrders from "./pages/consumer/ConsumerOrders.jsx";
import ConsumerOrderSuccess from "./pages/consumer/ConsumerOrderSuccess.jsx";
import ConsumerProfile from "./pages/consumer/ConsumerProfile.jsx";


import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";


function RequireAdmin({ children }) {
  const token = sessionStorage.getItem("goviToken");

  let user = null;

  try {
    user = JSON.parse(
      sessionStorage.getItem("goviUser") || "null"
    );
  } catch {
    user = null;
  }

  if (!token || user?.role?.toLowerCase() !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

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
          path="/farmer/orders"
          element={<FarmerOrders />}
        />

      
        <Route path="/consumer" element={<ConsumerHome />} />
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
          path="/consumer/profile"
          element={<ConsumerProfile />}
        />

    
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
