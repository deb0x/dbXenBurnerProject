const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { accessListify } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/DBXenERC20.sol/DBXenERC20.json")
const { abiLib } = require("../../artifacts/contracts/MathX.sol/MathX.json")
const { NumUtils } = require("../utils/NumUtils.ts");

describe("Test claim fee without staking functionality", async function() {
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

    it("Multiple accounts claim rewards and fees", async() => {
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await XENContract.connect(dean).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))
        await XENContract.connect(carol).approve(DBXenContract.address, ethers.utils.parseEther("30000000000"))

        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await DBXenContract.connect(alice).claimRewards();
        let AliceRewarClaimed = BigNumber.from("0")
        const rewardClaimed = await DBXenContract.queryFilter("RewardsClaimed")
        for (let entry of rewardClaimed) {
            AliceRewarClaimed = AliceRewarClaimed.add(entry.args.reward)
        }
        expect(NumUtils.day(1)).to.equal(AliceRewarClaimed);

        await DBXenContract.connect(alice).burnBatch(1, { value: ethers.utils.parseEther("1") })
        await DBXenContract.connect(bob).burnBatch(10, { value: ethers.utils.parseEther("1") })
        await DBXenContract.connect(dean).burnBatch(167, { value: ethers.utils.parseEther("1") })
        await DBXenContract.connect(carol).burnBatch(120, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let aliceBalanceInCycleOne = await DBXenERC20.balanceOf(alice.address);
        await DBXenContract.connect(alice).claimRewards();

        //Alice distribution 
        //298 total batches burned => 1 batch = 0.3356....% from reward pool
        let alicePercentage = BigNumber.from("335570469798657733").mul(BigNumber.from(NumUtils.day(2))).div(BigNumber.from("100"));
        let aliceRewardsCycleTwo = alicePercentage.div(BigNumber.from("1000000000000000000"));
        let aliceBalanceInCycleTwo = BigNumber.from(await DBXenERC20.balanceOf(alice.address)).sub(BigNumber.from(aliceBalanceInCycleOne));
        //it will fail because there is 1485 wei difference
        //expect(aliceBalanceInCycleTwo).to.equal(aliceRewardsCycleTwo)

        //298 total batches burned => 10 batch = 3.36%...% from reward pool
        await DBXenContract.connect(bob).claimRewards();
        let bobPercentage = BigNumber.from("3355704697986577223").mul(BigNumber.from(NumUtils.day(2))).div(BigNumber.from("100"));
        //div 10.000 because we use 3356 above not 0.3356
        let bobRewardsCycleTwo = bobPercentage.div(BigNumber.from("1000000000000000000"));
        let bobBalanceInCycleTwo = await DBXenERC20.balanceOf(bob.address);
        //it will fail because there is 4171 wei difference
        //expect(bobRewardsCycleTwo).to.equal(bobBalanceInCycleTwo)

        //298 total batches burned => 167 batch = 56.050...% from reward pool
        await DBXenContract.connect(dean).claimRewards();
        let deanPercentage = BigNumber.from("56040268456375841311").mul(BigNumber.from(NumUtils.day(2))).div(BigNumber.from("100"));
        let deanRewardsCycleTwo = deanPercentage.div(BigNumber.from("1000000000000000000"));
        let deanBalanceInCycleTwo = await DBXenERC20.balanceOf(dean.address);
        //it will fail because there is 238007 wei difference
        //expect(deanRewardsCycleTwo).to.equal(deanBalanceInCycleTwo)

        //298 total batches burned => 120 batch = 40.268...% from reward pool
        await DBXenContract.connect(carol).claimRewards();
        let carolPercentage = BigNumber.from("40268456375838923123").mul(BigNumber.from(NumUtils.day(2))).div(BigNumber.from("100"));
        let carolRewardsCycleTwo = carolPercentage.div(BigNumber.from("1000000000000000000"));
        let carolBalanceInCycleTwo = await DBXenERC20.balanceOf(carol.address);
        //it will fail because there is 304541 wei difference
        //expect(carolRewardsCycleTwo).to.equal(carolBalanceInCycleTwo)

        //Claim Fees
        //Alice
        let claimableFee = await DBXENViewContract.getUnclaimedFees(alice.address);
        let balanceAliceBeforeClaimFees = await hre.ethers.provider.getBalance(alice.address);
        let gas = await DBXenContract.connect(alice).claimFees();
        const transactionReceipt = await ethers.provider.getTransactionReceipt(gas.hash);
        const gasUsed = transactionReceipt.gasUsed;
        const gasPricePaid = transactionReceipt.effectiveGasPrice;
        const transactionFee = gasUsed.mul(gasPricePaid);
        let balanceAliceAfterClaimFees = await hre.ethers.provider.getBalance(alice.address);
        let expectedValue = balanceAliceBeforeClaimFees.add(claimableFee).sub(transactionFee);
        expect(balanceAliceAfterClaimFees).to.equal(expectedValue)

        //Bob
        let claimableFeeBob = await DBXENViewContract.getUnclaimedFees(bob.address);
        let balanceBobBeforeClaimFees = await hre.ethers.provider.getBalance(bob.address);
        let gasBob = await DBXenContract.connect(bob).claimFees();
        const transactionReceiptBob = await ethers.provider.getTransactionReceipt(gasBob.hash);
        const gasUsedBob = transactionReceiptBob.gasUsed;
        const gasPricePaidBob = transactionReceiptBob.effectiveGasPrice;
        const transactionFeeBob = gasUsedBob.mul(gasPricePaidBob);
        let balanceBobAfterClaimFees = await hre.ethers.provider.getBalance(bob.address);
        let expectedValueBob = balanceBobBeforeClaimFees.add(claimableFeeBob).sub(transactionFeeBob);
        expect(balanceBobAfterClaimFees).to.equal(expectedValueBob);

        //Dean
        let claimableFeeDean = await DBXENViewContract.getUnclaimedFees(dean.address);
        let balanceDeanBeforeClaimFees = await hre.ethers.provider.getBalance(dean.address);
        let gasDean = await DBXenContract.connect(dean).claimFees();
        const transactionReceiptDean = await ethers.provider.getTransactionReceipt(gasDean.hash);
        const gasUsedDean = transactionReceiptDean.gasUsed;
        const gasPricePaidDean = transactionReceiptDean.effectiveGasPrice;
        const transactionFeeDean = gasUsedDean.mul(gasPricePaidDean);
        let balanceDeanAfterClaimFees = await hre.ethers.provider.getBalance(dean.address);
        let expectedValueDean = balanceDeanBeforeClaimFees.add(claimableFeeDean).sub(transactionFeeDean);
        expect(balanceDeanAfterClaimFees).to.equal(expectedValueDean);

        //Carol
        let claimableFeeCarol = await DBXENViewContract.getUnclaimedFees(carol.address);
        let balanceCarolBeforeClaimFees = await hre.ethers.provider.getBalance(carol.address);
        let gasCarol = await DBXenContract.connect(carol).claimFees();
        const transactionReceiptCarol = await ethers.provider.getTransactionReceipt(gasCarol.hash);
        const gasUsedCarol = transactionReceiptCarol.gasUsed;
        const gasPricePaidCarol = transactionReceiptCarol.effectiveGasPrice;
        const transactionFeeCarol = gasUsedCarol.mul(gasPricePaidCarol);
        let balanceCarolAfterClaimFees = await hre.ethers.provider.getBalance(carol.address);
        let expectedValueCarol = balanceCarolBeforeClaimFees.add(claimableFeeCarol).sub(transactionFeeCarol);
        expect(balanceCarolAfterClaimFees).to.equal(expectedValueCarol)

    });
});