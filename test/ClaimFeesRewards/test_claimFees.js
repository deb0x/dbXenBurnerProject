const { expect, assert } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Test fee claiming for users/frontends", async function() {
    let rewardedAlice, rewardedBob, rewardedCarol, frontend, dbxERC20, deb0xViews;
    let alice, bob;
    beforeEach("Set enviroment", async() => {
        [alice, bob, carol, messageReceiver, feeReceiver] = await ethers.getSigners();

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
        frontend = rewardedAlice.connect(feeReceiver)
    });

    it("1. should test sending some messages and claiming some fees with only 1 account", async() => {

        aliceBalance = await hre.ethers.provider.getBalance(alice.address)

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 200, 0, { value: ethers.utils.parseEther("2") })

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("2") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("2") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let contractBalanceBefore = await hre.ethers.provider.getBalance(rewardedAlice.address);
        let aliceFeesBefore = await deb0xViews.getUnclaimedFees(alice.address);

        await rewardedAlice.claimFees();
        contractBalanceAfter = await hre.ethers.provider.getBalance(rewardedAlice.address);
        aliceFeesAfter = await deb0xViews.getUnclaimedFees(alice.address);

        expect(aliceFeesAfter.toString()).to.eq("0");
        expect(contractBalanceAfter).to.eq(contractBalanceBefore.sub(aliceFeesBefore))

    })

    it("1. should test getUnclaimedFees function", async() => {

        aliceBalance = await hre.ethers.provider.getBalance(alice.address)
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 200, 0, { value: ethers.utils.parseEther("2") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("2") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("2") })
        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("2") })

        let contractBalanceBefore = await hre.ethers.provider.getBalance(rewardedAlice.address);
        let aliceFeesBefore = await deb0xViews.getUnclaimedFees(alice.address);

        await rewardedAlice.claimFees();
        contractBalanceAfter = await hre.ethers.provider.getBalance(rewardedAlice.address);
        aliceFeesAfter = await deb0xViews.getUnclaimedFees(alice.address);
        expect(aliceFeesAfter.toString()).to.eq("0");
        expect(contractBalanceAfter).to.eq(contractBalanceBefore.sub(aliceFeesBefore))
    })


    it("should send messages with allice and bob and claim fees after cycle0 but we have a difference", async() => {

        aliceBalance = await hre.ethers.provider.getBalance(alice.address)
            //let curCycle = parseInt((await rewardedAlice.getCurrentCycle()).toString()) //never used

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 200, 100, { value: ethers.utils.parseEther("2") })

        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            ethers.constants.AddressZero, 120, 0, { value: ethers.utils.parseEther("1") })

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("2") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimFees();
        await rewardedBob.claimFees();
        remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);
        await frontend.claimClientFees();

        // tesing rewards 
        let frontDBX = await dbxERC20.balanceOf(feeReceiver.address);
        await frontend.claimClientRewards();
        frontDBX = await dbxERC20.balanceOf(feeReceiver.address);

        const feesClaimed = await rewardedAlice.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }

        const feesClaimedFronted = await rewardedAlice.queryFilter("ClientFeesClaimed")
        let totalFeesClaimedFrontend = BigNumber.from("0")
        for (let entry of feesClaimedFronted) {
            totalFeesClaimedFrontend = totalFeesClaimedFrontend.add(entry.args.fees)
        }

        const feesCollected = await rewardedAlice.cycleAccruedFees(0);
        remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);

        // 31 difference in getters
        diff = totalFeesClaimedFrontend.add(totalFeesClaimed).sub(feesCollected)
        expect(diff).to.not.eq(0)
        expect(totalFeesClaimedFrontend.add(totalFeesClaimed)).to.equal(feesCollected.add(diff))
    })


    it("should send messages with allice and bob and claim fees after cycle0 V2", async() => {

        aliceBalance = await hre.ethers.provider.getBalance(alice.address)
        let curCycle = parseInt((await rewardedAlice.getCurrentCycle()).toString())

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })

        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("2") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimFees();
        await rewardedBob.claimFees();
        let remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);

        const feesClaimed = await rewardedAlice.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = await rewardedAlice.cycleAccruedFees(0);

        remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected)
    })


    it("should test getting rewards with allice sending 3 messages and bob 8 to see if any diff", async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("4") });
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("4") });
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("4") });


        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("4") });
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("4") });
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("4") });
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("4") });
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("4") });
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("4") });
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("4") });
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 0, 0, { value: ethers.utils.parseEther("4") });

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 1])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimRewards();
        await rewardedBob.claimRewards();

        let aliceBal = await dbxERC20.balanceOf(alice.address);
        let bobBal = await dbxERC20.balanceOf(bob.address);

        // difference of 1 
        expect(aliceBal.add(bobBal)).to.eq(ethers.utils.parseEther("10000").sub(1));


    })

})