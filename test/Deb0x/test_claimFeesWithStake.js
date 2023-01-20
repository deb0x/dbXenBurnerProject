const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/DBXenERC20.sol/DBXenERC20.json")
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);
const { NumUtils } = require("../utils/NumUtils.ts");

describe("Test fee claiming for users and concurrently stake/unstake", async function() {
    let rewardedAlice, rewardedBob, rewardedCarol, rewardedDean, dxnERC20;
    let alice, bob;
    beforeEach("Set enviroment", async() => {
        [alice, bob, carol, dean, messageReceiver, feeReceiver] = await ethers.getSigners();

        const DBXen = await ethers.getContractFactory("DBXen");
        rewardedAlice = await DBXen.deploy(ethers.constants.AddressZero);
        await rewardedAlice.deployed();

        const dbxAddress = await rewardedAlice.dbx()
        dxnERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        const DBXenViews = await ethers.getContractFactory("DBXenViews");
        deb0xViews = await DBXenViews.deploy(rewardedAlice.address);
        await deb0xViews.deployed();

        rewardedBob = rewardedAlice.connect(bob)
        rewardedCarol = rewardedAlice.connect(carol)
        rewardedDean = rewardedAlice.connect(dean)
    });

    it("Multiple stake and unclaimed fee action ", async() => {
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await rewardedBob.claimRewards()
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        let balanceUser3 = await dxnERC20.balanceOf(bob.address);
        await dxnERC20.connect(bob).approve(rewardedBob.address, balanceUser3)
        await rewardedBob.stake(balanceUser3.div(4));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob.stake(balanceUser3.div(4));

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await deb0xViews.getAccWithdrawableStake(bob.address);
        expect(await deb0xViews.getAccWithdrawableStake(bob.address)).to.equal(NumUtils.day(1).div(2))

        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await deb0xViews.getAccWithdrawableStake(bob.address);
        expect(await deb0xViews.getAccWithdrawableStake(bob.address)).to.equal(NumUtils.day(1).div(2))

        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("1") })
        await deb0xViews.getUnclaimedFees(bob.address);
        expect(await dxnERC20.balanceOf(rewardedBob.address)).to.equal(NumUtils.day(1).div(2))
    });

});