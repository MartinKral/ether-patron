const EtherDonator = artifacts.require("./EtherDonator.sol");

module.exports = async (ownerAddress, periodDuration, startOffset = 0) => {
    const currentTimeStamp = await getCurrentTimeStamp();
    const startTime = currentTimeStamp - startOffset;  
    return await EtherDonator.new(startTime, periodDuration, { from: ownerAddress});
    
}

async function getCurrentTimeStamp(){
    var date = new Date();
    var ethTimestamp = Math.floor(date.getTime() / 1000);
    console.log("Timestamp: "  + ethTimestamp);
    return ethTimestamp;
}


