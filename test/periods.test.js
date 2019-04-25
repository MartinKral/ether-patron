const { contractDeployer } = require("./utils");

contract('Ether Donator', function (accounts) {

    const ownerAddress = accounts[1];
    const periodDuration = 5;
    
    async function deployContract () {
        this.contract = await contractDeployer(ownerAddress, periodDuration);
    }

    beforeEach(deployContract);

    describe("Check periods", () => {
        const firstDelay = 1000;
        const secondDelay = 5500;
        const thirdDelay = 11000;

        it("checks periods after 1 sec delay", async function () {    
            await sleep(firstDelay);

            const expectedPeriod = 0;

            const currentPeriod = await this.contract.getCurrentPeriod();
            assert.equal(currentPeriod, expectedPeriod, "Unexpected period ID");
        });

        it("checks periods after 5.5 sec delay", async function () {
            await sleep(secondDelay);

            const expectedPeriod = 1;

            const currentPeriod = await this.contract.getCurrentPeriod();
            assert.equal(currentPeriod, expectedPeriod, "Unexpected period ID");
        });

        it("checks periods after 11 sec delay", async function () {
            await sleep(thirdDelay);

            const expectedPeriod = 2;

            const currentPeriod = await this.contract.getCurrentPeriod();
            assert.equal(currentPeriod, expectedPeriod, "Unexpected period ID");
        });
    });

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});