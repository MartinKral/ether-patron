
import $ from 'jquery'
import 'bootstrap'
import { getWeb3Instance, getMainAccount } from './utils/web3Wrapper'
import { getQueryVariable } from './utils/getQueryVariable'

import etherPatronJson from '../build/contracts/EtherPatron.json'

import BN from 'bn.js'

let web3
let mainAddress
let etherPatronContract

console.log('interact')
init()

$('#donateBtn').on('click', () => {
  donate()
})

$('#refundBtn').on('click', () => {
  refund()
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
  readPurposeUrl()
  readEthProgress()
  readTimeProgress()
  readDonations()
  readRefund()
}

async function readPurposeUrl () {
  const bytesUrl = await etherPatronContract.methods.purpose.call()
  const url = web3.utils.toAscii(bytesUrl)
  $('#purpose-url').html(url)
  $('#donateModalTitle').html('Donate to ' + url)
  $('#refundModalTitle').html('Get refund from ' + url)
}

async function readEthProgress () {
  const currentPeriod = await etherPatronContract.methods.getCurrentPeriod().call()
  const currentValue = await etherPatronContract.methods.getTotalPeriodDonations(currentPeriod).call()
  const targetValue = await etherPatronContract.methods.periodTarget.call()
  const progress = currentValue / targetValue * 100

  $('#eth-progress-bar-text').html(web3.utils.fromWei(currentValue.toString(), 'ether') + ' / ' + web3.utils.fromWei(targetValue.toString(), 'ether') + ' eth')

  $('#eth-progress-bar').attr('aria-valuenow', progress.toString())
  $('#eth-progress-bar').css('width', progress.toString() + '%')
}

async function readTimeProgress () {
  const periodDuration = await etherPatronContract.methods.periodDuration.call()
  const timeLeft = await etherPatronContract.methods.getPeriodTimeLeft().call()

  console.log('Period duration ' + periodDuration)
  console.log('Time left' + timeLeft)

  const periodDurationDays = periodDuration / 24 / 60 / 60
  const timeLeftDays = Math.round(timeLeft / 24 / 60 / 60 * 10) / 10

  const progress = ((periodDuration - timeLeft) / periodDuration) * 100

  $('#time-progress-bar-text').html(timeLeftDays.toString() + '  days left ' + '(out of ' + periodDurationDays.toString() + ')')
  $('#daysInPeriod').html('One period is ' + periodDurationDays + ' days')
  $('#time-progress-bar').attr('aria-valuenow', progress.toString())
  $('#time-progress-bar').css('width', progress.toString() + '%')
}

async function readDonations () {
  const totalDonated = await etherPatronContract.methods.getAllDonationsOfAddress(mainAddress).call()
  const ethDonated = web3.utils.fromWei(totalDonated.toString(), 'ether')
  console.log('Total donated ' + ethDonated)

  $('#total-donated').html('You donated <b>' + ethDonated + '</b> eth so far. </br> Thank you!')

  const minDonationPerPeriod = await etherPatronContract.methods.minDonation.call()
  const ethMinDonation = web3.utils.fromWei(minDonationPerPeriod.toString(), 'ether')
  $('#minDonationPerPeriod').html('Minimum donation is ' + ethMinDonation + ' eth per period')
}

async function donate () {
  const donatePeriods = $('#donatePeriods').val().trim() === '' ? '1' : $('#donatePeriods').val().trim()
  const sumToDonate = $('#sumToDonate').val().trim() === '' ? '0.01' : $('#sumToDonate').val().trim()

  etherPatronContract.methods.donate(donatePeriods).send({ from: mainAddress, value: web3.utils.toWei(sumToDonate, 'ether') })
    .once('confirmation', function (confNumber, receipt) {
      console.log('Confirmation ' + receipt.toString())
    })
}

async function readRefund () {
  const currentPeriod = await etherPatronContract.methods.getCurrentPeriod().call()

  let totalToRefund = new BN()
  for (let index = 1; index <= 12; index++) {
    const donationPerPeriod = await etherPatronContract.methods.getAddressDonationInPeriod(mainAddress, parseInt(currentPeriod) + index).call()
    console.log('Donation per period ' + donationPerPeriod)
    totalToRefund = totalToRefund.add(new BN(donationPerPeriod.toString()))
  }

  $('#amountToRefund').html('You can refund <b>&nbsp;' + web3.utils.fromWei(totalToRefund.toString(), 'ether') + '&nbsp;</b> eth (counted from 12 next periods)')
}

function refund () {
  const refundPeriods = $('#refundPeriods').val().trim() === '' ? '12' : $('#refundPeriods').val().trim()

  etherPatronContract.methods.cancelDonations(refundPeriods).send({ from: mainAddress })
    .once('confirmation', function (confNumber, receipt) {
      console.log('Confirmation ' + receipt.toString())
    })
}
