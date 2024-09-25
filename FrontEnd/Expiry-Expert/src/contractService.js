import Web3 from "web3";
import ExpiryExpert from "./ExpiryExpert.json"; // Update this path as needed

let web3;
let contract;

const initWeb3 = async () => {
  if (window.ethereum) {
    // Modern dapp browsers...
    web3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.error("User denied account access");
    }
  } else if (window.web3) {
    // Legacy dapp browsers...
    web3 = new Web3(window.web3.currentProvider);
  } else {
    // Non-dapp browsers...
    console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
    web3 = new Web3("http://localhost:7545"); // Fallback to local provider
  }

  const networkId = await web3.eth.net.getId();
  const deployedNetwork = ExpiryExpert.networks[networkId];
  contract = new web3.eth.Contract(
    ExpiryExpert.abi,
    deployedNetwork && deployedNetwork.address
  );
};

const addProduct = async (name, expiryDate) => {
  try {
    // Ensure name is a string and expiryDate is a number
    if (typeof name !== 'string' || isNaN(expiryDate)) {
      throw new Error("Invalid input types");
    }

    const accounts = await web3.eth.getAccounts();
    await contract.methods.addProduct(name, expiryDate).send({ from: accounts[0] });
    console.log("Product added successfully");
  } catch (error) {
    console.error("Error adding product:", error);
  }
};

const deleteProduct = async () => {
  try {
    

    const accounts = await web3.eth.getAccounts();
    await contract.methods.addProduct("", "").send({ from: accounts[0] });
    console.log("Product deleted successfully");
  } 
  catch (error) {
    console.error("Error deleting product:", error);
  }
};

const fetchProducts = async () => {
  const products = await contract.methods.fetchProducts().call();
  return products;
};

const transferProduct = async (id, newOwner) => {
  const accounts = await web3.eth.getAccounts();
  await contract.methods.transferProduct(id, newOwner).send({ from: accounts[0] });
};

const checkExpiry = async (id) => {
  const expiry = await contract.methods.checkExpiry(id).call();
  return expiry;
};

// Function to update a product (if applicable)
const editProductInBlockchain = async (id, name, expiryDate) => {
  const accounts = await web3.eth.getAccounts();
  await contract.methods.editProduct(id, name, expiryDate).send({ from: accounts[0] });
};

export { web3, contract, initWeb3, addProduct, deleteProduct, fetchProducts, transferProduct, checkExpiry, editProductInBlockchain };
