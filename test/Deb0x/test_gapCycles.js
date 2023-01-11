const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Test contract functionalities while having cycles with no messages sent", async function() {
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


    it("Should claim rewards from first day", async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [2 * 60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimRewards()
        expect(await dbxERC20.balanceOf(alice.address)).to.equal(ethers.utils.parseEther("7500"))

        await hre.ethers.provider.send("evm_increaseTime", [2 * 60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedBob.claimRewards()
        expect(await dbxERC20.balanceOf(bob.address)).to.equal(ethers.utils.parseEther("2500"))
    });

    it("Should be able to claim previous cycle rewards and not reset current messages counter", async() => {
        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedBob["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimRewards()
        await rewardedBob.claimRewards()
        expect(await dbxERC20.balanceOf(bob.address)).to.equal(ethers.utils.parseEther("9980.039920159680638722"))
        expect(await dbxERC20.balanceOf(alice.address)).to.equal(ethers.utils.parseEther("19960.119680798084469782"))
    });

    it(`
  5 ether gathered as fees should be fully distributed back to users/frontends
  `, async() => {

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

        await hre.ethers.provider.send("evm_increaseTime", [2 * 60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await frontend.claimClientFees();

        await hre.ethers.provider.send("evm_increaseTime", [2 * 60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")
        await rewardedAlice.claimFees()
        await rewardedBob.claimFees()

        const feesClaimed = await rewardedAlice.queryFilter("FeesClaimed")
        let totalFeesClaimed = BigNumber.from("0")
        for (let entry of feesClaimed) {
            totalFeesClaimed = totalFeesClaimed.add(entry.args.fees)
        }
        const feesCollected = await rewardedAlice.cycleAccruedFees(0);

        let totalFeesClaimedFrontend = BigNumber.from("0")
        const feesClaimedAsFrontend = await frontend.queryFilter("ClientFeesClaimed");
        for (let entry of feesClaimedAsFrontend) {
            totalFeesClaimedFrontend = totalFeesClaimedFrontend.add(entry.args.fees)
        }

        const remainder = await hre.ethers.provider.getBalance(rewardedAlice.address);
        expect(totalFeesClaimed.add(remainder).add(totalFeesClaimedFrontend)).to.equal(feesCollected)
    });

    it("Should claim ~99.81 tokens despite gaps before and after sending message", async() => {
        await hre.ethers.provider.send("evm_increaseTime", [2 * 60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        const aliceBalance = await hre.ethers.provider.getBalance(alice.address)
        const tx = await rewardedAlice["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("100") })
        const receipt = await tx.wait()
        const aliceBalanceAfterSend = await hre.ethers.provider.getBalance(alice.address)
        const txCostPlusFees = aliceBalance.sub(aliceBalanceAfterSend)
        const txCost = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice)
        const txCostEstimate = txCost.add(txCost.div(BigNumber.from("10")))
        await hre.ethers.provider.send("evm_increaseTime", [2 * 60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        await rewardedAlice.claimRewards()
        expect(await dbxERC20.balanceOf(alice.address)).to.equal(ethers.utils.parseEther("9980.039920159680638722"))
    });
});