const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { ContractFunctionVisibility } = require("hardhat/internal/hardhat-network/stack-traces/model");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { NumUtils } = require("../utils/NumUtils.ts");
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Test DBX tokens distributions", async function() {
    let userReward, user1Reward, user2Reward, user3Reward, frontend, dbxERC20, deb0xViews;
    let user1, user2, user3;
    beforeEach("Set enviroment", async() => {
        [user1, user2, user3, messageReceiver, feeReceiver] = await ethers.getSigners();

        const Deb0x = await ethers.getContractFactory("Deb0x");
        userReward = await Deb0x.deploy(ethers.constants.AddressZero);
        await userReward.deployed();

        const Deb0xViews = await ethers.getContractFactory("Deb0xViews");
        deb0xViews = await Deb0xViews.deploy(userReward.address);
        await deb0xViews.deployed();

        const dbxAddress = await userReward.dbx()
        dbxERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        user1Reward = userReward.connect(user1)
        user2Reward = userReward.connect(user2)
        user3Reward = userReward.connect(user3)
        frontend = userReward.connect(feeReceiver)
    })

    //Tests without fees
    it(`Claim rewards after one cycle with no fees, happy case`, async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let firstCycleRewardPerUser = NumUtils.day(1).div(2);
        await user1Reward.claimRewards();
        let balanceForUser1 = await dbxERC20.balanceOf(user1.address);
        expect(firstCycleRewardPerUser).to.equal(balanceForUser1)

        await user2Reward.claimRewards();
        let balanceForUser2 = await dbxERC20.balanceOf(user2.address);
        expect(firstCycleRewardPerUser).to.equal(balanceForUser2)
    });

    it(`Claim rewards after multiple cycle with no fees`, async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        let user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        let user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        let cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycle1User1Reward = NumUtils.day(1).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards();
        let balanceForUser1Cycle1 = await dbxERC20.balanceOf(user1.address);
        expect(cycle1User1Reward).to.equal(balanceForUser1Cycle1)

        let cycle1User2Reward = NumUtils.day(1).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let balanceForUser2Cycle1 = await dbxERC20.balanceOf(user2.address);
        expect(cycle1User2Reward).to.equal(balanceForUser2Cycle1)

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        //Reward to distribute in cycle 2: 9980.039920159680638722
        let cycle2User1Reward = NumUtils.day(2).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards();
        let balanceForUser1Cycle2 = await dbxERC20.balanceOf(user1.address);
        expect(cycle2User1Reward.add(cycle1User1Reward)).to.equal(balanceForUser1Cycle2)

        let cycle2User2Reward = NumUtils.day(2).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let balanceForUser2Cycle2 = await dbxERC20.balanceOf(user2.address);
        expect(cycle2User2Reward.add(cycle1User2Reward)).to.equal(balanceForUser2Cycle2)

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        //Reward to distribute in cycle 3: 9960.119680798084469782
        let cycle3User1Reward = NumUtils.day(3).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards();
        let balanceForUser1Cycle3 = await dbxERC20.balanceOf(user1.address);
        expect(cycle2User1Reward.add(cycle1User1Reward).add(cycle3User1Reward)).to.equal(balanceForUser1Cycle3)
    });

    it(`Claim rewards after multiple cycle with no fees using a single account`, async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimRewards();
        let balanceForUser1Cycle1 = await dbxERC20.balanceOf(user1.address);
        expect(NumUtils.day(1)).to.equal(balanceForUser1Cycle1)

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        //Reward to distribute in cycle 2: 9980.039920159680638722
        let firstCycleReward = NumUtils.day(1);
        let secondCycleReward = NumUtils.day(2);
        await user1Reward.claimRewards();
        let balanceForUser1Cycle2 = await dbxERC20.balanceOf(user1.address);
        let expectedValueCycle2 = BigNumber.from(firstCycleReward).add(BigNumber.from(secondCycleReward));
        expect(expectedValueCycle2).to.equal(balanceForUser1Cycle2)

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        //Reward to distribute in cycle 3: 9960.119680798084469782
        let thirdCycleReward = NumUtils.day(3);
        await user1Reward.claimRewards();
        let balanceForUser1Cycle3 = await dbxERC20.balanceOf(user1.address);
        let expectedValueCycle3 = BigNumber.from(expectedValueCycle2).add(BigNumber.from(thirdCycleReward));
        expect(expectedValueCycle3).to.equal(balanceForUser1Cycle3)
    });

    it(`Claim rewards after multiple cycle with no fees using multiple accounts`, async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        let user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        let user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        let user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        let cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycle1User1Reward = NumUtils.day(1).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards();
        let balanceForUser1Cycle1 = await dbxERC20.balanceOf(user1.address);
        expect(cycle1User1Reward).to.equal(balanceForUser1Cycle1)

        let cycle1User2Reward = NumUtils.day(1).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let balanceForUser2Cycle1 = await dbxERC20.balanceOf(user2.address);
        expect(cycle1User2Reward).to.equal(balanceForUser2Cycle1)

        let cycle1User3Reward = NumUtils.day(1).mul(user3GasUsed).div(cycleTotalGasUsed)
        await user3Reward.claimRewards();
        let balanceForUser3Cycle1 = await dbxERC20.balanceOf(user3.address);
        expect(cycle1User3Reward).to.equal(balanceForUser3Cycle1)

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        //Reward to distribute in cycle 2: 9980.039920159680638722
        let cycle2User1Reward = NumUtils.day(2).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards();
        let balanceForUser1Cycle2 = await dbxERC20.balanceOf(user1.address);
        expect(cycle2User1Reward.add(cycle1User1Reward)).to.equal(balanceForUser1Cycle2);

        let cycle2User2Reward = NumUtils.day(2).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let balanceForUser2Cycle2 = await dbxERC20.balanceOf(user2.address);
        expect(cycle2User2Reward.add(cycle1User2Reward)).to.equal(balanceForUser2Cycle2);

        let cycle2User3Reward = NumUtils.day(2).mul(user3GasUsed).div(cycleTotalGasUsed)
        await user3Reward.claimRewards();
        let balanceForUser3Cycle2 = await dbxERC20.balanceOf(user3.address);
        expect(cycle2User3Reward.add(cycle1User3Reward)).to.equal(balanceForUser3Cycle2);

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycle3User1Reward = NumUtils.day(3).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards();
        let balanceForUser1Cycle3 = await dbxERC20.balanceOf(user1.address);
        expect(cycle3User1Reward.add(cycle2User1Reward.add(cycle1User1Reward)))
            .to.equal(balanceForUser1Cycle3)

        let cycle3User2Reward = NumUtils.day(3).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let balanceForUser2Cycle3 = await dbxERC20.balanceOf(user2.address);
        expect(cycle3User2Reward.add(cycle2User2Reward.add(cycle1User2Reward)))
            .to.equal(balanceForUser2Cycle3)

        let cycle3User3Reward = NumUtils.day(3).mul(user3GasUsed).div(cycleTotalGasUsed)
        await user3Reward.claimRewards();
        let balanceForUser3Cycle3 = await dbxERC20.balanceOf(user3.address);
        expect(cycle3User3Reward.add(cycle2User3Reward.add(cycle1User3Reward)))
            .to.equal(balanceForUser3Cycle3)

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycle4User1Reward = NumUtils.day(4).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards();
        let balanceForUser1Cycle4 = await dbxERC20.balanceOf(user1.address);
        expect(cycle4User1Reward
                .add(cycle3User1Reward.add(cycle2User1Reward.add(cycle1User1Reward))))
            .to.equal(balanceForUser1Cycle4)

        let cycle4User2Reward = NumUtils.day(4).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let balanceForUser2Cycle4 = await dbxERC20.balanceOf(user2.address);
        expect(cycle4User2Reward
                .add(cycle3User2Reward.add(cycle2User2Reward.add(cycle1User2Reward))))
            .to.equal(balanceForUser2Cycle4)

        let cycle4User3Reward = NumUtils.day(4).mul(user3GasUsed).div(cycleTotalGasUsed)
        await user3Reward.claimRewards();
        let balanceForUser3Cycle4 = await dbxERC20.balanceOf(user3.address);
        expect(cycle4User3Reward
                .add(cycle3User3Reward.add(cycle2User3Reward.add(cycle1User3Reward))))
            .to.equal(balanceForUser3Cycle4)
    });

    //Tests caim rewards with fees for frontend

    it(`Single cycle distribution - 10000 DBX reward A(F1-18%) => A claimable rewards = 8200 DBX`, async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1800, 0, { value: ethers.utils.parseEther("1") })

        let user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        let cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycle1User1Reward = NumUtils.day(1).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards()
        let rewardToClaim = await dbxERC20.balanceOf(user1.address);
        expect(cycle1User1Reward).to.equal(rewardToClaim)
    });

    it(`Single cycle distribution, two messages - 10000 DBX reward, USER1 A(F1-18%) => A claimable rewards = 4100 DBX 
                                                 USER2 A(F1-10%) => A claimable rewards = 4500 DBX`, async() => {

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1800, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycle1User1Reward = NumUtils.day(1).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards()
        let rewardToClaimForUser1 = await dbxERC20.balanceOf(user1.address);
        expect(cycle1User1Reward).to.equal(rewardToClaimForUser1)

        let cycle1User2Reward = NumUtils.day(1).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let rewardToClaimForUser2 = await dbxERC20.balanceOf(user2.address);
        expect(cycle1User2Reward).to.equal(rewardToClaimForUser2)
    });

    it(`Three-cycle distribution, three messages - Cycle 1: 10000 DBX reward, USER1 A(F1-10%) => A claimable rewards = 3000 DBX 
                                                               USER2 A(F1-10%) => A claimable rewards = 3000 DBX
                                                               USER3 A(F1-10%) => A claimable rewards = 3000 DBX
                                                      Cycle 2: 9980.039920159680638722, 
                                                      USER1 A(F1 - 10%) =>  A claimable rewards = 2994.0119... DBX
                                                      USER2 A(F1 - 10%) =>  A claimable rewards = 2994.0119... DBX
                                                      USER3 A(F1 - 10%) =>  A claimable rewards = 2994.0119... DBX
                                                      Cycle3: 9960.119680798084469782 
                                                      USER1 A(F1 - 10%) =>  A claimable rewards = 2988.0359... DBX
                                                      USER2 A(F1 - 10%) =>  A claimable rewards = 2988.0359... DBX
                                                      USER3 A(F1 - 10%) =>  A claimable rewards = 2988.0359... DBX`, async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycle1User1Reward = NumUtils.day(1).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards()
        let rewardToClaimForUser1 = await dbxERC20.balanceOf(user1.address);
        expect(cycle1User1Reward).to.equal(rewardToClaimForUser1)

        let cycle1User2Reward = NumUtils.day(1).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let rewardToClaimForUser2 = await dbxERC20.balanceOf(user2.address);
        expect(cycle1User2Reward).to.equal(rewardToClaimForUser2)

        let cycle1User3Reward = NumUtils.day(1).mul(user3GasUsed).div(cycleTotalGasUsed)
        await user3Reward.claimRewards();
        let rewardToClaimForUser3 = await dbxERC20.balanceOf(user3.address);
        expect(cycle1User3Reward).to.equal(rewardToClaimForUser3)

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        // //old balance + actual reward distribution
        let cycle2User1Reward = NumUtils.day(2).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards()
        let rewardToClaimForUser1Cycle2 = await dbxERC20.balanceOf(user1.address);
        expect(cycle2User1Reward.add(cycle1User1Reward)).to.equal(rewardToClaimForUser1Cycle2)

        let cycle2User2Reward = NumUtils.day(2).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let rewardToClaimForUser2Cycle2 = await dbxERC20.balanceOf(user2.address);
        expect(cycle2User2Reward.add(cycle1User2Reward)).to.equal(rewardToClaimForUser2Cycle2)

        let cycle2User3Reward = NumUtils.day(2).mul(user3GasUsed).div(cycleTotalGasUsed)
        await user3Reward.claimRewards();
        let rewardToClaimForUser3Cycle2 = await dbxERC20.balanceOf(user3.address);
        expect(cycle2User3Reward.add(cycle1User3Reward)).to.equal(rewardToClaimForUser3Cycle2)

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        // //old balance + actual reward distribution
        let cycle3User1Reward = NumUtils.day(3).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards()
        let rewardToClaimForUser1Cycle3 = await dbxERC20.balanceOf(user1.address);
        expect(cycle3User1Reward
            .add(cycle2User1Reward).add(cycle1User1Reward)).to.equal(rewardToClaimForUser1Cycle3);

        let cycle3User2Reward = NumUtils.day(3).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let rewardToClaimForUser2Cycle3 = await dbxERC20.balanceOf(user2.address);
        expect(cycle3User2Reward
            .add(cycle2User2Reward).add(cycle1User2Reward)).to.equal(rewardToClaimForUser2Cycle3);

        let cycle3User3Reward = NumUtils.day(3).mul(user3GasUsed).div(cycleTotalGasUsed)
        await user3Reward.claimRewards();
        let rewardToClaimForUser3Cycle3 = await dbxERC20.balanceOf(user3.address);
        expect(cycle3User3Reward
            .add(cycle2User3Reward).add(cycle1User3Reward)).to.equal(rewardToClaimForUser3Cycle3);

    });

    it(`Two cycle distribution, one front with fee another without Cycle 1: 10000 DBX  USER1 A(F1-20%) => A claimable rewards = 4000 DBX 
                                                                                USER2 A => A claimable rewards = 5000 DBX
                                                                        Cycle 2: 9980.039920159680638722 DBX  
                                                                        USER1 A(F1-20%) => A claimable rewards = 2661.3439... DBX 
                                                                        USER2 A => A claimable rewards = 3326.6799... DBX  
                                                                        USER3 A(F1-30%) => A claimable rewards = 2328.6759... DBX`, async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 2000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycle1User1Reward = NumUtils.day(1).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards()
        let rewardToClaimForUser1 = await dbxERC20.balanceOf(user1.address);
        expect(cycle1User1Reward).to.equal(rewardToClaimForUser1)

        let cycle1User2Reward = NumUtils.day(1).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let rewardToClaimForUser2 = await dbxERC20.balanceOf(user2.address);
        expect(cycle1User2Reward).to.equal(rewardToClaimForUser2)

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 2000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 3000, 0, { value: ethers.utils.parseEther("1") })

        user1GasUsed = await user1Reward.accCycleGasUsed(user1.address)
        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycle2User1Reward = NumUtils.day(2).mul(user1GasUsed).div(cycleTotalGasUsed)
        await user1Reward.claimRewards()
        let rewardToClaimForUser1Cycle2 = await dbxERC20.balanceOf(user1.address);
        expect(cycle2User1Reward.add(cycle1User1Reward)).to.equal(rewardToClaimForUser1Cycle2)

        let cycle2User2Reward = NumUtils.day(2).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards();
        let rewardToClaimForUser2Cycle2 = await dbxERC20.balanceOf(user2.address);
        expect(cycle2User2Reward.add(cycle1User2Reward)).to.equal(rewardToClaimForUser2Cycle2)

        let cycle2User3Reward = NumUtils.day(2).mul(user3GasUsed).div(cycleTotalGasUsed)
        await user3Reward.claimRewards();
        let rewardToClaimForUser3Cycle2 = await dbxERC20.balanceOf(user3.address);
        expect(cycle2User3Reward).to.equal(rewardToClaimForUser3Cycle2)
    });

    //Claim fees without staking tokens
    it(`A single cycle, 2 ether gathered as fees should be fully distributed back to users/frontends`, async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimFees()
        await user2Reward.claimFees()
        await frontend.claimClientFees();

        const feesClaimed = await userReward.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = await userReward.cycleAccruedFees(0)

        let totalFeesClaimedFrontend = BigNumber.from("0")
        const feesClaimedAsFrontend = await frontend.queryFilter("ClientFeesClaimed");
        for (let entry of feesClaimedAsFrontend) {
            totalFeesClaimedFrontend = totalFeesClaimedFrontend.add(entry.args.fees)
        }

        const remainder = await hre.ethers.provider.getBalance(userReward.address);
        expect(totalFeesClaimed.add(remainder).add(totalFeesClaimedFrontend)).to.equal(feesCollected);
    });

    it(`Two cycle, 5 ether gathered as fees should be fully distributed back to users/frontends`, async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimFees()
        await user2Reward.claimFees()
        await frontend.claimClientFees();

        let feesClaimed = await userReward.queryFilter("FeesClaimed")
        let totalFeesClaimedCycle1 = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimedCycle1 = totalFeesClaimedCycle1.add(entry.args.fees)
        }

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimFees()
        await user2Reward.claimFees()
        await user3Reward.claimFees()
        await frontend.claimClientFees();

        let feesClaimed2 = await userReward.queryFilter("FeesClaimed")
        let totalFeesClaimedCycle2 = BigNumber.from("0")
        for (let entry of feesClaimed2) {
            totalFeesClaimedCycle2 = totalFeesClaimedCycle2.add(entry.args.fees)
        }
        const feesCollectedBothCycles = (await userReward.cycleAccruedFees(0)).add(await userReward.cycleAccruedFees(1))
        let totalFeesClaimedFrontend = BigNumber.from("0")
        const feesClaimedAsFrontend = await frontend.queryFilter("ClientFeesClaimed");
        for (let entry of feesClaimedAsFrontend) {
            totalFeesClaimedFrontend = totalFeesClaimedFrontend.add(entry.args.fees)
        }
        const remainder = await hre.ethers.provider.getBalance(userReward.address);
        expect(totalFeesClaimedCycle2.add(remainder).add(totalFeesClaimedFrontend)).to.equal(feesCollectedBothCycles)
    });

    it(`Three cycle, 11 ether gathered as fees should be fully distributed back to users/frontends`, async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimFees()
        await user2Reward.claimFees()
        await user3Reward.claimFees()
        await frontend.claimClientFees();

        let feesClaimed = await userReward.queryFilter("FeesClaimed")
        let totalFeesClaimedCycle1 = BigNumber.from("0")
        const feesCollected1 = await user1Reward.cycleAccruedFees(0)
        for (let entry of feesClaimed) {
            totalFeesClaimedCycle1 = totalFeesClaimedCycle1.add(entry.args.fees)
        }
        //expect(totalFeesClaimedCycle1).to.equal(feesCollected1)

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimFees()
        await user2Reward.claimFees()
        await user3Reward.claimFees()
        await frontend.claimClientFees();

        let feesClaimed2 = await userReward.queryFilter("FeesClaimed")
        let totalFeesClaimedCycle2 = BigNumber.from("0")
        const feesCollected2 = (await user1Reward.cycleAccruedFees(0))
            .add(await user1Reward.cycleAccruedFees(1))
        for (let entry of feesClaimed2) {
            totalFeesClaimedCycle2 = totalFeesClaimedCycle2.add(entry.args.fees)
        }
        //expect(totalFeesClaimedCycle2).to.equal(feesCollected2)

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimFees()
        await user2Reward.claimFees()
        await user3Reward.claimFees()
        await frontend.claimClientFees();

        let feesClaimed3 = await userReward.queryFilter("FeesClaimed")
        let totalFeesClaimedCycle3 = BigNumber.from("0")
        for (let entry of feesClaimed3) {
            totalFeesClaimedCycle3 = totalFeesClaimedCycle3.add(entry.args.fees)
        }
        let totalFeesClaimedFrontend = BigNumber.from("0")
        const feesClaimedAsFrontend = await frontend.queryFilter("ClientFeesClaimed");
        for (let entry of feesClaimedAsFrontend) {
            totalFeesClaimedFrontend = totalFeesClaimedFrontend.add(entry.args.fees)
        }

        const feesCollected = (await user1Reward.cycleAccruedFees(0))
            .add(await user1Reward.cycleAccruedFees(1))
            .add(await user1Reward.cycleAccruedFees(2))

        const remainder = await hre.ethers.provider.getBalance(userReward.address);
        expect(totalFeesClaimedCycle3.add(remainder).add(totalFeesClaimedFrontend)).to.equal(feesCollected)
    });

    it("11 ether gathered as fees should be fully distributed back to users and stake, check stake and unstake action", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let amountToStake = NumUtils.day(1).div(2);
        await user3Reward.claimRewards()
        await dbxERC20.connect(user3).approve(userReward.address, await dbxERC20.balanceOf(user3.address))
        await user3Reward.stake(await dbxERC20.balanceOf(user3.address))

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let cycle2User3Reward = NumUtils.day(2).mul(user3GasUsed).div(cycleTotalGasUsed)

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward.claimRewards()
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        //Check reward distribution in cycle 3
        let cycle3User3Reward = NumUtils.day(3).mul(user3GasUsed).div(cycleTotalGasUsed)
        await user3Reward.claimRewards()
        let actualBalanceUser3 = await dbxERC20.balanceOf(user3.address);
        expect(cycle3User3Reward
            .add(cycle2User3Reward)).to.equal(actualBalanceUser3)

        await user3Reward.unstake(await deb0xViews.getAccWithdrawableStake(user3.address))
        let expectedValueUser3ForUnstakeValue = amountToStake;
        let actualBalanceUser3AfterUnstake = await dbxERC20.balanceOf(user3.address);
        //5000 DBX tokens was staked + balance before unstake action
        let excepetedValue = expectedValueUser3ForUnstakeValue.add(BigNumber.from(actualBalanceUser3))
        expect(excepetedValue).to.equal(actualBalanceUser3AfterUnstake)

        await user1Reward.claimFees()
        await user2Reward.claimFees()
        await user3Reward.claimFees()
        const feesClaimed = await user1Reward.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = (await user1Reward.cycleAccruedFees(0))
            .add(await user1Reward.cycleAccruedFees(1))
            .add(await user1Reward.cycleAccruedFees(2))

        const remainder = await hre.ethers.provider.getBalance(userReward.address);
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected)
    });

    it("Stake/Unstake and fronted fees", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 2000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 2000, 0, { value: ethers.utils.parseEther("1") })

        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let userRewardFirstCycle = NumUtils.day(1).div(2);
        let userRewardFirstCycleProcentage = BigNumber.from("20000000000000000000").mul(BigNumber.from(userRewardFirstCycle)).div(BigNumber.from("100000000000000000000"));
        let userTotalRewardFirstCycle = BigNumber.from(userRewardFirstCycle).sub(BigNumber.from(userRewardFirstCycleProcentage))

        let cycle1User2Reward = NumUtils.day(1).mul(user2GasUsed).div(cycleTotalGasUsed)
        await user2Reward.claimRewards()
        await dbxERC20.connect(user2).approve(user1Reward.address, await dbxERC20.balanceOf(user2.address))
        await user2Reward.stake(await dbxERC20.balanceOf(user2.address))

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 2000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 2000, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 2000, 0, { value: ethers.utils.parseEther("1") })

        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        let userRewardSecondCycle = NumUtils.day(2).div(3);
        let userRewardSecondCycleProcentage = BigNumber.from("20000000000000000000").mul(BigNumber.from(userRewardSecondCycle)).div(BigNumber.from("100000000000000000000"));
        let userTotalRewardSecondCycle = BigNumber.from(userRewardSecondCycle).sub(BigNumber.from(userRewardSecondCycleProcentage))


        let cycle2User2Reward = NumUtils.day(2).mul(user2GasUsed).div(cycleTotalGasUsed)
        let cycle2User3Reward = NumUtils.day(2).mul(user3GasUsed).div(cycleTotalGasUsed)

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        user2GasUsed = await user1Reward.accCycleGasUsed(user2.address)
        user3GasUsed = await user1Reward.accCycleGasUsed(user3.address)
        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        //Cycle 3: user3 reward =  4980.059840399042234891
        //Check reward distribution in cycle 3

        let cycle3User2Reward = NumUtils.day(3).mul(user2GasUsed).div(cycleTotalGasUsed)
        let cycle3User3Reward = NumUtils.day(3).mul(user3GasUsed).div(cycleTotalGasUsed)

        let user3RewardInCycle3 = NumUtils.day(3).div(2);
        await user3Reward.claimRewards()
        let expectedValueUser3 = BigNumber.from(userTotalRewardSecondCycle).add(BigNumber.from(user3RewardInCycle3));
        let actualBalanceUser3 = await dbxERC20.balanceOf(user3.address);
        expect(cycle3User3Reward
            .add(cycle2User3Reward)).to.equal(actualBalanceUser3)

        await user2Reward.claimRewards()
        await user2Reward.unstake(await deb0xViews.getAccWithdrawableStake(user2.address))
        let actualBalanceUser2AfterUnstake = await dbxERC20.balanceOf(user2.address);
        let cycle2AndCycle3Value = BigNumber.from(user3RewardInCycle3).add(BigNumber.from(userTotalRewardSecondCycle)).add(BigNumber.from(userTotalRewardFirstCycle))
        expect(cycle3User2Reward
            .add(cycle2User2Reward).add(cycle1User2Reward)).to.equal(actualBalanceUser2AfterUnstake)

        await user1Reward.claimFees()
        await user2Reward.claimFees()
        await user3Reward.claimFees()
        await frontend.claimClientFees();
        const feesClaimed = await user1Reward.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = (await user1Reward.cycleAccruedFees(0))
            .add(await user1Reward.cycleAccruedFees(1))
            .add(await user1Reward.cycleAccruedFees(2))

        let totalFeesClaimedFrontend = BigNumber.from("0")
        const feesClaimedAsFrontend = await frontend.queryFilter("ClientFeesClaimed");
        for (let entry of feesClaimedAsFrontend) {
            totalFeesClaimedFrontend = totalFeesClaimedFrontend.add(entry.args.fees)
        }
        const remainder = await hre.ethers.provider.getBalance(userReward.address);
        expect(totalFeesClaimed.add(remainder).add(totalFeesClaimedFrontend)).to.equal(feesCollected)
    });

    it("Try claim rewards twice and try claim fees", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimRewards()
        let balanceForAlice = await dbxERC20.balanceOf(user1.address);
        expect(balanceForAlice).to.equal(NumUtils.day(1))

        try {
            await user1Reward.claimRewards()
        } catch (error) {
            expect(error.message).to.include("Deb0x: account has no rewards");
        }

        try {
            await user2Reward.claimFees()
        } catch (error) {
            expect(error.message).to.include('Deb0x: amount is zero')
        }
    });

    it("Try claim front rewards twice", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })

        cycleTotalGasUsed = await user1Reward.cycleTotalGasUsed(await user1Reward.currentCycle())

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimFees()
        await user2Reward.claimFees()
        let excepetedValue = (await user1Reward.clientCycleGasEarned(feeReceiver.address))
            .mul(NumUtils.day(1)).div(cycleTotalGasUsed)
        await frontend.claimClientRewards();
        let frontBalance = await dbxERC20.balanceOf(feeReceiver.address)
        expect(excepetedValue).to.equal(frontBalance)

        try {
            await frontend.claimClientRewards();
        } catch (error) {
            expect(error.message).to.include("Deb0x: client has no rewards");
        }
    });

    it("Try claim front rewards but we have no accrued fees ", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        try {
            await frontend.claimClientFees();
        } catch (error) {
            expect(error.message).to.include("Deb0x: amount is zero")
        }
    });

    it("Try to send message without gas", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 1000, 0, { value: ethers.utils.parseEther("1") })

        try {
            await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
                feeReceiver.address, 1000, 0)
        } catch (error) {
            expect(error.message).to.include("Deb0x: value less than required protocol fee")
        }
    });

    it("Try to stake and unstake", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user3Reward.claimRewards()
        await dbxERC20.connect(user3).approve(userReward.address, await dbxERC20.balanceOf(user3.address))
        await user3Reward.stake(await dbxERC20.balanceOf(user3.address))

        try {
            await user2Reward.stake(await deb0xViews.getAccWithdrawableStake(user2.address))
        } catch (error) {
            expect(error.message).to.include("Deb0x: amount is zero");
        }

        try {
            await user2Reward.unstake(await deb0xViews.getAccWithdrawableStake(user2.address))
        } catch (error) {
            expect(error.message).to.include("Deb0x: amount is zero");
        }

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward.claimRewards()
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        //WithdrawableStake value is in this moment 50 DBX, but we try to unstake 51 DBX
        try {
            await user3Reward.unstake(BigNumber.from("51000000000000000000"))
        } catch (error) {
            expect(error.message).to.include("'Deb0x: amount greater than withdrawable stake'")
        }
    });

    it("Multiple stake action and contract balance tests", async() => {
        let balanceBeforeSendMessages = await deb0xViews.deb0xContractBalance();
        expect(parseInt(ethers.utils.formatEther(balanceBeforeSendMessages))).to.equal(0);

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user3Reward.claimRewards()
        await dbxERC20.connect(user3).approve(userReward.address, await dbxERC20.balanceOf(user3.address))
        await user3Reward.stake(await dbxERC20.balanceOf(user3.address))

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user3Reward.claimRewards()
        await dbxERC20.connect(user3).approve(userReward.address, await dbxERC20.balanceOf(user3.address))
        await user3Reward.stake(await dbxERC20.balanceOf(user3.address))

        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await deb0xViews.getAccWithdrawableStake(user3.address);

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await deb0xViews.getAccWithdrawableStake(user3.address);
        await user3Reward.claimRewards()
        await dbxERC20.connect(user3).approve(userReward.address, await dbxERC20.balanceOf(user3.address))
        await user3Reward.stake(await dbxERC20.balanceOf(user3.address))

        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await deb0xViews.getAccWithdrawableStake(user3.address);
        await user3Reward.claimRewards()
        await dbxERC20.connect(user3).approve(userReward.address, await dbxERC20.balanceOf(user3.address))
        await user3Reward.stake(await dbxERC20.balanceOf(user3.address))

        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user3Reward.claimRewards()
        await dbxERC20.connect(user3).approve(userReward.address, await dbxERC20.balanceOf(user3.address))
        await user3Reward.stake(await dbxERC20.balanceOf(user3.address))

        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user3Reward.claimRewards()
        await dbxERC20.connect(user3).approve(userReward.address, await dbxERC20.balanceOf(user3.address))
        await user3Reward.stake(await dbxERC20.balanceOf(user3.address))

        let expectedValue = await deb0xViews.getAccWithdrawableStake(user3.address);
        await user3Reward.unstake(await deb0xViews.getAccWithdrawableStake(user3.address))
        let actualBalanceAfterUnstake = await dbxERC20.balanceOf(user3.address);
        expect(expectedValue).to.equal(actualBalanceAfterUnstake)
    });
})