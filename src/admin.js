import $ from 'jquery'
import 'bootstrap'
import { getWeb3Instance, getMainAccount } from './utils/web3Wrapper'
import { getQueryVariable } from './utils/getQueryVariable'

import etherPatronJson from '../build/contracts/EtherPatron.json'

import BN from 'bn.js'

let web3
let mainAddress
let etherPatronContract

init()

$('#withdraw-current').on('click', () => {
  withdrawCurrent()
})

$('#withdraw-previous').on('click', () => {
  withdrawPrevious()
})

async function init () {
  web3 = await getWeb3Instance()
  mainAddress = await getMainAccount(web3)

  linkContracts()
  readData()
}

function linkContracts () {
  etherPatronContract = new web3.eth.Contract(etherPatronJson.abi, getQueryVariable('address'))
}

async function readData () {
  const currentPeriod = await etherPatronContract.methods.getCurrentPeriod.call()

  const currentDonations = await etherPatronContract.methods.getAllowedWithdrawalInPeriod(currentPeriod).call()
  $('#currentDonations').html(web3.utils.fromWei(currentDonations.toString(), 'ether') + ' Ether')

  if (currentPeriod > 0) {
    const lastWithdrawnPeriod = await etherPatronContract.methods.lastWithdrawnPeriod.call()
    let totalAllowedWithdrawal = new BN(0)

    for (let periodIndex = lastWithdrawnPeriod; periodIndex < currentPeriod; periodIndex++) {
      const allowedWithdrawal = await etherPatronContract.methods.getAllowedWithdrawalInPeriod(periodIndex).call()
      console.log('Allowed withdrawal ' + allowedWithdrawal + ' period: ' + currentPeriod)
      totalAllowedWithdrawal = totalAllowedWithdrawal.add(new BN(allowedWithdrawal.toString()))
    }

    $('#previousDonations').html(web3.utils.fromWei(totalAllowedWithdrawal, 'ether') + ' Ether')
  }
}

function withdrawCurrent () {
  console.log('WITHDRAW CURRENT')
  etherPatronContract.methods.withdrawCurrentPeriod().send({ from: mainAddress })
}

function withdrawPrevious () {
  console.log('WITHDRAW PREVIOUS')
  etherPatronContract.methods.withdrawPreviousPeriods().send({ from: mainAddress })
}
