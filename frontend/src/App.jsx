
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
