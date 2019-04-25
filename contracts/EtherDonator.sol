pragma solidity ^0.5.2;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";


contract EtherDonator is Ownable {
    uint256 private startTimestamp;
    uint256 private periodDuration;

    uint256 private minDonation = 0.001 ether;    

    uint256 private lastWithdrawnPeriod = 0;

    using SafeMath for uint256;

    mapping(uint256 => uint256) private periodToAllowedWithdrawal; 

    mapping(bytes32 => uint256) private hashedDonations;

    address[] private donators;
    mapping(address => bool) private addressToIsDonator;
    
    constructor(uint256 _startTimestamp, uint256 _periodDuration) public {
        startTimestamp = _startTimestamp;
        periodDuration = _periodDuration;
    }

    function donate(uint8 _periods) external payable {
        require(minDonation * _periods <= msg.value, "Donation is less than minimum value");
        require(0 < _periods, "Must donate to at least one period");

        uint256 currentPeriod = getCurrentPeriod();        
        uint256 donationPerPeriod = msg.value.div(_periods);

        for (uint8 i = 0; i < _periods; i++) {            
            uint256 targetPeriod = currentPeriod + i;
            periodToAllowedWithdrawal[targetPeriod] = periodToAllowedWithdrawal[targetPeriod].add(donationPerPeriod);

            bytes32 hashedDonation = keccak256(abi.encodePacked(msg.sender, targetPeriod));
            hashedDonations[hashedDonation] = hashedDonations[hashedDonation].add(donationPerPeriod);
        }

        addDonatorToList();
    }

    function cancelDonations(uint8 _periods) external {
        require(0 < _periods, "Must refund donation from at least one period");

        uint256 currentPeriod = getCurrentPeriod();
        uint256 sumToRefund = 0;

        // Starts at 1 >> can't refund current period
        for (uint8 i = 1; i <= _periods; i++) {
            bytes32 hashedDonation = keccak256(abi.encodePacked(msg.sender, currentPeriod + i));
            sumToRefund = sumToRefund.add(hashedDonations[hashedDonation]);
            hashedDonations[hashedDonation] = 0;
        }

        msg.sender.transfer(sumToRefund);
    }

    function setMinDonation(uint256 _minDonation) external onlyOwner {
        minDonation = _minDonation;
    }

    function withdrawPreviousPeriods() external onlyOwner {
        uint256 currentPeriod = getCurrentPeriod();
        uint256 sumToWithdraw = 0;

        for (uint256 i = lastWithdrawnPeriod; i < currentPeriod; i++) {
            sumToWithdraw = sumToWithdraw.add(periodToAllowedWithdrawal[i]);
            periodToAllowedWithdrawal[i] = 0;
        }       

        lastWithdrawnPeriod = currentPeriod.sub(1); 
        msg.sender.transfer(sumToWithdraw);
    }

    function withdrawCurrentPeriod() external onlyOwner {
        uint256 currentPeriod = getCurrentPeriod();
        uint256 sumToWithdraw = periodToAllowedWithdrawal[currentPeriod];
        periodToAllowedWithdrawal[currentPeriod] = 0;
        msg.sender.transfer(sumToWithdraw);
    }

    function getMinDonation() external view returns (uint256) {
        return minDonation;
    }

    function getDonationsOfAddress(address _address) external view returns (uint256) {
        uint256 currentPeriod = getCurrentPeriod();
        uint256 totalDonated = 0;
        for (uint256 i = 0; i <= currentPeriod; i++) {
            bytes32 hashedDonation = keccak256(abi.encodePacked(_address, currentPeriod + i));
            totalDonated = totalDonated.add(hashedDonations[hashedDonation]);
        }

        return totalDonated;
    }

    function getDonators() external view returns (address[] memory) {
        return donators;
    }

    function getDonationInPeriod(address _address, uint256 _periodId) external view returns (uint256) {
        return hashedDonations[keccak256(abi.encodePacked(_address, _periodId))];
    }

    function getCurrentPeriod() public view returns(uint256) {
        require(startTimestamp <= now, "The contract is not active yet");
        return now.sub(startTimestamp).div(periodDuration);
    }

    function addDonatorToList() private {
        if (!addressToIsDonator[msg.sender]) {
            addressToIsDonator[msg.sender] = true;
            donators.push(msg.sender);
        }
    }

}