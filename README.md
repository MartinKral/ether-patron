# [EtherPatron.com](https://etherpatron.com) - Trustless open source crowdfunding
* Withdrawing is based on periods (duration is chosen at contract deployment).
* Owner can withdraw only current or previous periods.


## Benefits for the owner
* Receive money from community 
* 100% of profit goes to you
* Allows access levels*
* Allows leaderboard both for current period and all periods
* Set up minimum donation per period
* You can use EtherPatron.com interface or create your own and host it on your website for full independence

(*)Requires server, which will get signature from user, read the contract and act on that (`getDonationInPeriod`) 

## Benefits for the user
* Can donate for current + X future periods
* Can cancel funding at any time and withdraw all future donations - even if contract owner decides to shut down their website

## Interface
* For your Patrons: https://etherpatron.com/interact.html?address=YourContractAddress
* Admin interface: https://etherpatron.com/admin.html?address=YourContractAddress

## Customize interface and host it on your website
* Install: `npm install`
* Run: `npm start`
* Modify interact.html and src/interact.js as you want
(If your interface will serve only one contract, you can change `getQueryVariable('address')` to `'YourContractAddress'`)
* Build: npm run build
* Upload interact.html and dist/interact.js into a folder on your webserver 



