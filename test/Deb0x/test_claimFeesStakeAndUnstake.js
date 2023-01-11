const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { NumUtils } = require("../utils/NumUtils.ts");
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Test claimFeesStakeAndUnstake", async function() {
    let rewardedAlice, rewardedBob, rewardedCarol, rewardedDean, dbxERC20, deb0xViews;
    let alice, bob;
    beforeEach("Set enviroment", async() => {
        [alice, bob, carol, dean, messageReceiver, feeReceiver] = await ethers.getSigners();

        const Deb0x = await ethers.getContractFactory("Deb0x");
        rewardedAlice = await Deb0x.deploy(ethers.constants.AddressZero);
        await rewardedAlice.deployed();

        const Deb0xViews = await ethers.getContractFactory("Deb0xViews");
        deb0xViews = await Deb0xViews.deploy(rewardedAlice.address);
        await deb0xViews.deployed();

        const dbxAddress = await rewardedAlice.dbx()
        dbxERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        rewardedBob = rewardedAlice.connect(bob)
        rewardedCarol = rewardedAlice.connect(carol)
        rewardedDean = rewardedAlice.connect(dean)
    });

    it("11 ether gathered as fees should be fully distributed back to users", async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedCarol.claimRewards();
        let CarolRewarClaimed = BigNumber.from("0")
        const rewardClaimed = await rewardedCarol.queryFilter("RewardsClaimed")
        for (let entry of rewardClaimed) {
            CarolRewarClaimed = CarolRewarClaimed.add(entry.args.reward)
        }
        expect(NumUtils.day(1).div(2)).to.equal(CarolRewarClaimed)

        const carolDBXBalance = await dbxERC20.balanceOf(carol.address)
        await dbxERC20.connect(carol).transfer(bob.address, carolDBXBalance.div(BigNumber.from("2")))
        await dbxERC20.connect(bob).approve(rewardedAlice.address, await dbxERC20.balanceOf(bob.address))
        let BobStakeAmount = await dbxERC20.balanceOf(bob.address);
        await rewardedBob.stake(await dbxERC20.balanceOf(bob.address))

        let BobStakedAmount = BigNumber.from("0")
        const stakedValue = await rewardedBob.queryFilter("Staked");
        for (let entry of stakedValue) {
            BobStakedAmount = BobStakedAmount.add(entry.args.amount)
        }
        expect(BobStakeAmount).to.equal(BobStakedAmount);

        await dbxERC20.connect(carol).transfer(alice.address, await dbxERC20.balanceOf(carol.address))
        await dbxERC20.connect(alice).approve(rewardedAlice.address, await dbxERC20.balanceOf(alice.address))

        let AliceStakeAmount = await dbxERC20.balanceOf(alice.address);
        await rewardedAlice.stake(AliceStakeAmount)
        let AliceAndBobStakedAmount = BigNumber.from("0")
        const stakedValueAlice = await rewardedBob.queryFilter("Staked");
        for (let entry of stakedValueAlice) {
            AliceAndBobStakedAmount = AliceAndBobStakedAmount.add(entry.args.amount)
        }
        let AliceStakedAmount = AliceAndBobStakedAmount.sub(BobStakeAmount)
        expect(AliceStakeAmount).to.equal(AliceStakedAmount);

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob.claimRewards()
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let unstakeAmount = await deb0xViews.getAccWithdrawableStake(alice.address)
        await rewardedAlice.unstake(unstakeAmount)
        const unstakedValueAlice = await rewardedAlice.queryFilter("Unstaked");
        let AliceUnstakedValue = BigNumber.from("0")
        for (let entry of unstakedValueAlice) {
            AliceUnstakedValue = AliceUnstakedValue.add(entry.args.amount)
        }
        expect(unstakeAmount).to.equal(AliceUnstakedValue);
        await rewardedAlice.claimRewards()

        await rewardedAlice.claimFees()
        await rewardedBob.claimFees()
        await rewardedCarol.claimFees()
        const feesClaimed = await rewardedAlice.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = (await rewardedAlice.cycleAccruedFees(0))
            .add(await rewardedAlice.cycleAccruedFees(1))
            .add(await rewardedAlice.cycleAccruedFees(2));

        const remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected);
    });

});