var etherPatron = artifacts.require('./EtherPatron.sol')

module.exports = function (deployer) {
  deployer.deploy(etherPatron, 0, 0, 0, [])
}
