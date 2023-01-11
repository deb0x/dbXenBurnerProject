const { expect, assert } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { ContractFunctionVisibility } = require("hardhat/internal/hardhat-network/stack-traces/model");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { NumUtils } = require("../utils/NumUtils.ts");
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Test DBX tokens distributions to fontend", async function() {
    let userReward, user1Reward, user2Reward, user3Reward, frontend, dbxERC20;
    let user1, user2;
    beforeEach("Set enviroment", async() => {
        [user1, user2, user3, messageReceiver, feeReceiver] = await ethers.getSigners();

        const Deb0x = await ethers.getContractFactory("Deb0x");
        userReward = await Deb0x.deploy(ethers.constants.AddressZero);
        await userReward.deployed();

        const dbxAddress = await userReward.dbx()
        dbxERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        user1Reward = userReward.connect(user1)
        user2Reward = userReward.connect(user2)
        user3Reward = userReward.connect(user3)
        frontend = userReward.connect(feeReceiver)
    })

    it(`Test frontend recieve partial reward`, async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })

        let user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        let user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        let cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let firstDayReward = NumUtils.day(1);

        let lastCycleUser1Reward = firstDayReward.mul(user1GasUsed).div(cycleTotalGasUsed)

        let expectedValueForUser1Cycle1 = lastCycleUser1Reward
        await user1Reward.claimRewards();
        let user1BalanceCycle1 = await dbxERC20.balanceOf(user1.address);
        expect(expectedValueForUser1Cycle1).to.equal(user1BalanceCycle1);

        let lastCycleUser2Reward = firstDayReward.mul(user2GasUsed).div(cycleTotalGasUsed)

        let expectedValueForUser2Cycle1 = lastCycleUser2Reward
        await user2Reward.claimRewards();
        let user2BalanceCycle1 = await dbxERC20.balanceOf(user2.address);
        expect(expectedValueForUser2Cycle1).to.equal(user2BalanceCycle1);

        let expectedValueForFrontendCycle1 = (await user1Reward.clientCycleGasEarned(feeReceiver.address))
            .mul(firstDayReward).div(cycleTotalGasUsed)
        await frontend.claimClientRewards();
        let frontBalanceCycle1 = await dbxERC20.balanceOf(feeReceiver.address);
        expect(expectedValueForFrontendCycle1).to.equal(frontBalanceCycle1);

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        const user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let secondDayReward = NumUtils.day(2);

        lastCycleUser1Reward = secondDayReward.mul(user1GasUsed).div(cycleTotalGasUsed)

        let expectedValueForUser1Cycle2 = lastCycleUser1Reward
        await user1Reward.claimRewards();
        let user1BalanceCycle2 = await dbxERC20.balanceOf(user1.address);
        expect(expectedValueForUser1Cycle1.add(expectedValueForUser1Cycle2)).to.equal(user1BalanceCycle2);

        lastCycleUser2Reward = secondDayReward.mul(user2GasUsed).div(cycleTotalGasUsed)

        let expectedValueForUser2Cycle2 = lastCycleUser2Reward
        await user2Reward.claimRewards();
        let user2BalanceCycle2 = await dbxERC20.balanceOf(user2.address);
        expect(expectedValueForUser2Cycle1.add(expectedValueForUser2Cycle2)).to.equal(user2BalanceCycle2);

        let lastCycleUser3Reward = secondDayReward.mul(user3GasUsed).div(cycleTotalGasUsed)

        let expectedValueForUser3Cycle2 = lastCycleUser3Reward
        await user3Reward.claimRewards();
        let user3BalanceCycle2 = await dbxERC20.balanceOf(user3.address);
        // 1 wei difference 
        expect(expectedValueForUser3Cycle2).to.equal(user3BalanceCycle2);

        let expectedValueForFrontendCycle2 = (await user1Reward.clientCycleGasEarned(feeReceiver.address))
            .mul(secondDayReward).div(cycleTotalGasUsed)
        await frontend.claimClientRewards();
        let frontBalanceCycle2 = await dbxERC20.balanceOf(feeReceiver.address);
        expect(expectedValueForFrontendCycle2.add(expectedValueForFrontendCycle1)).to.equal(frontBalanceCycle2)

    });

    it(`Test frontend recieve all reward`, async() => {
        for (let i = 0; i < 13; i++) {
            await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
                feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        }
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let firstDayReward = NumUtils.day(1);
        try {
            await user2Reward.claimRewards();
        } catch (error) {
            expect(error.message).to.include("Deb0x: account has no rewards");
        }
        let user2BalanceCycle1 = await dbxERC20.balanceOf(user2.address);
        expect(user2BalanceCycle1).to.equal(0);

        try {
            await user1Reward.claimRewards();
        } catch (error) {
            expect(error.message).to.include("Deb0x: account has no rewards");
        }
        let user1BalanceCycle1 = await dbxERC20.balanceOf(user1.address);
        expect(user1BalanceCycle1).to.equal(0);

        await frontend.claimClientRewards();
        let frontBalanceCycle1 = await dbxERC20.balanceOf(feeReceiver.address);
        expect(firstDayReward).to.equal(frontBalanceCycle1);

    });

    it(`Test frontend recieve all reward`, async() => {
        for (let i = 0; i <= 2; i++) {
            await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
                feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        }
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let firstDayReward = NumUtils.day(1);
        try {
            await user2Reward.claimRewards();
        } catch (error) {
            expect(error.message).to.include("Deb0x: account has no rewards");
        }
        let user2BalanceCycle1 = await dbxERC20.balanceOf(user2.address);
        expect(user2BalanceCycle1).to.equal(0);

        try {
            await user1Reward.claimRewards();
        } catch (error) {
            expect(error.message).to.include("Deb0x: account has no rewards");
        }
        let user1BalanceCycle1 = await dbxERC20.balanceOf(user1.address);
        expect(user1BalanceCycle1).to.equal(0);

        await frontend.claimClientRewards();
        let frontBalanceCycle1 = await dbxERC20.balanceOf(feeReceiver.address);
        expect(firstDayReward).to.equal(frontBalanceCycle1);

    });

    it(`Test frontend recieve all reward`, async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let firstDayReward = NumUtils.day(1);
        try {
            await user1Reward.claimRewards();
            assert.fail("Should have thrown error")
        } catch (error) {
            expect(error.message).to.include("Deb0x: account has no rewards");
        }
        let user1BalanceCycle1 = await dbxERC20.balanceOf(user1.address);
        expect(user1BalanceCycle1).to.equal(0);

        try {
            await user2Reward.claimRewards();
        } catch (error) {
            expect(error.message).to.include("Deb0x: account has no rewards");
        }
        let user2BalanceCycle1 = await dbxERC20.balanceOf(user2.address);
        //difference 5 wei
        expect(user2BalanceCycle1).to.equal(0);

        await frontend.claimClientRewards();
        let frontBalanceCycle1 = await dbxERC20.balanceOf(feeReceiver.address);
        expect(firstDayReward).to.equal(frontBalanceCycle1);

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 10000, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let secondDayReward = NumUtils.day(2);
        try {
            await user3Reward.claimRewards();
        } catch (error) {
            expect(error.message).to.include("Deb0x: account has no rewards");
        }
        let user3BalanceCycle2 = await dbxERC20.balanceOf(user3.address);
        //difference 1 wei
        expect(user3BalanceCycle2).to.equal(0);

        try {
            await user2Reward.claimRewards();
        } catch (error) {
            expect(error.message).to.include("Deb0x: account has no rewards");
        }
        let user2BalanceCycle2 = await dbxERC20.balanceOf(user2.address);
        expect(user2BalanceCycle2).to.equal(0);

        await frontend.claimClientRewards();
        let frontBalanceCycle2 = await dbxERC20.balanceOf(feeReceiver.address);
        expect(BigNumber.from(secondDayReward).add(BigNumber.from(firstDayReward))).to.equal(frontBalanceCycle2);

    });
})