const { contractDeployer } = require("./utils");

contract('Ether Donator', function (accounts) {

    const ownerAddress = accounts[1];
    const periodDuration = 5;
    
    async function deployContract () {
        this.contract = await contractDeployer(ownerAddress, periodDuration);
    }

    beforeEach(deployContract);

    describe("Check periods", () => {
        const oneSecond = 1;
        const sevenSeconds = 7;
        const elevenSeconds = 11;        

        it("checks  time left without delay", async function () {            

            const periodTimeLeft = await this.contract.getPeriodTimeLeft();

            const expectedTimeLeft = 5;
            assert.equal(periodTimeLeft, expectedTimeLeft, "Unexpected period time left");
        });

        it("checks time left after 1 sec", async function () { 
            await sleepSeconds(oneSecond);
            const periodTimeLeft = await this.contract.getPeriodTimeLeft();

            const expectedTimeLeft = 4;
            assert.equal(periodTimeLeft, expectedTimeLeft, "Unexpected period time left");
        });

        it("checks time left after 7 sec", async function () { 
            await sleepSeconds(sevenSeconds);
            const periodTimeLeft = await this.contract.getPeriodTimeLeft();

            const expectedTimeLeft = 3;
            assert.equal(periodTimeLeft, expectedTimeLeft, "Unexpected period time left");
        });

        it("checks periods after 1 sec", async function () {    
            await sleepSeconds(oneSecond);

            const expectedPeriod = 0;

            const currentPeriod = await this.contract.getCurrentPeriod();
            assert.equal(currentPeriod, expectedPeriod, "Unexpected period ID");
        });

        it("checks periods after 5.5 sec", async function () {
            await sleepSeconds(sevenSeconds);

            const expectedPeriod = 1;

            const currentPeriod = await this.contract.getCurrentPeriod();
            assert.equal(currentPeriod, expectedPeriod, "Unexpected period ID");
        });

        it("checks periods after 11 sec", async function () {
            await sleepSeconds(elevenSeconds);

            const expectedPeriod = 2;

            const currentPeriod = await this.contract.getCurrentPeriod();
            assert.equal(currentPeriod, expectedPeriod, "Unexpected period ID");
        });
    });

    function sleepSeconds(s) {
        return new Promise(resolve => setTimeout(resolve, s * 1000 + 1));
    }
});