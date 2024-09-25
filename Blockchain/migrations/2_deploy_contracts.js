const ExpiryExpert = artifacts.require("ExpiryExpert");

module.exports = function(deployer) {
  deployer.deploy(ExpiryExpert);
};
