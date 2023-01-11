const { ethers } = require("hardhat");
require('dotenv').config();
const fs = require('fs');
const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Test DBX tokens distributions", async function() {
    let deployer, bobInstance, bob, deb0x, frontend, dbxERC20;
    beforeEach("Set enviroment", async() => {
        [deployer, bob, messageReceiver, feeReceiver] = await ethers.getSigners();
        const Deb0x = await ethers.getContractFactory("Deb0xRewardEnding");
        deb0x = await Deb0x.deploy(ethers.constants.AddressZero);
        await deb0x.deployed();

        const Deb0xViews = await ethers.getContractFactory("Deb0xViews");
        deb0xViews = await Deb0xViews.deploy(deb0x.address);
        await deb0xViews.deployed();

        const dbxAddress = await deb0x.dbx()
        dbxERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        bobInstance = deb0x.connect(bob);
        frontend = deb0x.connect(feeReceiver)
    })
    it(`Reward ending simulating`, async() => {
        await bobInstance["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine");
        try {
            await bobInstance.claimRewards();
        } catch (error) {
            expect(error.message).to.include("Deb0x: You do not have rewards");
        }

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 21])
        await hre.ethers.provider.send("evm_mine");

        for (let i = 22399; i <= 22532; i++) {
            await bobInstance["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
            await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
            await hre.ethers.provider.send("evm_mine");
            //console.log("Ziua " + i + " reward  " + ethers.utils.formatEther(await deb0x.calculateCycleReward()))
            let data = await deb0xViews.calculateCycleReward()
            if (i === 22532) {
                expect(data).to.equal(0)
            }
        }

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine");
        await bobInstance.claimRewards();

        let balanceForBob = await dbxERC20.balanceOf(bob.address);

        await dbxERC20.connect(bob).approve(deb0x.address, balanceForBob)
        await bobInstance.stake(await dbxERC20.balanceOf(bob.address));
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2])
        await hre.ethers.provider.send("evm_mine");

        let unstakeAmount = await deb0xViews.getAccWithdrawableStake(bob.address);
        expect(unstakeAmount).to.equal(balanceForBob);

        let BobStakedAmount = BigNumber.from("0")
        const stakedValue = await bobInstance.queryFilter("Staked");
        for (let entry of stakedValue) {
            BobStakedAmount = BobStakedAmount.add(entry.args.amount)
        }
        expect(BobStakedAmount).to.equal(balanceForBob);

        await bobInstance.unstake(unstakeAmount)
        const unstakedValueBob = await bobInstance.queryFilter("Unstaked");
        let BobUnstakedValue = BigNumber.from("0")
        for (let entry of unstakedValueBob) {
            BobUnstakedValue = BobUnstakedValue.add(entry.args.amount)
        }
        expect(unstakeAmount).to.equal(BobUnstakedValue);

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 20])
        await hre.ethers.provider.send("evm_mine");

        let balanceForBobAfterTwentyCycles = await dbxERC20.balanceOf(bob.address);
        expect(balanceForBobAfterTwentyCycles).to.equal(balanceForBob);

        await dbxERC20.connect(bob).approve(deb0x.address, balanceForBob)
        await bobInstance.stake(BigNumber.from(balanceForBobAfterTwentyCycles).div(2));
        let balanceAfterStake = await dbxERC20.balanceOf(bob.address);
        expect(balanceAfterStake).to.equal(BigNumber.from(balanceForBobAfterTwentyCycles).div(2));

        let BobStakedAmountAfterTwentyCycles = BigNumber.from("0")
        const stakedValueAfterTwentyCycles = await bobInstance.queryFilter("Staked");
        for (let entry of stakedValueAfterTwentyCycles) {
            BobStakedAmountAfterTwentyCycles = BobStakedAmountAfterTwentyCycles.add(entry.args.amount)
        }
        expect(BigNumber.from(BobStakedAmountAfterTwentyCycles).sub(BigNumber.from(BobUnstakedValue))).to.equal(BigNumber.from(balanceForBobAfterTwentyCycles).div(2));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2])
        await hre.ethers.provider.send("evm_mine");

        let unstakeAmountAfterTwentyCycles = await deb0xViews.getAccWithdrawableStake(bob.address);
        expect(unstakeAmountAfterTwentyCycles).to.equal(BigNumber.from(balanceForBobAfterTwentyCycles).div(2));

        await bobInstance.unstake(unstakeAmountAfterTwentyCycles)
        const unstakedValueBobAfterTwentyCycles = await bobInstance.queryFilter("Unstaked");
        let BobUnstakedValueAfterTwentyCycles = BigNumber.from("0")
        for (let entry of unstakedValueBobAfterTwentyCycles) {
            BobUnstakedValueAfterTwentyCycles = BobUnstakedValueAfterTwentyCycles.add(entry.args.amount)
        }
        expect(unstakeAmountAfterTwentyCycles).to.equal(BigNumber.from(BobUnstakedValueAfterTwentyCycles).sub(BigNumber.from(BobUnstakedValue)));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2])
        await hre.ethers.provider.send("evm_mine");

        await bobInstance["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await dbxERC20.connect(bob).approve(deb0x.address, balanceForBob)
        await bobInstance.stake(BigNumber.from(balanceForBobAfterTwentyCycles).div(2));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine");

        await bobInstance["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine");

        await dbxERC20.connect(bob).approve(deb0x.address, balanceForBob)
        await bobInstance.stake(BigNumber.from(balanceForBobAfterTwentyCycles).div(2));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine");
        await bobInstance.claimFees()

        await bobInstance["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine");

        await bobInstance["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine");

        await bobInstance.claimFees()
        expect(await deb0xViews.deb0xContractBalance()).to.be.lt(1000);

    });
})