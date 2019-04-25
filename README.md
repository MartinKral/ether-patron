# Ether Donator - Trustless open source crowdfunding
* Withdrawing is based on periods (chosen at contract deployment).
* Owner can withdraw only current or previous periods.


## Benefits for the owner
* Receive money from community 
* 100% of profit goes to you
* Allows access levels*
* Allows leaderboard both for current period and all periods
* Set up minimum donation per period

## Benefits for the user
* Can donate for current + X future periods
* Can cancel funding at any time and withdraw all future donations - even if contract owner decides to shut down their website

(*)Requires server, which will get signature from user, read the contract and act on that (`getDonationInPeriod`) 

## TODO:
* More tests
* Web interface
* Example website