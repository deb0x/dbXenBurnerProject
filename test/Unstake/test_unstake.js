const { expect, assert } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { NumUtils } = require("../utils/NumUtils.ts");
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Test unstake functionality", async function() {
    let deb0xContract, user1Reward, user2Reward, user3Reward, frontend, dbxERC20, deb0xViews;
    let user1, user2;
    beforeEach("Set enviroment", async() => {
        [user1, user2, user3, messageReceiver, feeReceiver] = await ethers.getSigners();

        const Deb0x = await ethers.getContractFactory("Deb0x");
        deb0xContract = await Deb0x.deploy(ethers.constants.AddressZero);
        await deb0xContract.deployed();

        const Deb0xViews = await ethers.getContractFactory("Deb0xViews");
        deb0xViews = await Deb0xViews.deploy(deb0xContract.address);
        await deb0xViews.deployed();

        const dbxAddress = await deb0xContract.dbx()
        dbxERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        user1Reward = deb0xContract.connect(user1)
        user2Reward = deb0xContract.connect(user2)
        user3Reward = deb0xContract.connect(user3)
        frontend = deb0xContract.connect(feeReceiver)
    })

    it("Stake action from a single account and check user address stake amount", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user3Reward.claimRewards()
        let user3Balance = await dbxERC20.balanceOf(user3.address);
        //User3balanceDiv 4 will be 12.5 (50/4)
        let user3BalanceDiv4 = BigNumber.from(user3Balance).div(BigNumber.from("4"));
        let balanceBigNumberFormat = BigNumber.from(user3BalanceDiv4.toString());
        await dbxERC20.connect(user3).approve(deb0xContract.address, user3Balance)
        await user3Reward.stake(balanceBigNumberFormat)

        //console.log("Balance account after first stake: " + ethers.utils.formatEther(await dbxERC20.balanceOf(user3.address)))
        await user3Reward.stake(balanceBigNumberFormat)
            //console.log("Balance account after second stake: " + ethers.utils.formatEther(await dbxERC20.balanceOf(user3.address)))

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await user3Reward.claimRewards();
        await user3Reward.stake(balanceBigNumberFormat)
            //console.log("Balance account after third stake but in second cycle: " + ethers.utils.formatEther(await dbxERC20.balanceOf(user3.address)))
            //console.log("Acc  " + ethers.utils.formatEther(await deb0xViews.getAccWithdrawableStake(user3.address)))

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let valueToUnstake = await deb0xViews.getAccWithdrawableStake(user3.address);
        //console.log(valueToUnstake)
        expect(valueToUnstake).to.equal(BigNumber.from("3750000000000000000000"))
            //console.log("Valut for unstake: " + ethers.utils.formatEther(valueToUnstake))
        await user3Reward.unstake("37000000000000000000")

        //console.log("Value after unstake  " + ethers.utils.formatEther(await deb0xViews.getAccWithdrawableStake(user3.address)))

        let amoutToUnstakeAfterTwoStakeActionInFirstCycle = ethers.utils.formatEther(await deb0xViews.getAccWithdrawableStake(user3.address));
        //console.log("Value after unstake  " + amoutToUnstakeAfterTwoStakeActionInFirstCycle);

    });

    it("Action during gap cycles should convert stake back to rewards and not grant fees for that stake", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimRewards()

        const user1accAccruedFees1 = await user1Reward.accAccruedFees(user1.address)
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let user1Balance = await dbxERC20.balanceOf(user1.address);
        await dbxERC20.connect(user1).approve(deb0xContract.address, user1Balance)
        await user1Reward.stake(user1Balance)

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.unstake(user1Balance)
        const user1accAccruedFees2 = await user1Reward.accAccruedFees(user1.address)
        expect(await dbxERC20.balanceOf(user1.address)).to.equal(user1Balance)
        expect(user1accAccruedFees2).equal(user1accAccruedFees1)

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        const user1accAccruedFees3 = await user1Reward.accAccruedFees(user1.address)
        expect(user1accAccruedFees3).equal(user1accAccruedFees2)

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
            //console.log((await hre.ethers.provider.getBalance(deb0xContract.address)).toString())

        await user1Reward.claimFees()

        feesClaimed = await user1Reward.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = (await user1Reward.cycleAccruedFees(0))
            .add(await user1Reward.cycleAccruedFees(6))

        const remainder = await hre.ethers.provider.getBalance(user1Reward.address);
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected)
    })

    it("Action during gap cycles should convert stake back to rewards and not grant fees for that stake", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimRewards()
        const user1accAccruedFees1 = await user1Reward.accAccruedFees(user1.address)

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        let user1Balance = await dbxERC20.balanceOf(user1.address)
        await dbxERC20.connect(user1).approve(deb0xContract.address, user1Balance)
        await user1Reward.stake(user1Balance.div(BigNumber.from("2")))

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2])
        await hre.ethers.provider.send("evm_mine")

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await user1Reward.claimFees()

        let feesClaimed = await user1Reward.queryFilter("FeesClaimed")
        let user1ClaimedFees = BigNumber.from("0")
        for (let entry of feesClaimed) {
            user1ClaimedFees = user1ClaimedFees.add(entry.args.fees)
        }
        expect(user1ClaimedFees).to.equal(user1accAccruedFees1)
            // const user1accAccruedFees1 = await user1Reward.accAccruedFees(user1.address)
            // console.log(user1accAccruedFees1.toString())
            // await user1Reward.unstake(user1Balance.div(BigNumber.from("2")))
            // const user1accAccruedFees2 = await user1Reward.accAccruedFees(user1.address)
            // console.log(user1accAccruedFees2.toString())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimFees()
        await user2Reward.claimFees()

        feesClaimed = await user1Reward.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = (await user1Reward.cycleAccruedFees(0))
            .add(await user1Reward.cycleAccruedFees(2))
            .add(await user1Reward.cycleAccruedFees(4))

        const remainder = await hre.ethers.provider.getBalance(user1Reward.address);
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected)
    })

    it("Staking before reward cycle start and after should properly unlock in the next cycles", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimRewards()

        let user1Balance = await dbxERC20.balanceOf(user1.address)
        await dbxERC20.connect(user1).approve(deb0xContract.address, user1Balance)
        await user1Reward.stake(user1Balance.div(BigNumber.from("2")))

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await user1Reward.stake(user1Balance.div(BigNumber.from("2")))

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.unstake(user1Balance.div(BigNumber.from("2")))

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimFees()
        await user2Reward.claimFees()

        feesClaimed = await user1Reward.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = (await user1Reward.cycleAccruedFees(0))
            .add(await user1Reward.cycleAccruedFees(1))
            .add(await user1Reward.cycleAccruedFees(2))

        const remainder = await hre.ethers.provider.getBalance(user1Reward.address);
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected)
    })

    it("Staking before reward cycle start and after should properly unlock both stakes after two cycles", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimRewards()

        let user1Balance = await dbxERC20.balanceOf(user1.address)
        await dbxERC20.connect(user1).approve(deb0xContract.address, user1Balance)
        await user1Reward.stake(user1Balance.div(BigNumber.from("2")))

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await user1Reward.stake(user1Balance.div(BigNumber.from("2")))

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimFees()
        await user2Reward.claimFees()

        feesClaimed = await user1Reward.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = (await user1Reward.cycleAccruedFees(0))
            .add(await user1Reward.cycleAccruedFees(1))
            .add(await user1Reward.cycleAccruedFees(2))

        const remainder = await hre.ethers.provider.getBalance(user1Reward.address);
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected)
    })

    it("Try to unstake more than you have ", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await user3Reward.claimRewards()
        let user3Balance = await dbxERC20.balanceOf(user3.address);
        let user3BalanceDiv4 = user3Balance.div(4);
        let balanceBigNumberFormat = BigNumber.from(user3BalanceDiv4.toString());
        await dbxERC20.connect(user3).approve(deb0xContract.address, user3Balance)
        await user3Reward.stake(balanceBigNumberFormat)

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        expect(await deb0xViews.getAccWithdrawableStake(user3.address)).to.equal(balanceBigNumberFormat)

        await user3Reward.claimRewards();
        await user3Reward.stake(balanceBigNumberFormat)

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        let expectedStake = balanceBigNumberFormat.mul(2);
        expect(await deb0xViews.getAccWithdrawableStake(user3.address)).to.equal(expectedStake)

        try {
            await user3Reward.unstake("3700000000000000000000")
        } catch (error) {
            expect(error.message).to.include("Deb0x: amount greater than withdrawable stake")
        }
    })

    it("Should not be able to unstake in the same cycle in which DBX was staked(stake before message)", async function() {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimRewards()

        let user1Balance = await dbxERC20.balanceOf(user1.address)
        await dbxERC20.connect(user1).approve(deb0xContract.address, user1Balance)

        await user1Reward.stake(user1Balance.div(BigNumber.from("2")))
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        try {
            await user1Reward.unstake(user1Balance.div(BigNumber.from("2")))
            assert.fail("Should have thrown error")
        } catch (error) {
            expect(error.message).to.include("Deb0x: amount greater than withdrawable stake");
        }

    })
    it("Should not be able to unstake in the same cycle in which DBX was staked(stake after message)", async function() {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimRewards()

        let user1Balance = await dbxERC20.balanceOf(user1.address)
        await dbxERC20.connect(user1).approve(deb0xContract.address, user1Balance)

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward.stake(user1Balance.div(BigNumber.from("2")))

        try {
            await user1Reward.unstake(user1Balance.div(BigNumber.from("2")))
            assert.fail("Should have thrown error")
        } catch (error) {
            expect(error.message).to.include("Deb0x: amount greater than withdrawable stake");
        }

    })
    it("Can unstake next day if the stake was done before first message that day", async function() {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimRewards()
        let user1Balance = await dbxERC20.balanceOf(user1.address)
        await dbxERC20.connect(user1).approve(deb0xContract.address, user1Balance.mul(BigNumber.from("10")))
        await user1Reward.stake(user1Balance.div(2))
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await user1Reward.stake(user1Balance.div(BigNumber.from("2")))
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_mine")
        expect(await deb0xViews.getAccWithdrawableStake(user1.address)).to.equal(user1Balance.div(BigNumber.from("2")))

        await user1Reward.unstake(user1Balance.div(2))
            // 50 token from last stake they will be free only in the next cycle! 
        expect(await deb0xViews.getAccWithdrawableStake(user1.address)).to.equal("0");
    })

});