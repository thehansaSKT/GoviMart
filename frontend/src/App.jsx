import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import MyProducts from "./pages/farmer/MyProducts";
import AddProductPage from "./pages/farmer/AddProductPage";


function App() {
  return (
     <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/farmer/dashboard" replace />}
        />

        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/products" element={<MyProducts />} />
        <Route path="/farmer/add-product" element={<AddProductPage />} />
       
      </Routes>
    </BrowserRouter>
  );
}

export default App;
