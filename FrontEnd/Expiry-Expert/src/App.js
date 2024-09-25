import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ProductForm from "./components/ProductForm";
import logo from './logo.png';
import { initWeb3, addProduct, deleteProduct, editProductInBlockchain } from "./contractService";
import "./App.css";

const App = () => {
  const [categories, setCategories] = useState([
    "Expiring Soon",
    "Food",
    "Medicine",
    "Cosmetics",
    "Others",
    "Expired"
  ]);
  const [selectedCategory, setSelectedCategory] = useState("Expiring Soon");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await initWeb3();
      const storedProducts = localStorage.getItem("products");
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    };

    initialize();
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsFormVisible(false);
    setIsSubmitted(false);
  };

  const handleFormSubmit = async (product) => {
    try {
      const expiryDateInSeconds = Math.floor(new Date(product.expiryDate).getTime() / 1000);
  
      let updatedProducts;
  
      if (editProduct) {
        // Simulate edit by adding a dummy placeholder
        await addProduct("Placeholder Product", 0);
  
        // Update the product locally
        updatedProducts = products.map((p) =>
          p.id === editProduct.id ? { ...product, expiryDate: expiryDateInSeconds } : p
        );
        
        // Remove the old product and update the local storage
        const updatedProductsForStorage = updatedProducts.filter((p) => p.id !== editProduct.id);
        updatedProductsForStorage.push({ ...product, expiryDate: expiryDateInSeconds });
        
        setProducts(updatedProductsForStorage);
        localStorage.setItem("products", JSON.stringify(updatedProductsForStorage));
        
        alert("Product edited successfully!");
      } else {
        // Add a new product to the blockchain
        product.id = Date.now();
        await addProduct(product.name, expiryDateInSeconds);
  
        // Add the new product locally
        updatedProducts = [...products, { ...product, expiryDate: expiryDateInSeconds }];
        
        setProducts(updatedProducts);
        localStorage.setItem("products", JSON.stringify(updatedProducts));
        
        alert("Product added successfully!");
      }
  
      // Hide the form and reset states
      setIsFormVisible(false);
      setEditProduct(null);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error handling product:", error);
    }
  };
  
  

  const handleEditClick = (product) => {
    setSelectedCategory("");
    setIsFormVisible(true);
    setEditProduct(product);
  };
    const handleDeleteClick = async (id) => {
      try {
        // Get MetaMask account
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        
        // Simulate deletion by adding a dummy placeholder product
        await addProduct("Placeholder Product", 0);
        
        // Remove product from local storage
        const updatedProducts = products.filter((product) => product.id !== id);
        setProducts(updatedProducts);
        localStorage.setItem("products", JSON.stringify(updatedProducts));
        alert("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const filteredProducts =
    selectedCategory === "Expiring Soon"
      ? products
          .filter((product) => {
            const productExpiryDate = new Date(product.expiryDate * 1000);
            return (
              productExpiryDate.getMonth() === currentMonth &&
              productExpiryDate.getFullYear() === currentYear
            );
          })
          .sort((a, b) => new Date(a.expiryDate * 1000) - new Date(b.expiryDate * 1000))
      : selectedCategory === "Expired"
          ? products
              .filter((product) => {
                const productExpiryDate = new Date(product.expiryDate * 1000);
                return productExpiryDate < new Date();
              })
              .sort((a, b) => new Date(a.expiryDate * 1000) - new Date(b.expiryDate * 1000))
          : products
              .filter((product) => product.category === selectedCategory)
              .sort((a, b) => new Date(a.expiryDate * 1000) - new Date(b.expiryDate * 1000));

  const getProductStatus = (expiryDate) => {
    const today = new Date();
    return new Date(expiryDate * 1000) < today ? "Expired" : "Not Expired";
  };

  const filteredProductsWithStatus = filteredProducts.map((product) => ({
    ...product,
    status: getProductStatus(product.expiryDate),
  }));

  return (
    <div className="App">
      <header>
        <h1 className="gradient-text">Expiry Expert</h1>
      </header>
      <Navbar
        categories={categories}
        onCategoryClick={handleCategoryClick}
      />
      <button className="floating-button" onClick={() => handleEditClick(null)}>
        +
      </button>
      <div className="forms">
        {isFormVisible && (
          <ProductForm
            categories={categories.filter((cat) => cat !== "Expiring Soon")}
            onSubmit={handleFormSubmit}
            editProduct={editProduct}
          />
        )}
      </div>
      {isSubmitted && (
        <img src={logo} alt="Submitted successfully" className="submitted-image" />
      )}
      {selectedCategory && (
        <div>
          <h2>{selectedCategory}</h2>
          {filteredProductsWithStatus.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Expiry Date</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProductsWithStatus.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{new Date(product.expiryDate * 1000).toDateString()}</td>
                    <td>{product.category}</td>
                    <td>{product.status}</td>
                    <td>
                      <button
                        className="edit"
                        onClick={() => handleEditClick(product)}
                      >
                        
                      </button>
                      <button
                        className="delete"
                        onClick={() => handleDeleteClick(product.id)}
                      >
                        
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No products available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
