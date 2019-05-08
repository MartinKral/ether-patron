const EtherPatron = artifacts.require('./EtherPatron.sol')

const periodTarget = web3.utils.toWei('1', 'ether')
const purpose = web3.utils.fromAscii('Ether Patron Test')

module.exports = async (ownerAddress, periodDuration, startOffset = 0) => {
  const currentTimeStamp = await getCurrentTimeStamp()
  const startTime = currentTimeStamp - startOffset
  return EtherPatron.new(startTime, periodDuration, periodTarget, purpose, { from: ownerAddress })
}

async function getCurrentTimeStamp () {
  var date = new Date()
  var ethTimestamp = Math.floor(date.getTime() / 1000)
  console.log('Timestamp: ' + ethTimestamp)
  return ethTimestamp
}
