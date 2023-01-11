const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { NumUtils } = require("../utils/NumUtils.ts");
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Test fee claiming for users/frontends without concurrently staking/unstaking", async function() {
    let rewardedAlice, rewardedBob, rewardedCarol, frontend, dbxERC20;
    let alice, bob;
    beforeEach("Set enviroment", async() => {
        [alice, bob, carol, messageReceiver, feeReceiver] = await ethers.getSigners();

        const Deb0x = await ethers.getContractFactory("Deb0x");
        rewardedAlice = await Deb0x.deploy(ethers.constants.AddressZero);
        await rewardedAlice.deployed();

        const dbxAddress = await rewardedAlice.dbx()
        dbxERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        rewardedBob = rewardedAlice.connect(bob)
        rewardedCarol = rewardedAlice.connect(carol)
        frontend = rewardedAlice.connect(feeReceiver)
    });

    it(`
  5 ether gathered as fees should be fully distributed back to users/frontends
  `, async() => {

        const aliceBalance = await hre.ethers.provider.getBalance(alice.address)
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("1") })

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            feeReceiver.address, 100, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")


        await rewardedAlice.claimFees()
        await rewardedBob.claimFees()
        await frontend.claimClientFees();
        const feesClaimed = await rewardedAlice.queryFilter("FeesClaimed")
        const feesClaimedAsFrontend = await frontend.queryFilter("ClientFeesClaimed");
        let totalFeesClaimedFrontend = BigNumber.from("0")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        for (let entry of feesClaimedAsFrontend) {
            totalFeesClaimedFrontend = totalFeesClaimedFrontend.add(entry.args.fees)
        }
        const feesCollected = await rewardedAlice.cycleAccruedFees(0);

        const remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);
        expect(totalFeesClaimed.add(remainder).add(totalFeesClaimedFrontend)).to.equal(feesCollected)
    });

    it(`
  5 ether gathered as fees should be fully distributed back to users/frontends
  `, async() => {

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload],
            ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimFees()
        await rewardedBob.claimFees()
        const feesClaimed = await rewardedAlice.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = await rewardedAlice.cycleAccruedFees(0);

        const remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected)
    });

    it(`
  4 ether gathered as fees should be fully distributed back to users
  `, async() => {

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })


        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimFees()
        await rewardedBob.claimFees()
        await rewardedCarol.claimFees()
        const feesClaimed = await rewardedAlice.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = (await rewardedAlice.cycleAccruedFees(0)).add(await rewardedAlice.cycleAccruedFees(1));

        const remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected)
    });

    it(`
  6 ether gathered as fees should be fully distributed back to users
  `, async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })


        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await rewardedAlice.claimFees()

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedBob.claimFees()
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })


        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")


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
            .add(await rewardedAlice.cycleAccruedFees(2))
            .add(await rewardedAlice.cycleAccruedFees(3));

        const remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected)
    });

    it("11 ether gathered as fees should be fully distributed back to userss", async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedCarol["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedCarol.claimRewards()
        let CarolRewarClaimed = BigNumber.from("0")
        const rewardClaimed = await rewardedCarol.queryFilter("RewardsClaimed")
        for (let entry of rewardClaimed) {
            CarolRewarClaimed = CarolRewarClaimed.add(entry.args.reward)
        }
        expect(NumUtils.day(1).div(2)).to.equal(CarolRewarClaimed)

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
        expect(totalFeesClaimed.add(remainder)).to.equal(feesCollected)
    });

});