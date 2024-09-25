// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ExpiryExpert {
    struct Product {
        string name;
        uint256 expiryDate; // Unix timestamp of expiry date
    }

    mapping(uint256 => Product) public products;
    mapping(address => Product[]) public userProducts;
    uint256 public productCount;

    event ProductAdded(uint256 productId, string name, uint256 expiryDate, address owner);
    event ProductEdited(uint256 productId, string name, uint256 expiryDate);
    event ProductTransferred(uint256 productId, address from, address to);
    event ProductExpired(uint256 productId, string name, uint256 expiryDate, address owner);
    event ProductDeleted(uint256 productId);

    function addProduct(string memory _name, uint256 _expiryDate) public {
        productCount++;
        products[productCount] = Product(_name, _expiryDate);
        userProducts[msg.sender].push(Product(_name, _expiryDate));
        emit ProductAdded(productCount, _name, _expiryDate, msg.sender);
    }

    function editProduct(uint256 _productId, string memory _name, uint256 _expiryDate) public {
        require(_productId > 0 && _productId <= productCount, "Product does not exist.");
        Product storage product = products[_productId];

        bool found = false;
        for (uint256 i = 0; i < userProducts[msg.sender].length; i++) {
            if (
                keccak256(abi.encodePacked(userProducts[msg.sender][i].name)) == keccak256(abi.encodePacked(product.name)) &&
                userProducts[msg.sender][i].expiryDate == product.expiryDate
            ) {
                userProducts[msg.sender][i].name = _name;
                userProducts[msg.sender][i].expiryDate = _expiryDate;
                found = true;
                break;
            }
        }

        require(found, "Product not found in user's list.");
        product.name = _name;
        product.expiryDate = _expiryDate;
        emit ProductEdited(_productId, _name, _expiryDate);
    }

    function transferProduct(uint256 _productId, address _newOwner) public {
        require(_productId > 0 && _productId <= productCount, "Product does not exist.");
        Product storage product = products[_productId];
        require(
            keccak256(abi.encodePacked(product.name)) == keccak256(abi.encodePacked(userProducts[msg.sender][0].name)) &&
            product.expiryDate == userProducts[msg.sender][0].expiryDate,
            "Product not found in user's list."
        );

        userProducts[_newOwner].push(product);
        delete userProducts[msg.sender][0];
        userProducts[msg.sender].pop();
        emit ProductTransferred(_productId, msg.sender, _newOwner);
    }

    function checkExpiry(uint256 _productId) public {
        require(_productId > 0 && _productId <= productCount, "Product does not exist.");
        Product storage product = products[_productId];
        require(block.timestamp >= product.expiryDate, "Product has not expired yet.");
        emit ProductExpired(_productId, product.name, product.expiryDate, msg.sender);
    }

    function deleteProduct(uint256 _productId) public {
        require(_productId > 0 && _productId <= productCount, "Product does not exist.");
        Product storage product = products[_productId];

        bool found = false;
        for (uint256 i = 0; i < userProducts[msg.sender].length; i++) {
            if (
                keccak256(abi.encodePacked(userProducts[msg.sender][i].name)) == keccak256(abi.encodePacked(product.name)) &&
                userProducts[msg.sender][i].expiryDate == product.expiryDate
            ) {
                delete userProducts[msg.sender][i];
                userProducts[msg.sender][i] = userProducts[msg.sender][userProducts[msg.sender].length - 1];
                userProducts[msg.sender].pop();
                found = true;
                break;
            }
        }

        require(found, "Product not found in user's list.");
        delete products[_productId];
        emit ProductDeleted(_productId);
    }
}
