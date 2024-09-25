// src/components/DeleteProductComponent/index.js

import React, { useState, useEffect } from 'react';
import { deleteProduct, fetchProducts } from '../../contractService'; // Adjust path as necessary

function DeleteProductComponent() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadProducts() {
      const productList = await fetchProducts();
      setProducts(productList);
    }
    loadProducts();
  }, []);

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      alert(`Product ${productId} deleted successfully`);
      setProducts(products.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  return (
    <div>
      <h2>Delete Products</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} (Expiry: {new Date(product.expiryDate * 1000).toLocaleString()})
            <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DeleteProductComponent;
