var etherDonator = artifacts.require("./EtherDonator.sol");


module.exports = function(deployer) {
  deployer.deploy(etherDonator, 0, 0);  
};