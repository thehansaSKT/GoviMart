import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import AddProduct from "./AddProduct";
import "../../App.css";

function AddProductPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const product = location.state?.product || null;
  const returnTo = location.state?.returnTo || "/farmer/products";

  const handleProductAdded = async () => {
    navigate(returnTo);
  };

  const handleCancel = () => {
    navigate(returnTo);
  };

  return (
    <div className="farmer-dashboard">
      <Sidebar />

      <main className="main-content">
        <Header />

        <AddProduct
          product={product}
          onProductAdded={handleProductAdded}
          onCancel={handleCancel}
        />
      </main>
    </div>
  );
}

export default AddProductPage;
