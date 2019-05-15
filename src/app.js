
import $ from 'jquery'
import 'bootstrap'
import { getWeb3Instance, getMainAccount } from './utils/web3Wrapper'

import etherPatronJson from '../build/contracts/EtherPatron.json'
import { testAddress } from 'web3-utils'

let web3
let mainAddress
let etherPatronContract

let days = 28
let ethTarget = '0.5'

init()

$('#startTimestamp').attr('placeholder', getMondayTimeStamp().toString() + ' (This monday, 0:00 in your timezone)')
$('#periodDuration').attr('placeholder', days.toString() + ' days')
$('#periodTarget').attr('placeholder', ethTarget + ' ether')

$('#deployBtn').on('click', () => {
  deploy()
})

async function init () {
  web3 = await getWeb3Instance()
  mainAddress = await getMainAccount(web3)

  console.log('Main address ' + mainAddress)
  if (!mainAddress) {
    console.log('Length ' + $('.metaMaskError').length)
    $('.metaMaskError').removeClass('d-none')
  }

  linkContracts()
}

function linkContracts () {
  etherPatronContract = new web3.eth.Contract(etherPatronJson.abi)
}

function deploy () {
  const startTimeStamp = $('#startTimestamp').val().trim() === '' ? getMondayTimeStamp() : $('#startTimestamp').val().trim()
  const periodDuration = $('#periodDuration').val().trim() === '' ? convertDaysToSeconds(days) : convertDaysToSeconds($('#periodDuration').val().trim())
  let periodTarget = $('#periodTarget').val().trim() === '' ? ethTarget : $('#periodTarget').val().trim()
  let purpose = $('#purpose').val().trim()

  if (purpose === '') {
    $('#purpose').focus()
    return
  }

  purpose = removeHttp(purpose)

  console.log(startTimeStamp)
  console.log(periodDuration)
  console.log(periodTarget)
  console.log(purpose)

  periodTarget = web3.utils.toWei(periodTarget, 'ether')
  purpose = web3.utils.fromAscii(purpose)

  etherPatronContract.deploy({
    data: etherPatronJson.bytecode,
    arguments: [startTimeStamp, periodDuration, periodTarget, purpose]
  }).send({ from: mainAddress })
    .once('confirmation', function (confNumber, receipt) {
      const contractAddress = receipt.contractAddress.toString()
      const interactUrl = 'https://etherpatron.com/interact.html?address=' + contractAddress
      const adminUrl = 'https://etherpatron.com/admin.html?address=' + contractAddress

      $('#interactUrl').html('<a href="' + interactUrl + '" target="_blank">' + interactUrl + '</a>')
      $('#adminUrl').html('<a href="' + adminUrl + '" target="_blank">' + adminUrl + '</a>')

      $('#interactUrl').removeClass('alert-secondary')
      $('#interactUrl').addClass('alert-success')

      $('#adminUrl').removeClass('alert-secondary')
      $('#adminUrl').addClass('alert-success')
    })

  $('#getYourOwn-modal').modal('hide')
  $('#info-modal').modal('show')
}

function removeHttp (url) {
  return url.replace(/(^\w+:|^)\/\//, '')
}

function convertDaysToSeconds (days) {
  return Math.ceil(days * 24 * 60 * 60)
}

function getMondayTimeStamp () {
  var d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + (1 + -7 - d.getDay()) % 7)

  console.log(d)

  console.log(Math.floor(d / 1000))

  return Math.floor(d / 1000)
}
