const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { abiLib } = require("../../artifacts/contracts/MathX.sol/MathX.json")
const { NumUtils } = require("../utils/NumUtils.ts");

describe.only("Test claim fee with stake", async function() {
    let DBXenContract, DBXENViewContract, DBXenERC20, XENContract, aliceInstance, bobInstance, deanInstance, frontend;
    let alice, bob, carol, dean;
    beforeEach("Set enviroment", async() => {
        [alice, bob, carol, dean, messageReceiver, feeReceiver] = await ethers.getSigners();

        const lib = await ethers.getContractFactory("MathX");
        const library = await lib.deploy();

        const xenContract = await ethers.getContractFactory("XENCrypto", {
            libraries: {
                MathX: library.address
            }
        });

        XENContract = await xenContract.deploy();
        await XENContract.deployed();

        const Deb0x = await ethers.getContractFactory("Deb0x");
        DBXenContract = await Deb0x.deploy(ethers.constants.AddressZero, XENContract.address);
        await DBXenContract.deployed();

        const Deb0xViews = await ethers.getContractFactory("Deb0xViews");
        DBXENViewContract = await Deb0xViews.deploy(DBXenContract.address);
        await DBXENViewContract.deployed();

        const dbxAddress = await DBXenContract.dbx()
        DBXenERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        aliceInstance = XENContract.connect(alice);
        bobInstance = XENContract.connect(bob);
        deanInstance = XENContract.connect(dean);
        carolInstance = XENContract.connect(carol);
        frontend = DBXenContract.connect(feeReceiver)
    });

    it("Claim fees, stake and unstake action", async() => {
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();

        let actualBalance = await XENContract.balanceOf(alice.address);
        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(2, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });

        let balanceAfterBurn = await XENContract.balanceOf(alice.address);
        let tokensForOneBatch = ethers.utils.parseEther("500000");
        let expectedBalanceAfterBurn = BigNumber.from(actualBalance.toString()).sub(BigNumber.from(tokensForOneBatch));
        expect(expectedBalanceAfterBurn).to.equal(balanceAfterBurn);

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 2 * 24])
        await hre.ethers.provider.send("evm_mine")

        let unclaimedReward = await DBXENViewContract.getUnclaimedRewards(alice.address);
        await DBXenContract.connect(alice).claimRewards();
        let aliceClaimedReward = BigNumber.from("0")
        const rewardClaimed = await DBXenContract.queryFilter("RewardsClaimed")
        for (let entry of rewardClaimed) {
            aliceClaimedReward = aliceClaimedReward.add(entry.args.reward)
        }
        expect(unclaimedReward).to.equal(aliceClaimedReward)

        let aliceDBXenBalace = await DBXenERC20.balanceOf(alice.address);
        await DBXenERC20.connect(alice).transfer(bob.address, aliceDBXenBalace.div(BigNumber.from("2")));
        await DBXenERC20.connect(bob).approve(DBXenContract.address, await DBXenERC20.balanceOf(bob.address) + 1)
        let BobStakeAmount = await DBXenERC20.balanceOf(bob.address);
        await DBXenContract.connect(bob).stake(BobStakeAmount)

        let BobStakedAmount = BigNumber.from("0")
        const stakedValue = await DBXenContract.queryFilter("Staked");
        for (let entry of stakedValue) {
            BobStakedAmount = BobStakedAmount.add(entry.args.amount)
        }
        expect(BobStakeAmount).to.equal(BobStakedAmount);

        await DBXenERC20.connect(alice).transfer(carol.address, await DBXenERC20.balanceOf(alice.address))
        await DBXenERC20.connect(carol).approve(DBXenContract.address, await DBXenERC20.balanceOf(carol.address))

        let CarolStakeAmount = await DBXenERC20.balanceOf(carol.address);
        await DBXenContract.connect(carol).stake(CarolStakeAmount)
        let CarolAndBobStakedAmount = BigNumber.from("0")
        const stakedValueAlice = await DBXenContract.queryFilter("Staked");
        for (let entry of stakedValueAlice) {
            CarolAndBobStakedAmount = CarolAndBobStakedAmount.add(entry.args.amount)
        }

        let CarolActualStake = CarolAndBobStakedAmount.sub(BobStakeAmount)
        expect(CarolStakeAmount).to.equal(CarolActualStake);

        await aliceInstance.claimRank(100);
        await carolInstance.claimRank(100);
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await aliceInstance.claimMintReward();
        await aliceInstance.claimRank(100);
        await carolInstance.claimMintReward();
        await carolInstance.claimRank(100);
        await bobInstance.claimMintReward();
        await bobInstance.claimRank(100);
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 101 * 24])
        await hre.ethers.provider.send("evm_mine")
        await carolInstance.claimMintReward();
        await bobInstance.claimMintReward();
        await aliceInstance.claimMintReward();

        await XENContract.connect(alice).approve(DBXenContract.address, ethers.utils.parseEther("500000"))
        await DBXenContract.connect(alice).burnBatch(2, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(bob).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 2 * 24])
        await hre.ethers.provider.send("evm_mine")

        await XENContract.connect(carol).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(carol).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });
        await DBXenContract.connect(alice).claimRewards();
        await XENContract.connect(bob).approve(DBXenContract.address, ethers.utils.parseEther("250000"))
        await DBXenContract.connect(bob).burnBatch(1, feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") });

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let unstakeAmountForBob = await DBXENViewContract.getAccWithdrawableStake(bob.address)
        let unstakeAmountForCarol = await DBXENViewContract.getAccWithdrawableStake(carol.address)
        await DBXenContract.connect(bob).unstake(unstakeAmountForBob)
        await DBXenContract.connect(carol).unstake(unstakeAmountForBob)
        const unstakedValueBob = await DBXenContract.queryFilter("Unstaked");
        let BobUnstakedValue = BigNumber.from("0")
        for (let entry of unstakedValueBob) {
            BobUnstakedValue = BobUnstakedValue.add(entry.args.amount)
        }
        expect(BigNumber.from(unstakeAmountForBob).add(BigNumber.from(unstakeAmountForCarol))).to.equal(BobUnstakedValue);

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let aliceUnclaimedFee = await DBXENViewContract.getUnclaimedFees(alice.address);
        let bobUnclaimedFee = await DBXENViewContract.getUnclaimedFees(bob.address);
        let carolUnclaimedFee = await DBXENViewContract.getUnclaimedFees(carol.address);
        let totalUnclaimedFees = BigNumber.from(aliceUnclaimedFee).add(BigNumber.from(bobUnclaimedFee).add(BigNumber.from(carolUnclaimedFee)));

        await DBXenContract.connect(carol).claimRewards();

        await DBXenContract.connect(alice).claimFees();
        await DBXenContract.connect(bob).claimFees();
        await DBXenContract.connect(carol).claimFees();

        const feesClaimed = await DBXenContract.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }

        expect(totalUnclaimedFees).to.equal(totalFeesClaimed);
    });


});