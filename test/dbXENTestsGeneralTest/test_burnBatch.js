const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/DBXenERC20.sol/DBXenERC20.json")
const { abiLib } = require("../../artifacts/contracts/MathX.sol/MathX.json")
const { NumUtils } = require("../utils/NumUtils.ts");

describe("Test burn functionality", async function() {
    let DBXenContract, DBXENViewContract, DBXenERC20, XENContract, aliceInstance, bobInstance, deanInstance;
    let alice, bob, carol, dean;
    beforeEach("Set enviroment", async() => {
        [deployer, alice, bob, carol, dean, messageReceiver, feeReceiver] = await ethers.getSigners();

        const lib = await ethers.getContractFactory("MathX");
        const library = await lib.deploy();

        const xenContract = await ethers.getContractFactory("XENCryptoMockMint", {
            libraries: {
                MathX: library.address
            }
        });

        XENContract = await xenContract.deploy();
        await XENContract.deployed();

        const Deb0x = await ethers.getContractFactory("DBXen");
        DBXenContract = await Deb0x.deploy(ethers.constants.AddressZero, XENContract.address);
        await DBXenContract.deployed();

        const Deb0xViews = await ethers.getContractFactory("DBXenViews");
        DBXENViewContract = await Deb0xViews.deploy(DBXenContract.address);
        await DBXENViewContract.deployed();

        const dbxAddress = await DBXenContract.dxn()
        DBXenERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        aliceInstance = XENContract.connect(alice);
        bobInstance = XENContract.connect(bob);
        deanInstance = XENContract.connect(dean);
        carolInstance = XENContract.connect(carol);

        await XENContract.approve(deployer.address, ethers.utils.parseEther("30000000000"))
        await XENContract.transferFrom(deployer.address, alice.address, ethers.utils.parseEther("30000000000"))
        await XENContract.approve(deployer.address, ethers.utils.parseEther("30000000000"))
        await XENContract.transferFrom(deployer.address, bob.address, ethers.utils.parseEther("30000000000"))
        await XENContract.approve(deployer.address, ethers.utils.parseEther("30000000000"))
        await XENContract.transferFrom(deployer.address, dean.address, ethers.utils.parseEther("30000000000"))
        await XENContract.approve(deployer.address, ethers.utils.parseEther("30000000000"))
        await XENContract.transferFrom(deployer.address, carol.address, ethers.utils.parseEther("30000000000"))
    });

    it("Simple burn check", async() => {
        let balanceBeforeBurn = await XENContract.balanceOf(alice.address);
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") });

        let balanceAfterBurn = await XENContract.balanceOf(alice.address);
        let tokensForOneBatch = ethers.utils.parseEther("2500000");
        let expectedBalanceAfterBurn = BigNumber.from(balanceBeforeBurn.toString()).sub(BigNumber.from(tokensForOneBatch));
        expect(expectedBalanceAfterBurn).to.equal(balanceAfterBurn);
    });

    it("Multiple batches burn", async() => {
        let actualBalance = await XENContract.balanceOf(alice.address);
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await DBXenContract.connect(alice).burnBatch(2, { value: ethers.utils.parseEther("1") });

        let balanceAfterBurn = await XENContract.balanceOf(alice.address);
        let tokensForTwoBatches = ethers.utils.parseEther("5000000");
        let expectedBalanceAfterBurn = BigNumber.from(actualBalance.toString()).sub(BigNumber.from(tokensForTwoBatches));
        expect(expectedBalanceAfterBurn).to.equal(balanceAfterBurn);

        let actualBalanceAfterFirstBurn = await XENContract.balanceOf(alice.address);
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await DBXenContract.connect(alice).burnBatch(5, { value: ethers.utils.parseEther("1") });

        let balanceAfterFirstBurn = await XENContract.balanceOf(alice.address);
        let tokensForFiveBatch = ethers.utils.parseEther("12500000");
        let expectedBalanceAfterFirstBurn = BigNumber.from(actualBalanceAfterFirstBurn.toString()).sub(BigNumber.from(tokensForFiveBatch));
        expect(expectedBalanceAfterFirstBurn).to.equal(balanceAfterFirstBurn);
    });

    it("Multiple batches, multiple users", async() => {
        let actualBalanceAlice = await XENContract.balanceOf(alice.address);
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await DBXenContract.connect(alice).burnBatch(3, { value: ethers.utils.parseEther("1") });

        let balanceAfterBurnAlice = await XENContract.balanceOf(alice.address);
        let tokensForThreeBatches = ethers.utils.parseEther("7500000");
        let expectedBalanceAfterBurnAlice = BigNumber.from(actualBalanceAlice.toString()).sub(BigNumber.from(tokensForThreeBatches));
        expect(expectedBalanceAfterBurnAlice).to.equal(balanceAfterBurnAlice);
        expect(await XENContract.userBurns(alice.address)).to.equal(BigNumber.from(tokensForThreeBatches))

        let actualBalanceBob = await XENContract.balanceOf(bob.address);
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await DBXenContract.connect(bob).burnBatch(3, { value: ethers.utils.parseEther("1") });
        let balanceAfterBurnBob = await XENContract.balanceOf(bob.address);
        let expectedBalanceAfterBurnBob = BigNumber.from(actualBalanceBob.toString()).sub(BigNumber.from(tokensForThreeBatches));
        expect(expectedBalanceAfterBurnBob).to.equal(balanceAfterBurnBob);
        expect(await XENContract.userBurns(bob.address)).to.equal(BigNumber.from(tokensForThreeBatches))

        let actualBalanceCarol = await XENContract.balanceOf(carol.address);
        await XENContract.connect(carol).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await DBXenContract.connect(carol).burnBatch(1, { value: ethers.utils.parseEther("1") });
        let balanceAfterBurnCarol = await XENContract.balanceOf(carol.address);
        let tokensForOneBatches = ethers.utils.parseEther("2500000");
        let expectedBalanceCarol = BigNumber.from(actualBalanceCarol.toString()).sub(BigNumber.from(tokensForOneBatches));
        expect(expectedBalanceCarol).to.equal(balanceAfterBurnCarol);
        expect(await XENContract.userBurns(carol.address)).to.equal(BigNumber.from(tokensForOneBatches))

        let actualBalanceAfterFirstBurnAlice = await XENContract.balanceOf(alice.address);
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await DBXenContract.connect(alice).burnBatch(3, { value: ethers.utils.parseEther("1") });
        let balanceAfterSecondBurnAlice = await XENContract.balanceOf(alice.address);
        let expectedBalanceAfterFirstBurnAlice = BigNumber.from(actualBalanceAfterFirstBurnAlice.toString()).sub(BigNumber.from(tokensForThreeBatches));
        expect(expectedBalanceAfterFirstBurnAlice).to.equal(balanceAfterSecondBurnAlice);
        expect(await XENContract.userBurns(alice.address)).to.equal(BigNumber.from(tokensForThreeBatches).mul(BigNumber.from("2")))

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 1 * 24])
        await hre.ethers.provider.send("evm_mine")

    });

    it("Claim fees after burn action", async() => {
        let actualBalanceAlice = await XENContract.balanceOf(alice.address);
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await DBXenContract.connect(alice).burnBatch(3, { value: ethers.utils.parseEther("1") });
        let balanceAfterBurnAlice = await XENContract.balanceOf(alice.address);
        let tokensForThreeBatches = ethers.utils.parseEther("7500000");
        let expectedBalanceAfterBurnAlice = BigNumber.from(actualBalanceAlice.toString()).sub(BigNumber.from(tokensForThreeBatches));

        expect(expectedBalanceAfterBurnAlice).to.equal(balanceAfterBurnAlice);
        expect(await XENContract.userBurns(alice.address)).to.equal(BigNumber.from(tokensForThreeBatches))

        let actualBalanceBob = await XENContract.balanceOf(bob.address);
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await DBXenContract.connect(bob).burnBatch(3, { value: ethers.utils.parseEther("1") });

        let balanceAfterBurnBob = await XENContract.balanceOf(bob.address);
        let expectedBalanceAfterBurnBob = BigNumber.from(actualBalanceBob.toString()).sub(BigNumber.from(tokensForThreeBatches));
        expect(expectedBalanceAfterBurnBob).to.equal(balanceAfterBurnBob);
        expect(await XENContract.userBurns(bob.address)).to.equal(BigNumber.from(tokensForThreeBatches))
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).claimRewards()
        await DBXenContract.connect(bob).claimRewards()
    });

})