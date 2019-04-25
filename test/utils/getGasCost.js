const BN = require('bn.js');

module.exports = async(txInfo) => {
    const tx = await web3.eth.getTransaction(txInfo.tx);
    const gasCost = tx.gasPrice * txInfo.receipt.gasUsed; 
    return new BN(gasCost);
}