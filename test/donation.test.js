const { contractDeployer, expectRevert, getBalance, getGasCost } = require("./utils");

const BN = require('bn.js');
const chai = require('chai');
const bnChai = require('bn-chai');
expect = chai.expect;
chai.use(bnChai(BN));

contract('Ether Donator', function (accounts) {

    const ownerAddress = accounts[1];    
    const donatorAddress = accounts[2];
    const otherAddress = accounts[3];

    const periodDuration = 2;    
    
    async function deployContract () {
        this.contract = await contractDeployer(ownerAddress, periodDuration);
    }

    describe("Withdraw current period", () => {
        const periodsToDonate = 1;
        const donatedInPeriod = 0;
        const weiToDonate = new BN(web3.utils.toWei("0.01", "ether"));

        before(deployContract);
        it("donates for one period", async function () {
            await this.contract.donate(periodsToDonate, {from: donatorAddress, value: weiToDonate});
        });

        it("checks the donation", async function () {
            let donation = await this.contract.getDonationInPeriod(donatorAddress, donatedInPeriod);
            expect(donation).to.eq.BN(weiToDonate);
        });

        it("does not allow to withdraw from donator address", async function() {
            await expectRevert(
                this.contract.withdrawCurrentPeriod({from: donatorAddress})
            );
        })

        it("does not allow to withdraw from other address", async function() {
            await expectRevert(
                this.contract.withdrawCurrentPeriod({from: otherAddress})
            );
        })

        it("allows to withdraw from owner address", async function() {
            await this.contract.withdrawCurrentPeriod({from: ownerAddress});
        })
    });

    describe("Withdraw previous period", () => {
        before(deployContract);
        it("Donate for one period", async function () {
            await this.contract.donate(1, {from: donatorAddress, value: web3.utils.toWei("0.001", "ether")});
        });

        it("does not allow to withdraw previous periods yet", async function() {
            await expectRevert(
                this.contract.withdrawPreviousPeriods({from: ownerAddress})
            );
        })

        it("waits for next period", async function() {
            await sleep(periodDuration * 1000);
            const currentPeriod = await this.contract.getCurrentPeriod();
            assert.equal(currentPeriod, 1, "Unexpected period");
        })

        it("fails to withdraw from other address", async function() {
            await expectRevert(
                this.contract.withdrawPreviousPeriods({from: otherAddress})
            );
        })

        it("withdraws from owner address", async function() {
            await this.contract.withdrawPreviousPeriods({from: ownerAddress});
        })

    });

    describe("Withdraw multiple periods", () => {
        const periods = 5;
        const donationEtherValue = 0.005;
        const weiDonation = new BN(web3.utils.toWei(donationEtherValue.toString(), "ether"));

        before(deployContract);
        it("Donate for five period", async function () {
            await this.contract.donate(periods, {from: donatorAddress, value: weiDonation});
        });

        it("does not allow to withdraw previous periods yet", async function() {
            await expectRevert(
                this.contract.withdrawPreviousPeriods({from: ownerAddress})
            );
        });

        it("waits for next period", async function() {
            await sleep(periodDuration * periods * 1000);
            const currentPeriod = await this.contract.getCurrentPeriod();
            assert.equal(currentPeriod, 5, "Unexpected period");
        });

        it("does not allow to withdraw from other address", async function() {
            await expectRevert(
                this.contract.withdrawPreviousPeriods({from: otherAddress})
            );
        });

        it("withdraws previous periods", async function() {

            balanceBefore = await getBalance(ownerAddress);
            
         
            const txInfo = await this.contract.withdrawPreviousPeriods({from: ownerAddress});
            const gasCost = await getGasCost(txInfo)
            balanceAfter = await getBalance(ownerAddress);
            
            expect(balanceBefore.add(weiDonation).sub(gasCost)).to.eq.BN(balanceAfter);
        });

    });

    describe("Donates and cancel donations", () => {
        const periods = new BN(5);
        const weiValue = new BN(web3.utils.toWei("0.005", "ether"));
        const donationPerPeriod = new BN(weiValue).div(periods);
        const expectedWithdrawal = new BN(weiValue).sub(donationPerPeriod);

        before(deployContract);
        it("Donate for five period", async function () {
            await this.contract.donate(periods, {from: donatorAddress, value: weiValue});
        });

        it("cancels donations for remaining periods periods - withdraws all but active period", async function() {

            balanceBefore = await getBalance(donatorAddress);
            const txInfo = await this.contract.cancelDonations(periods, {from: donatorAddress});
            const gasCost = await getGasCost(txInfo)
            balanceAfter = await getBalance(donatorAddress);
            
            expect(balanceBefore.add(expectedWithdrawal).sub(gasCost)).to.eq.BN(balanceAfter);
        });

        it("cancels donations again - does not withdraw anything", async function() {

            balanceBefore = await getBalance(donatorAddress); 
            const txInfo = await this.contract.cancelDonations(periods, {from: donatorAddress});
            const gasCost = await getGasCost(txInfo)
            balanceAfter = await getBalance(donatorAddress);
            
            expect(balanceBefore.sub(gasCost)).to.eq.BN(balanceAfter);
        });

        it("checks current contract balance", async function() {
            contractBalance = await getBalance(this.contract.address); 
            expect(contractBalance).to.eq.BN(donationPerPeriod);
        });

    });

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});