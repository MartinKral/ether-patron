/* global ethereum */

import Web3 from 'web3'

export async function getWeb3Instance () {
  console.log('Connecting to MM')
  let web3
  if (window.ethereum) {
    web3 = new Web3(ethereum)
    await window.ethereum.enable()
  } else if (window.web3) {
    web3 = new Web3(web3.currentProvider)
  } else {
    console.log('App needs access to MM before deploying new giveaway!')
    // web3 = new Web3('wss://ropsten.infura.io/ws/v3/8eb854bf2d5f412db783635b320d1771');
  }
  return web3
}

export async function getMainAccount (web3) {
  const currentAccounts = await web3.eth.getAccounts()
  return currentAccounts[0]
}
