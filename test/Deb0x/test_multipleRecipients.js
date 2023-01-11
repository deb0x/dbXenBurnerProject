const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { ContractFunctionVisibility } = require("hardhat/internal/hardhat-network/stack-traces/model");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { NumUtils } = require("../utils/NumUtils.ts");
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Test reward distribution for multiple recipients", async function() {
    let userReward, user1Reward, user2Reward, user3Reward, frontend, dbxERC20;
    let user1, user2;
    beforeEach("Set enviroment", async() => {
        [user1, user2, user3, user4, user5, user6, user7, user8, user9, user10, messageReceiver, feeReceiver] = await ethers.getSigners();

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

    it(`Test multiple recipients simple case`, async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address, user2.address, user3.address], [payload, payload, payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycle1User1Reward = NumUtils.day(1).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards();
        let balanceForUser1 = await dbxERC20.balanceOf(user1.address);
        expect(cycle1User1Reward).to.equal(balanceForUser1)

        let cycle1User2Reward = NumUtils.day(1).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let balanceForUser2 = await dbxERC20.balanceOf(user2.address);
        expect(cycle1User2Reward).to.equal(balanceForUser2)
    });

    it(`Test multiple recipients, multiple cycles`, async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address, user2.address], [payload, payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycle1User1Reward = NumUtils.day(1).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards();
        let balanceForUser1 = await dbxERC20.balanceOf(user1.address);
        expect(cycle1User1Reward).to.equal(balanceForUser1)

        let cycle1User2Reward = NumUtils.day(1).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let balanceForUser2 = await dbxERC20.balanceOf(user2.address);
        expect(cycle1User2Reward).to.equal(balanceForUser2)

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address, user2.address], [payload, payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycle2User1Reward = NumUtils.day(2).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards();
        let balanceForUser1Cycle2 = await dbxERC20.balanceOf(user1.address);
        expect(cycle2User1Reward
            .add(cycle1User1Reward)).to.equal(balanceForUser1Cycle2)

        let cycle2User2Reward = NumUtils.day(2).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let balanceForUser2Cycle2 = await dbxERC20.balanceOf(user2.address);
        expect(cycle2User2Reward
            .add(cycle1User2Reward)).to.equal(balanceForUser2Cycle2)

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address, user2.address], [payload, payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycle3User1Reward = NumUtils.day(3).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards();
        let balanceForUser1Cycle3 = await dbxERC20.balanceOf(user1.address);
        expect(cycle3User1Reward
            .add(cycle2User1Reward).add(cycle1User1Reward)).to.equal(BigNumber.from(balanceForUser1Cycle3))

        let cycle3User2Reward = NumUtils.day(3).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let balanceForUser2Cycle3 = await dbxERC20.balanceOf(user2.address);
        expect(cycle3User2Reward
            .add(cycle2User2Reward).add(cycle1User2Reward)).to.equal(balanceForUser2Cycle3)

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address, user2.address], [payload, payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address, user1.address], [payload, payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        // 1 wei difference 
        let cycle4User1Reward = NumUtils.day(4).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards();
        let balanceForUser1Cycle4 = await dbxERC20.balanceOf(user1.address);
        expect(cycle4User1Reward
            .add(cycle3User1Reward).add(cycle2User1Reward)
            .add(cycle1User1Reward)).to.equal(balanceForUser1Cycle4)

        let cycle4User2Reward = NumUtils.day(4).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let balanceForUser2Cycle4 = await dbxERC20.balanceOf(user2.address);
        expect(cycle4User2Reward
            .add(cycle3User2Reward).add(cycle2User2Reward)
            .add(cycle1User2Reward)).to.equal(balanceForUser2Cycle4)

        // 1 wei difference 
        let cycle4User3Reward = NumUtils.day(4).mul(user3GasUsed).div(cycleTotalGasUsed)
        await user3Reward.claimRewards();
        let balanceForUser3Cycle4 = await dbxERC20.balanceOf(user3.address);
        expect(cycle4User3Reward).to.equal(balanceForUser3Cycle4);

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address, user2.address, user1.address], [payload, payload, payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address, user1.address, user2.address], [payload, payload, payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address, user1.address], [payload, payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        // 1 wei difference 
        let cycle5User1Reward = NumUtils.day(5).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards();
        let balanceForUser1Cycle5 = await dbxERC20.balanceOf(user1.address);
        expect(cycle5User1Reward.add(cycle4User1Reward)
            .add(cycle3User1Reward).add(cycle2User1Reward)
            .add(cycle1User1Reward)).to.equal(balanceForUser1Cycle5)

        // 1 wei difference
        let cycle5User2Reward = NumUtils.day(5).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let balanceForUser2Cycle5 = await dbxERC20.balanceOf(user2.address);
        expect(cycle5User2Reward.add(cycle4User2Reward)
            .add(cycle3User2Reward).add(cycle2User2Reward)
            .add(cycle1User2Reward)).to.equal(balanceForUser2Cycle5)

        let cycle5User3Reward = NumUtils.day(5).mul(user3GasUsed).div(cycleTotalGasUsed)
        await user3Reward.claimRewards();
        let balanceForUser3Cycle5 = await dbxERC20.balanceOf(user3.address);
        expect(cycle5User3Reward
            .add(cycle4User3Reward)).to.equal(balanceForUser3Cycle5);
    });

    it(`Test multiple recipients simple case`, async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address, user2.address, user3.address, user4.address, user5.address, user6.address, user7.address, user8.address, user9.address, user10.address], [payload, payload, payload, payload, payload, payload, payload, payload, payload, payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycle1User1Reward = NumUtils.day(1).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards();
        let balanceForUser1 = await dbxERC20.balanceOf(user1.address);
        expect(cycle1User1Reward).to.equal(balanceForUser1)

        let cycle1User2Reward = NumUtils.day(1).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let balanceForUser2 = await dbxERC20.balanceOf(user2.address);
        expect(cycle1User2Reward).to.equal(balanceForUser2)
    });


})