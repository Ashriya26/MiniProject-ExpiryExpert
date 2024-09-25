import Web3 from 'web3';
import ExpiryExpert from './ExpiryExpert.json'; // Adjust the path as necessary

let web3;
let contract;

const initWeb3 = async () => {
  try {
    if (window.ethereum) {
      // Modern dapp browsers...
      web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request user accounts
    } else if (window.web3) {
      // Legacy dapp browsers...
      web3 = new Web3(window.web3.currentProvider);
    } else {
      // Fallback to local node
      const providerUrl = 'http://localhost:8545'; // Default URL if no environment variable
      web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
      console.error('No web3 provider found. Using default provider at http://localhost:8545');
    }

    const networkId = await web3.eth.net.getId();
    const deployedNetwork = ExpiryExpert.networks[networkId];
    
    if (deployedNetwork && deployedNetwork.address) {
      contract = new web3.eth.Contract(
        ExpiryExpert.abi,
        deployedNetwork.address
      );
    } else {
      console.error('Contract not deployed on the current network');
    }
  } catch (error) {
    console.error('Error initializing web3 or contract:', error);
  }
};

// Initialize web3 and contract
initWeb3();

export { web3, contract };
