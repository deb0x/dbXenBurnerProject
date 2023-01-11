const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { NumUtils } = require("../utils/NumUtils.ts");
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Test stake functionality", async function() {
    let deb0xContract, user1Reward, user2Reward, user3Reward, frontend, dbxERC20, deb0xViews;
    let user1, user2, user3;
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
        //User3balanceDiv 4 will be 125 (50/4)
        let user3BalanceDiv4 = BigNumber.from(user3Balance).div(BigNumber.from("4"))
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
        let balanceInSecoundCycle = ethers.utils.formatEther(await dbxERC20.balanceOf(user3.address));
        await user3Reward.claimRewards();
        let balanceInSecoundCycleAfterClaimRewards = ethers.utils.formatEther(await dbxERC20.balanceOf(user3.address));
        let rewardDistributedInSecoundCyle = balanceInSecoundCycleAfterClaimRewards - balanceInSecoundCycle;
        //console.log("Reward distributed from second cycle: " + rewardDistributedInSecoundCyle);
        await user3Reward.stake(balanceBigNumberFormat)
            //console.log("Balance account after third stake but in second cycle: " + ethers.utils.formatEther(await dbxERC20.balanceOf(user3.address)))

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let amoutToUnstakeAfterTwoStakeActionInFirstCycle = ethers.utils.formatEther(await deb0xViews.connect(user3).getAccWithdrawableStake(user3.address));
        expect(parseInt(amoutToUnstakeAfterTwoStakeActionInFirstCycle)).to.equal(3750);

        await user3Reward.stake(balanceBigNumberFormat)
            //console.log("Balance account after fourth stake but in second cycle: " + ethers.utils.formatEther(await dbxERC20.balanceOf(user3.address)))

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let amoutToUnstakeAfterAnotherStakeInSecoundCycle = ethers.utils.formatEther(await deb0xViews.connect(user3).getAccWithdrawableStake(user3.address));
        expect(parseFloat(amoutToUnstakeAfterAnotherStakeInSecoundCycle)).to.equal(5000);

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        let amoutToUnstakeAfterAnotherStakeInThirdCyle = ethers.utils.formatEther(await deb0xViews.connect(user3).getAccWithdrawableStake(user3.address));
        expect(parseFloat(amoutToUnstakeAfterAnotherStakeInThirdCyle)).to.equal(5000);

    });

    it("Stake action from multiple accounts and check user address stake amount", async() => {
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user2Reward.claimRewards()
        const stakeFirstCycle = await dbxERC20.balanceOf(user2.address)
        await dbxERC20.connect(user2).approve(user1Reward.address, stakeFirstCycle)
        await user2Reward.stake(await dbxERC20.balanceOf(user2.address))

        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")


        await user1Reward.claimRewards()
        let amountStakeInFirtCycleFirstAccount = ethers.utils.formatEther(await dbxERC20.balanceOf(user1.address));
        await dbxERC20.connect(user1).approve(user1Reward.address, await dbxERC20.balanceOf(user1.address))
        await user1Reward.stake(await dbxERC20.balanceOf(user1.address))

        await user2Reward.claimRewards()
        await dbxERC20.connect(user2).approve(user1Reward.address, await dbxERC20.balanceOf(user2.address))
        const stakeSecondCycle = await dbxERC20.balanceOf(user2.address)
        await user2Reward.stake(stakeSecondCycle)

        await user3Reward.claimRewards()
        let amountStakeInFirtCycleThirdAccount = ethers.utils.formatEther(await dbxERC20.balanceOf(user3.address));
        await dbxERC20.connect(user3).approve(user1Reward.address, await dbxERC20.balanceOf(user3.address))
        await user3Reward.stake(await dbxERC20.balanceOf(user3.address))

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let amountStakeInFirstCycle = (await deb0xViews.connect(user2).getAccWithdrawableStake(user2.address));
        expect(amountStakeInFirstCycle).to.equal(stakeSecondCycle.add(stakeFirstCycle));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let amountStakeInSecoundCycleFirstAccount = ethers.utils.formatEther(await deb0xViews.connect(user1).getAccWithdrawableStake(user1.address));
        expect(amountStakeInFirtCycleFirstAccount).to.equal(amountStakeInSecoundCycleFirstAccount);

        let amountInSecoundCycle = ethers.utils.formatEther(BigNumber.from(await deb0xViews.connect(user2).getAccWithdrawableStake(user2.address)).sub(BigNumber.from(await user1Reward.rewardPerCycle(0))));
        expect(ethers.utils.formatEther(stakeSecondCycle)).to.equal(amountInSecoundCycle);

        let amountStakeInSecoundCycleThirdAccount = ethers.utils.formatEther(await deb0xViews.connect(user3).getAccWithdrawableStake(user3.address));
        expect(amountStakeInFirtCycleThirdAccount).to.equal(amountStakeInSecoundCycleThirdAccount);

    });

    it("Multiple stake from multiple accounts ", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user1Reward.claimRewards()
        let balanceUser1 = await dbxERC20.balanceOf(user1.address);
        await dbxERC20.connect(user1).approve(user1Reward.address, balanceUser1)
        await user1Reward.stake(balanceUser1)

        await user2Reward.claimRewards()
        let balanceUser2 = await dbxERC20.balanceOf(user2.address);
        await dbxERC20.connect(user2).approve(user1Reward.address, balanceUser2)
        await user2Reward.stake(balanceUser2)

        await user3Reward.claimRewards()
        let balanceUser3 = await dbxERC20.balanceOf(user3.address);
        await dbxERC20.connect(user3).approve(user1Reward.address, balanceUser3)
        await user3Reward.stake(balanceUser3)

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2])
        await hre.ethers.provider.send("evm_mine")

        let amountStakeInFirstCycleFirstAccount = ethers.utils.formatEther(await deb0xViews.connect(user1).getAccWithdrawableStake(user1.address));
        let amountStakeInFirstCycleSeconddAccount = ethers.utils.formatEther(await deb0xViews.connect(user2).getAccWithdrawableStake(user2.address));
        let amountStakeInFirstCycleThirdAccount = await deb0xViews.connect(user3).getAccWithdrawableStake(user3.address);
        expect(ethers.utils.formatEther(balanceUser1)).to.equal(amountStakeInFirstCycleFirstAccount);
        expect(ethers.utils.formatEther(balanceUser2)).to.equal(amountStakeInFirstCycleSeconddAccount);
        expect(balanceUser3).to.equal(amountStakeInFirstCycleThirdAccount);

        await user3Reward.claimRewards()
        let balanceUser3Cycle3 = await dbxERC20.balanceOf(user3.address);
        await dbxERC20.connect(user3).approve(user1Reward.address, balanceUser3Cycle3)
        await user3Reward.stake(balanceUser3Cycle3)
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2])
        await hre.ethers.provider.send("evm_mine")

        let amountRewardCycle3Account3 = ethers.utils.formatEther(NumUtils.day(2).div(2));
        let totalAmountStakeAccount3 = ethers.utils.formatEther(await deb0xViews.connect(user3).getAccWithdrawableStake(user3.address));
        let intermediateValueAccount3 = await deb0xViews.connect(user3).getAccWithdrawableStake(user3.address);
        expect(balanceUser3).to.equal(amountStakeInFirstCycleThirdAccount);

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 12])
        await hre.ethers.provider.send("evm_mine")

        await user3Reward.claimRewards()
        let balanceUser3Cycle20 = await dbxERC20.balanceOf(user3.address);
        await dbxERC20.connect(user3).approve(user1Reward.address, balanceUser3Cycle20)
        await user3Reward.stake(balanceUser3Cycle20)

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2])
        await hre.ethers.provider.send("evm_mine")

        let amountRewardCycle4Account3 = NumUtils.day(3).div(2);
        let amountRewardCycle5Account3 = NumUtils.day(4).div(2);
        let totalAmountStakeAccount3Cycle5 = await deb0xViews.connect(user3).getAccWithdrawableStake(user3.address);
        expect(balanceUser3.add(balanceUser3Cycle3)
            .add(balanceUser3Cycle20)).to.equal(totalAmountStakeAccount3Cycle5)
    });

    it("Multiple stake from multiple accounts ", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await user3Reward.claimRewards()
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        let balanceUser3 = await dbxERC20.balanceOf(user3.address);
        await dbxERC20.connect(user3).approve(user1Reward.address, balanceUser3)
        await user3Reward.stake(balanceUser3.div(4));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward.stake(balanceUser3.div(4));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        expect(await deb0xViews.getAccWithdrawableStake(user3.address)).to.equal(balanceUser3.div(4))
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        let partialStake = balanceUser3.div(4);
        let expectedStake = partialStake.mul(2);
        expect(await deb0xViews.getAccWithdrawableStake(user3.address)).to.equal(expectedStake)

    });

    it("Multiple stake from multiple accounts ", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await user3Reward.claimRewards()
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        let balanceUser3 = await dbxERC20.balanceOf(user3.address);
        await dbxERC20.connect(user3).approve(user1Reward.address, balanceUser3);
        await user3Reward.stake((balanceUser3).div(4));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward.stake((balanceUser3).div(4));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        let partialStake = (balanceUser3).div(4);
        expect(await deb0xViews.getAccWithdrawableStake(user3.address)).to.equal(partialStake)
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        let expectedStake = partialStake.mul(2);
        expect(await deb0xViews.getAccWithdrawableStake(user3.address)).to.equal(expectedStake)
        await deb0xViews.getAccWithdrawableStake(user3.address);
        let user3BalanceAfterStake = await dbxERC20.balanceOf(user3.address);
        // await user3Reward.claimFees();
        await deb0xViews.getUnclaimedFees(user3.address);
        // await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        // expect(user3BalanceAfterStake).to.equal(balanceUser3.div(2));
    });

    it("only for check ", async() => {
        await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await user3Reward.claimRewards()
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        let balanceUser3 = await dbxERC20.balanceOf(user3.address);
        await dbxERC20.connect(user3).approve(user1Reward.address, balanceUser3)
        await user3Reward.stake((balanceUser3).div(4));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward.stake((balanceUser3).div(4));
        await user3Reward.stake((balanceUser3).div(4));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        let partialStake = (balanceUser3).div(4);
        expect(await deb0xViews.getAccWithdrawableStake(user3.address)).to.equal(partialStake)
        await user2Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        let expectedStake = partialStake.mul(3);
        expect(await deb0xViews.getAccWithdrawableStake(user3.address)).to.equal(expectedStake)
        await deb0xViews.getAccWithdrawableStake(user3.address);
        await deb0xViews.getUnclaimedFees(user3.address);
        await user3Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await user3Reward.stake((balanceUser3).div(4));
        let actualBalanceForUSer3 = await dbxERC20.balanceOf(user3.address);
        expect(actualBalanceForUSer3).to.equal(0);
    });

});