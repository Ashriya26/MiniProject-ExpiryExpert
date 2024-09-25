import React, { useState, useEffect } from 'react';
import { addProduct, transferProduct, checkExpiry, deleteProduct, fetchProducts } from './contractService'; // Adjust path as per your project structure

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [productId, setProductId] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [expiryResult, setExpiryResult] = useState('');

  useEffect(() => {
    async function fetchProductsFromBlockchain() {
      const productList = await fetchProducts();
      setProducts(productList);
    }
    fetchProductsFromBlockchain();
  }, []);

  async function handleAddProduct() {
    try {
      await addProduct(productName, expiryDate);
      console.log('Product added successfully!');
      // Fetch and update product list
      const productList = await fetchProducts();
      setProducts(productList);
      setProductName('');
      setExpiryDate('');
    } catch (error) {
      console.error('Error adding product:', error);
    }
  }

  async function handleTransferProduct() {
    try {
      await transferProduct(productId, newOwner);
      console.log('Product transferred successfully!');
      // Fetch and update product list
      const productList = await fetchProducts();
      setProducts(productList);
      setProductId('');
      setNewOwner('');
    } catch (error) {
      console.error('Error transferring product:', error);
    }
  }

  async function handleCheckExpiry() {
    try {
      const result = await checkExpiry(productId);
      console.log('Expiry Date:', new Date(result * 1000).toLocaleString());
      setExpiryResult(new Date(result * 1000).toLocaleString());
    } catch (error) {
      console.error('Error checking expiry:', error);
    }
  }

  async function handleDeleteProduct(productId) {
    try {
      await deleteProduct(productId);
      console.log(`Product ${productId} deleted successfully!`);
      setProducts(products.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }

  return (
    <div>
      <h2>Product Manager</h2>
      <div>
        <input
          type="text"
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <input
          type="datetime-local"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
        <button onClick={handleAddProduct}>Add Product</button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
        <input
          type="text"
          placeholder="New Owner Address"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
        />
        <button onClick={handleTransferProduct}>Transfer Product</button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
        <button onClick={handleCheckExpiry}>Check Expiry</button>
        {expiryResult && <p>Expiry Date: {expiryResult}</p>}
      </div>
      <div>
        <h3>Products</h3>
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name} - Expiry: {new Date(product.expiryDate * 1000).toLocaleString()}
              <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProductManager;
