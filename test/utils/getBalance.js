const BN = require('bn.js');

module.exports = async (address) => {
    return new BN(await web3.eth.getBalance(address));
};