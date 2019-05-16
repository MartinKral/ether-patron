pragma solidity ^0.5.2;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";


contract EtherPatron is Ownable {
    uint256 private startTimestamp;
    uint256 public periodDuration;
    uint256 public periodTarget; 
    bytes32 public purpose;
    
    uint256 public minDonation = 0.001 ether;    

    uint256 public lastWithdrawnPeriod = 0;   
    
    address[] private donators;    

    mapping(uint256 => uint256) private periodToAllowedWithdrawal; 
    mapping(uint256 => uint256) private periodToDonations;

    mapping(bytes32 => uint256) private hashedDonations;

    mapping(address => bool) private addressToIsDonator;
    
    

    event DonationEvent (
        address donator,
        uint256 donation,
        uint8 periods
    );

    using SafeMath for uint256;
    
    constructor(uint256 _startTimestamp, uint256 _periodDuration, uint256 _periodTarget, bytes32 _purpose) public {
        startTimestamp = _startTimestamp;
        periodDuration = _periodDuration;
        purpose = _purpose;
        periodTarget = _periodTarget;
    }

    function donate(uint8 _periods) external payable {
        require(minDonation * _periods <= msg.value, "Donation is less than minimum value");
        require(0 < _periods, "Must donate to at least one period");

        uint256 currentPeriod = getCurrentPeriod();        
        uint256 donationPerPeriod = msg.value.div(_periods);

        for (uint8 i = 0; i < _periods; i++) {            
            uint256 targetPeriod = currentPeriod + i;
            periodToAllowedWithdrawal[targetPeriod] = periodToAllowedWithdrawal[targetPeriod].add(donationPerPeriod);

            periodToDonations[targetPeriod] = periodToDonations[targetPeriod].add(donationPerPeriod);

            bytes32 hashedDonation = keccak256(abi.encodePacked(msg.sender, targetPeriod));
            hashedDonations[hashedDonation] = hashedDonations[hashedDonation].add(donationPerPeriod);
        }

        addDonatorToList();

        emit DonationEvent(msg.sender, msg.value, _periods);
    }

    function cancelDonations(uint8 _periods) external {
        require(0 < _periods, "Must refund donation from at least one period");

        uint256 currentPeriod = getCurrentPeriod();
        uint256 sumToRefund = 0;

        // Starts at 1 >> can't refund current period
        for (uint8 i = 1; i <= _periods; i++) {
            bytes32 hashedDonation = keccak256(abi.encodePacked(msg.sender, currentPeriod + i));

            periodToDonations[currentPeriod + i] = periodToDonations[currentPeriod + i].sub(hashedDonations[hashedDonation]);

            sumToRefund = sumToRefund.add(hashedDonations[hashedDonation]);
            hashedDonations[hashedDonation] = 0;            
        }

        msg.sender.transfer(sumToRefund);
    }

    function setMinDonation(uint256 _minDonation) external onlyOwner {
        minDonation = _minDonation;
    }

    function setPeriodTarget(uint256 _periodTarget) external onlyOwner {
        periodTarget = _periodTarget;
    }

    function setPurpose(bytes32 _purpose) external onlyOwner {
        purpose = _purpose;
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

    function getAllowedWithdrawalInPeriod(uint256 _periodId) external view returns (uint256) {
        return periodToAllowedWithdrawal[_periodId];
    }

    function getTotalPeriodDonations(uint256 _periodId) external view returns (uint256) {
        return periodToDonations[_periodId];
    }

    function getPeriodTimeLeft() external view returns (uint256) {
        uint256 endOfThisPeriod = startTimestamp.add(getCurrentPeriod().add(1).mul(periodDuration));
        return endOfThisPeriod.sub(now);       
    }

    function getAllDonationsOfAddress(address _address) external view returns (uint256) {
        uint256 currentPeriod = getCurrentPeriod();
        uint256 totalDonated = 0;
        for (uint256 i = 0; i <= currentPeriod; i++) {
            totalDonated = totalDonated.add(getAddressDonationInPeriod(_address, i));
        }

        return totalDonated;
    }   

    function getDonators() external view returns (address[] memory) {
        return donators;
    }

    function getAddressDonationInPeriod(address _address, uint256 _periodId) public view returns (uint256) {
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